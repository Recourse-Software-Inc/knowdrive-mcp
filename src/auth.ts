import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readConfig, writeConfig, resolveConfig, DEFAULT_BASE_URL, type KnowDriveConfig } from "./config.js";

const KEY_SIGNUP_URL = "https://knowdrive.ai/keys";

/**
 * Never throws. Falls back to an interactive prompt (or, if stdin isn't a
 * TTY, prints the signup URL and exits cleanly) rather than letting a
 * missing key surface as a stack trace — that's where installs die.
 */
export async function ensureAuth(): Promise<KnowDriveConfig> {
  const existing = resolveConfig();
  if (existing) return existing;

  if (!stdin.isTTY) {
    console.error(
      [
        "KnowDrive: no API key found.",
        `Generate one at ${KEY_SIGNUP_URL}, then either:`,
        "  - set KNOWDRIVE_API_KEY in your MCP client's env config, or",
        "  - run `npx -y @knowdrive/mcp` once in a terminal to store it locally.",
      ].join("\n")
    );
    process.exit(1);
  }

  console.error(`KnowDrive: no API key found. Generate one at ${KEY_SIGNUP_URL}`);
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const apiKey = (await rl.question("Paste your KnowDrive API key: ")).trim();
    if (!apiKey) {
      console.error("No key entered — exiting.");
      process.exit(1);
    }
    const config: KnowDriveConfig = { apiKey, baseUrl: DEFAULT_BASE_URL };
    writeConfig(config);
    console.error(`Saved to ~/.knowdrive/config.json`);
    return config;
  } finally {
    rl.close();
  }
}

export { readConfig };
