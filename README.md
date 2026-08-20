# @knowdrive/mcp

One command gives any MCP client — Claude Desktop, Claude Code, Cursor — memory
backed by your [KnowDrive](https://knowdrive.ai) KnowDB:

```bash
npx -y @knowdrive/mcp
```

![Installing @knowdrive/mcp into Claude Desktop with one command](demo/install.gif)

No manual JSON editing required. `@knowdrive/mcp` is a thin stdio↔HTTP bridge:
your MCP client talks stdio to this process, this process talks Streamable
HTTP to your KnowDB, carrying your API key. All the real tools — search,
ingest, file management — live on the KnowDrive side, so this package stays
tiny and new tools show up automatically without an update.

## 1-click install

```bash
npx -y @knowdrive/mcp --install claude-desktop
npx -y @knowdrive/mcp --install cursor
npx -y @knowdrive/mcp --install claude-code
```

This merges a `knowdrive` entry into the client's MCP config (backing up
whatever was there first) and prompts for an API key the first time, saving
it to `~/.knowdrive/config.json`. Restart the client afterward.

## Manual setup

Get a free account at [knowdrive.ai](https://knowdrive.ai), then get a key at
[knowdrive.ai/developer-keys](https://knowdrive.ai/developer-keys/). Then either:

- run `npx -y @knowdrive/mcp` once in a terminal and paste it when prompted, or
- set `KNOWDRIVE_API_KEY` directly in your client's server config:

```json
{
  "mcpServers": {
    "knowdrive": {
      "command": "npx",
      "args": ["-y", "@knowdrive/mcp"],
      "env": { "KNOWDRIVE_API_KEY": "kd_..." }
    }
  }
}
```

## Environment variables

| Variable              | Purpose                                             |
| ---------------------- | ---------------------------------------------------- |
| `KNOWDRIVE_API_KEY`    | API key. Takes priority over the saved config file. |
| `KNOWDRIVE_BASE_URL`   | Override the KnowDrive host (default `https://dev.knowdrive.ai`). |
| `KNOWDRIVE_MCP_PATH`   | Override the remote MCP path (default `/api/v1/mcp`). |

## Development

```bash
npm install
npm run build
node dist/cli.js --help
node scripts/smoke-test.mjs   # connects the built server to the real KnowDB and lists its tools
vhs demo/install.tape         # re-render demo/install.gif (brew install vhs)
```
