import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
  readConfig,
  writeConfig,
  resolveConfig,
  keySignupUrl,
  DEFAULT_BASE_URL,
  type KnowDriveConfig,
} from "./config.js";

/**
 * Never throws. Falls back to an interactive prompt (or, if stdin isn't a
 * TTY, prints the signup URL and exits cleanly) rather than letting a
 * missing key surface as a stack trace — that's where installs die.
 *
 * `baseUrlOverride` comes from `--host`. It matters for more than routing:
 * API keys are audience-scoped per host, so the key this prompts for has to
 * be minted on the same host the bridge will talk to.
 */
export async function ensureAuth(baseUrlOverride?: string): Promise<KnowDriveConfig> {
  const existing = resolveConfig(baseUrlOverride);
  if (existing) return existing;

  const baseUrl = baseUrlOverride ?? DEFAULT_BASE_URL;
  const isDefaultHost = baseUrl === DEFAULT_BASE_URL;
  const signupUrl = keySignupUrl(baseUrl);
  const hostNote = isDefaultHost ? "" : ` for ${baseUrl}`;
  // Not every deployment mints its own keys — some share the main account.
  const fallbackNote = isDefaultHost
    ? ""
    : `\n(if that page isn't available on this deployment, use ${keySignupUrl(DEFAULT_BASE_URL)})`;

  if (!stdin.isTTY) {
    console.error(
      [
        `KnowDrive: no API key found${hostNote}.`,
        `Generate one at ${signupUrl}${fallbackNote}`,
        "Then either:",
        "  - set KNOWDRIVE_API_KEY in your MCP client's env config, or",
        "  - run `npx -y @knowdrive/mcp` once in a terminal to store it locally.",
      ].join("\n")
    );
    process.exit(1);
  }

  console.error(`KnowDrive: no API key found${hostNote}. Generate one at ${signupUrl}${fallbackNote}`);
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const apiKey = (await rl.question("Paste your KnowDrive API key: ")).trim();
    if (!apiKey) {
      console.error("No key entered — exiting.");
      process.exit(1);
    }
    const config: KnowDriveConfig = { apiKey, baseUrl };
    writeConfig(config);
    console.error(`Saved to ~/.knowdrive/config.json`);
    return config;
  } finally {
    rl.close();
  }
}

export { readConfig };
