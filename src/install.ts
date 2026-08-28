import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { DEFAULT_BASE_URL } from "./config.js";

interface ClientTarget {
  id: string;
  label: string;
  configPath: string;
  /** Path to the object that holds `{ "<name>": { command, args, env } }` entries. */
  serversKey: string;
}

function claudeDesktopConfigPath(): string {
  const home = homedir();
  switch (platform()) {
    case "darwin":
      return join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
    case "win32":
      return join(process.env.APPDATA ?? join(home, "AppData", "Roaming"), "Claude", "claude_desktop_config.json");
    default:
      return join(home, ".config", "Claude", "claude_desktop_config.json");
  }
}

export function knownClients(): ClientTarget[] {
  const home = homedir();
  return [
    { id: "claude-desktop", label: "Claude Desktop", configPath: claudeDesktopConfigPath(), serversKey: "mcpServers" },
    { id: "cursor", label: "Cursor", configPath: join(home, ".cursor", "mcp.json"), serversKey: "mcpServers" },
    { id: "claude-code", label: "Claude Code", configPath: join(home, ".claude.json"), serversKey: "mcpServers" },
  ];
}

/**
 * The client launches this with a bare environment, so anything the bridge
 * needs has to be written into the entry itself. Omitting the host when it's
 * the default keeps the common config clean; carrying it when it isn't is the
 * difference between reaching your host and silently hitting production.
 */
function serverEntry(apiKey: string, baseUrl: string) {
  const env: Record<string, string> = { KNOWDRIVE_API_KEY: apiKey };
  if (baseUrl !== DEFAULT_BASE_URL) env.KNOWDRIVE_BASE_URL = baseUrl;
  return {
    command: "npx",
    args: ["-y", "@knowdrive/mcp"],
    env,
  };
}

/**
 * Merges a `knowdrive` entry into the target client's MCP config, backing up
 * whatever was there first. Reads the existing JSON rather than overwriting
 * it wholesale so other servers the user already configured survive.
 */
export function installToClient(
  clientId: string,
  apiKey: string,
  baseUrl: string = DEFAULT_BASE_URL
): { configPath: string; backupPath: string | null } {
  const target = knownClients().find((c) => c.id === clientId);
  if (!target) {
    const ids = knownClients().map((c) => c.id).join(", ");
    throw new Error(`Unknown client "${clientId}". Supported: ${ids}`);
  }

  let existing: Record<string, unknown> = {};
  let backupPath: string | null = null;
  if (existsSync(target.configPath)) {
    const raw = readFileSync(target.configPath, "utf8");
    try {
      existing = raw.trim() ? JSON.parse(raw) : {};
    } catch {
      throw new Error(
        `${target.configPath} exists but isn't valid JSON — fix or remove it, then re-run --install ${clientId}.`
      );
    }
    backupPath = `${target.configPath}.bak-${Date.now()}`;
    copyFileSync(target.configPath, backupPath);
  } else {
    mkdirSync(dirname(target.configPath), { recursive: true });
  }

  const servers = (existing[target.serversKey] as Record<string, unknown> | undefined) ?? {};
  servers["knowdrive"] = serverEntry(apiKey, baseUrl);
  existing[target.serversKey] = servers;

  writeFileSync(target.configPath, JSON.stringify(existing, null, 2) + "\n");
  return { configPath: target.configPath, backupPath };
}
