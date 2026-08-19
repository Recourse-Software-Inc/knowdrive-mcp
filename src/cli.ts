#!/usr/bin/env node
import { ensureAuth } from "./auth.js";
import { runServer } from "./server.js";
import { installToClient, knownClients } from "./install.js";
import { resolveConfig } from "./config.js";

const HELP = `knowdrive-mcp — run a local MCP server backed by your KnowDrive KnowDB

Usage:
  npx -y @knowdrive/mcp                    Start the MCP server (stdio)
  npx -y @knowdrive/mcp --install <client> Patch a client's config to launch it automatically
  npx -y @knowdrive/mcp --help             Show this help

Supported --install targets:
  ${knownClients().map((c) => `${c.id.padEnd(15)} ${c.label}`).join("\n  ")}

Auth:
  Set KNOWDRIVE_API_KEY in the environment, or run this once interactively
  and it will prompt for a key and save it to ~/.knowdrive/config.json.
  Generate a key at https://knowdrive.ai/keys
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  const installIndex = args.indexOf("--install");
  if (installIndex !== -1) {
    const clientId = args[installIndex + 1];
    if (!clientId) {
      console.error(`--install needs a target: ${knownClients().map((c) => c.id).join(", ")}`);
      process.exit(1);
    }
    const config = await ensureAuth();
    try {
      const { configPath, backupPath } = installToClient(clientId, config.apiKey);
      console.log(`Installed KnowDrive into ${configPath}`);
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
  const config = resolveConfig() ?? (await ensureAuth());
  await runServer(config);
}

main().catch((err) => {
  console.error(`KnowDrive: unexpected error — ${(err as Error).message}`);
  process.exit(1);
});
