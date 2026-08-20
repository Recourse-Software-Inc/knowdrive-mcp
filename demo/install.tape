# Renders demo/install.gif for the README.
# Run with: vhs demo/install.tape
# Runs in a scratch $HOME (set below) so it never touches your real
# Claude Desktop config, and uses an obviously-fake key so nothing
# sensitive ends up in a GIF that gets committed to a public repo.

Output demo/install.gif

Set Shell "bash"
Set FontSize 20
Set Width 1200
Set Height 600
Set Theme "Dracula"
Set TypingSpeed 45ms
Set Padding 20

Hide
Type "export HOME=/tmp/knowdrive-mcp-demo-home && rm -rf $HOME && mkdir -p $HOME && clear"
Enter
Sleep 500ms
Show

Type "export KNOWDRIVE_API_KEY=kd_demo_xxxxxxxxxxxxxxxxxxxx"
Sleep 500ms
Enter
Sleep 300ms

Type "npx -y @knowdrive/mcp --install claude-desktop"
Sleep 500ms
Enter
Sleep 4s

Type "cat ~/Library/Application\ Support/Claude/claude_desktop_config.json"
Sleep 500ms
Enter
Sleep 3s

Type "# restart Claude Desktop and it has memory."
Sleep 2s
