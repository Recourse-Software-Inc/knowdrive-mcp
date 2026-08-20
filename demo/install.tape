# Renders demo/install.gif for the README.
# Run with: vhs demo/install.tape
#
# Runs in a scratch $HOME (set below) so it never touches your real
# Claude Desktop config, and uses an obviously-fake key so nothing
# sensitive ends up in a GIF that gets committed to a public repo.
#
# The "# ..." lines typed into the terminal below are comments for
# whoever's watching the GIF, not instructions to bash -- they explain
# each step in plain terms instead of leaving the viewer to guess.

Output demo/install.gif

Set Shell "bash"
Set FontSize 22
Set Width 1300
Set Height 700
Set Theme "Dracula"
Set TypingSpeed 40ms
Set Padding 24

Hide
Type "export HOME=/tmp/knowdrive-mcp-demo-home && rm -rf $HOME && mkdir -p $HOME && clear"
Enter
Sleep 500ms
Show

Type "# Step 1: you need a KnowDrive API key. Get a free account at knowdrive.ai,"
Enter
Type "# then get the key at https://knowdrive.ai/developer-keys/"
Enter
Type "export KNOWDRIVE_API_KEY=kd_demo_xxxxxxxxxxxxxxxxxxxx"
Sleep 800ms
Enter
Sleep 1s

Type "# Step 2: one command wires it into Claude Desktop's config."
Enter
Type "npx -y @knowdrive/mcp --install claude-desktop"
Sleep 800ms
Enter
Sleep 4s

Type "# Step 3: it patched Claude Desktop's config file -- here's what it wrote."
Enter
Type "cat ~/Library/Application\ Support/Claude/claude_desktop_config.json"
Sleep 800ms
Enter
Sleep 4s

Type "# Restart Claude Desktop. It now has a 'knowdrive' MCP server configured."
Enter
Sleep 6s
