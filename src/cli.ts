#!/usr/bin/env node
import { ensureAuth } from "./auth.js";
import { runServer } from "./server.js";
import { installToClient, knownClients } from "./install.js";
import { resolveConfig, normalizeBaseUrl, DEFAULT_BASE_URL } from "./config.js";

const HELP = `knowdrive-mcp — run a local MCP server backed by your KnowDrive KnowDB

Usage:
  npx -y @knowdrive/mcp                    Start the MCP server (stdio)
  npx -y @knowdrive/mcp --install <client> Patch a client's config to launch it automatically
  npx -y @knowdrive/mcp --host <host>      Target a different KnowDrive deployment
  npx -y @knowdrive/mcp --help             Show this help

Supported --install targets:
  ${knownClients().map((c) => `${c.id.padEnd(15)} ${c.label}`).join("\n  ")}

Host:
  Defaults to ${DEFAULT_BASE_URL}. Pass --host to point at another deployment
  (a bare hostname is fine — it's treated as https):

    npx -y @knowdrive/mcp --host public.knowdrive.ai --install claude-desktop

  Combined with --install, the host is written into the client config, so the
  installed server keeps talking to it. Keys are issued per deployment, so a
  key minted on one host may not authenticate against another.

Auth:
  Set KNOWDRIVE_API_KEY in the environment, or run this once interactively
  and it will prompt for a key and save it to ~/.knowdrive/config.json.
  Generate a key at <host>/developer-keys/
`;

/** Supports both `--host value` and `--host=value`. Returns undefined when the
 *  flag is absent; throws with a usable message when it's present but empty. */
function parseHostFlag(args: string[]): string | undefined {
  const inline = args.find((a) => a.startsWith("--host="));
  if (inline) return normalizeBaseUrl(inline.slice("--host=".length));

  const i = args.indexOf("--host");
  if (i === -1) return undefined;

  const value = args[i + 1];
  if (!value || value.startsWith("-")) {
    throw new Error("--host needs a value, e.g. --host public.knowdrive.ai");
  }
  return normalizeBaseUrl(value);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  let host: string | undefined;
  try {
    host = parseHostFlag(args);
  } catch (err) {
    console.error(`KnowDrive: ${(err as Error).message}`);
    process.exit(1);
  }

  const installIndex = args.indexOf("--install");
  if (installIndex !== -1) {
    const clientId = args[installIndex + 1];
    if (!clientId || clientId.startsWith("-")) {
      console.error(`--install needs a target: ${knownClients().map((c) => c.id).join(", ")}`);
      process.exit(1);
    }
    const config = await ensureAuth(host);
    try {
      const { configPath, backupPath } = installToClient(clientId, config.apiKey, config.baseUrl);
      console.log(`Installed KnowDrive into ${configPath}`);
      if (config.baseUrl !== DEFAULT_BASE_URL) console.log(`Host: ${config.baseUrl}`);
      if (backupPath) console.log(`(previous config backed up to ${backupPath})`);
      console.log("Restart the client to pick it up.");
    } catch (err) {
      console.error(`KnowDrive: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  // Config resolution happens before the interactive prompt so a client
  // launching this over stdio with KNOWDRIVE_API_KEY already set never
  // blocks on a question nobody can answer.
  const config = resolveConfig(host) ?? (await ensureAuth(host));
  await runServer(config);
}

main().catch((err) => {
  console.error(`KnowDrive: unexpected error — ${(err as Error).message}`);
  process.exit(1);
});
