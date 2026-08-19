import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";

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

function serverEntry(apiKey: string) {
  return {
    command: "npx",
    args: ["-y", "@knowdrive/mcp"],
    env: { KNOWDRIVE_API_KEY: apiKey },
  };
}

/**
 * Merges a `knowdrive` entry into the target client's MCP config, backing up
 * whatever was there first. Reads the existing JSON rather than overwriting
 * it wholesale so other servers the user already configured survive.
 */
export function installToClient(clientId: string, apiKey: string): { configPath: string; backupPath: string | null } {
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
  servers["knowdrive"] = serverEntry(apiKey);
  existing[target.serversKey] = servers;

  writeFileSync(target.configPath, JSON.stringify(existing, null, 2) + "\n");
  return { configPath: target.configPath, backupPath };
}
