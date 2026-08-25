import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface KnowDriveConfig {
  apiKey: string;
  baseUrl: string;
}

const DEFAULT_BASE_URL = "https://knowdrive.ai";

export const CONFIG_DIR = join(homedir(), ".knowdrive");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export function readConfig(): KnowDriveConfig | null {
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    if (!raw.apiKey) return null;
    return { apiKey: raw.apiKey, baseUrl: raw.baseUrl ?? DEFAULT_BASE_URL };
  } catch {
    return null;
  }
}

export function writeConfig(config: KnowDriveConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function resolveConfig(): KnowDriveConfig | null {
  const envKey = process.env.KNOWDRIVE_API_KEY;
  if (envKey) {
    return { apiKey: envKey, baseUrl: process.env.KNOWDRIVE_BASE_URL ?? DEFAULT_BASE_URL };
  }
  return readConfig();
}

export { DEFAULT_BASE_URL };
