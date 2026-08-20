import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { KnowDriveConfig } from "./config.js";

// Read from package.json rather than hardcoding, so a version bump can't
// silently drift out of sync with what the MCP handshake reports.
const PKG_VERSION: string = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8")
).version;

/**
 * knowdrive-mcp is a thin stdio<->HTTP bridge: your MCP client talks stdio
 * to this process, this process talks Streamable HTTP to your KnowDrive
 * KnowDB, carrying your API key. No tool logic lives here — that keeps this
 * package (and its `npx` install) tiny, and means new KnowDB tools show up
 * automatically without a package update.
 */
export async function runServer(config: KnowDriveConfig): Promise<void> {
  const remoteUrl = new URL(process.env.KNOWDRIVE_MCP_PATH ?? "/api/v1/mcp", config.baseUrl);

  const remote = new Client({ name: "knowdrive-mcp-bridge", version: PKG_VERSION }, { capabilities: {} });
  const remoteTransport = new StreamableHTTPClientTransport(remoteUrl, {
    requestInit: { headers: { "X-API-TOKEN": config.apiKey } },
  });

  try {
    await remote.connect(remoteTransport);
  } catch (err) {
    console.error(
      `KnowDrive: couldn't reach ${remoteUrl} (${(err as Error).message}). ` +
        `Check your network connection and that KNOWDRIVE_BASE_URL is correct.`
    );
    process.exit(1);
  }

  const local = new Server({ name: "knowdrive", version: PKG_VERSION }, { capabilities: { tools: {} } });

  local.setRequestHandler(ListToolsRequestSchema, async () => remote.listTools());
  local.setRequestHandler(CallToolRequestSchema, async (request) => remote.callTool(request.params));

  const localTransport = new StdioServerTransport();
  await local.connect(localTransport);
}
