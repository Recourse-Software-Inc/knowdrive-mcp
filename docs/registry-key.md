# MCP Registry namespace key (`ai.knowdrive/*`)

The official MCP Registry lists this server as **`ai.knowdrive/knowdrive-mcp`**. A domain-based name needs proof that we control `knowdrive.ai`. That proof is an Ed25519 key pair:

- **Public half:** a TXT record at the **apex** of `knowdrive.ai` (GoDaddy DNS):

  ```
  v=MCPv1; k=ed25519; p=<base64 public key>
  ```

- **Private half:** the repo secret **`MCP_REGISTRY_PRIVATE_KEY`**, as hex. `.github/workflows/release.yml` uses it to run `mcp-publisher login dns --domain knowdrive.ai` on every release.

The TXT record sits alongside the other apex TXT records (SPF, site verifications). Add it with an *append* (`gddy dns add`), never a replace (`gddy dns set`): replacing all `@` TXT records would drop SPF.

## Rotating the key

Generate it with OpenSSL 3 (macOS's LibreSSL can't):

```sh
openssl genpkey -algorithm Ed25519 -out key.pem
```

- **New TXT value:** `echo "v=MCPv1; k=ed25519; p=$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"`
- **New secret:** `openssl pkey -in key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n' | gh secret set MCP_REGISTRY_PRIVATE_KEY -R Recourse-Software-Inc/knowdrive-mcp`

Steps:

1. Add the new TXT record alongside the old one.
2. Update the secret.
3. Release once.
4. Delete the old TXT record.

Never commit `key.pem`.

## Releasing

1. Bump `package.json` `version`, `server.json` `version` and `server.json` `packages[0].version` to the same `X.Y.Z`.
2. Commit, then `git tag vX.Y.Z && git push origin main vX.Y.Z`.

The workflow refuses to publish if the three versions or `mcpName` / `name` disagree. It publishes npm first, because the registry checks the npm package's `mcpName`. It then publishes to the registry and creates the GitHub release.
