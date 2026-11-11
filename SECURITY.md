# Security policy

## Reporting a vulnerability

Email **security@recoursellm.com**. Please don't open a public issue for a security problem.

Include what you can:

- what is affected: the hosted server at `https://knowdrive.ai/api/v1/mcp`, the `@knowdrive/mcp` npm package, or this repository;
- steps to reproduce, or a proof of concept;
- the impact you expect, and any version numbers.

We'll acknowledge your report and keep you updated until it's resolved. Please give us a reasonable chance to fix the issue before you disclose it publicly.

## Scope

- **Hosted service:** the KnowDrive MCP endpoint and its OAuth flow, operated by Recourse Software Inc. Fixes deploy to the service, so there is nothing for you to update.
- **npm package:** `@knowdrive/mcp`. Fixes ship in a new release, and only the latest version is supported. Releases are published from GitHub Actions with npm provenance.

Please don't test against other people's accounts or data, run denial-of-service tests, or use social engineering. A free account at https://knowdrive.ai/signup is enough for testing.
