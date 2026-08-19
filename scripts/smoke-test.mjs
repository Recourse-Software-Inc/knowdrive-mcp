import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "smoke-test", version: "0.0.0" }, { capabilities: {} });
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/cli.js"],
  env: { ...process.env },
});

await client.connect(transport);
const tools = await client.listTools();
console.log(`Connected. Remote exposed ${tools.tools.length} tools via the bridge.`);
console.log(tools.tools.slice(0, 5).map((t) => t.name));
await client.close();
