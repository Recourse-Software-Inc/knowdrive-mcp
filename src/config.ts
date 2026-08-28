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

/**
 * Accepts a bare host ("public.knowdrive.ai") as well as a full URL, and
 * reduces either to an origin. Bare hosts are the common case on the command
 * line, and silently treating one as a relative path would point the bridge
 * somewhere surprising.
 */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("--host needs a value, e.g. --host public.knowdrive.ai");

  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(`"${raw}" isn't a valid host or URL — try something like public.knowdrive.ai`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`--host must be http or https, got "${url.protocol}//"`);
  }
  // URL parsing is lenient enough that "ht!tp://nope" yields hostname "ht!tp",
  // which would otherwise sail through and point the bridge at nothing.
  const isIpv6 = /^\[[0-9a-fA-F:.]+\]$/.test(url.hostname);
  const isHostname = /^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    url.hostname
  );
  if (!isIpv6 && !isHostname) {
    throw new Error(`"${raw}" isn't a valid host or URL — try something like public.knowdrive.ai`);
  }
  return url.origin;
}

/** Where this host's API keys are minted. Keys are audience-scoped per host,
 *  so a prod key will not authenticate against dev or public. */
export function keySignupUrl(baseUrl: string): string {
  return `${baseUrl}/developer-keys/`;
}

/**
 * Precedence: explicit --host, then KNOWDRIVE_BASE_URL, then whatever host the
 * saved config was written against, then the default. The saved baseUrl is
 * consulted even when the key comes from the environment, so setting only
 * KNOWDRIVE_API_KEY doesn't silently relocate an existing non-default install.
 */
export function resolveConfig(baseUrlOverride?: string): KnowDriveConfig | null {
  const saved = readConfig();
  const envBase = process.env.KNOWDRIVE_BASE_URL;
  const baseUrl =
    baseUrlOverride ??
    (envBase ? normalizeBaseUrl(envBase) : undefined) ??
    saved?.baseUrl ??
    DEFAULT_BASE_URL;

  const apiKey = process.env.KNOWDRIVE_API_KEY ?? saved?.apiKey;
  if (!apiKey) return null;
  return { apiKey, baseUrl };
}

export { DEFAULT_BASE_URL };
