/*
 * Ongoing-work summaries for the RecourseLLM changelog page.
 *
 * Generated 2026-08-22 from the team's kd-handoff stream in KnowDrive
 * ("RSI Share" store, dev): for each project:* tag, the newest handoff's
 * TL;DR was condensed into a public-facing summary. KnowDrive is a private
 * API, so this data is baked in rather than fetched by visitors.
 *
 * To refresh: ask Claude (with the KnowDrive MCP connected) to list files
 * tagged kd-handoff in RSI Share, read the latest handoff per project: tag,
 * and rewrite this array. Review the copy before deploying — handoffs are
 * internal documents, and summaries here must stay public-appropriate.
 */
window.RECOURSELLM_PROJECT_SUMMARIES = [
  {
    project: 'multi-modal-store',
    date: '2026-08-21',
    summary: 'Steering board refreshed to v21, with an automated release gate now reconciling the issue tracker against what actually shipped — it caught a labeling gap that three days of hand-cleanup had missed.'
  },
  {
    project: 'inspector',
    date: '2026-08-20',
    summary: 'Two releases: v0.1.29 brings live store counts and v0.1.30 fixes the web build’s overlays and base typography — plus a public npm mirror and a daily check that flags incomplete releases.'
  },
  {
    project: 'knowdrive-site',
    date: '2026-08-20',
    summary: 'Inspector 0.1.30 rolled out across the KnowDrive site deployment, with a new chart release cut, published, and verified end to end.'
  },
  {
    project: 'workspace',
    date: '2026-08-20',
    summary: 'Host-manager v0.5.7 released with an authentication-redirect fix, following a wave of chart releases now live in both dev and prod.'
  },
  {
    project: 'infra',
    date: '2026-08-20',
    summary: 'Ongoing platform reliability work: deployment verification, canary management, and fleet-wide configuration hardening.'
  },
  {
    project: 'skills',
    date: '2026-08-19',
    summary: 'Fixes shipped across the six portable KnowDrive skills, and a day of validating the retrieval loop against the live API produced a new working paper and a round of upstream defect reports.'
  },
  {
    project: 'audit-sync',
    date: '2026-08-18',
    summary: 'Log-only sink mode shipped with TDD throughout, and v0.1.2 cut — the project’s first completed on-prem build — with the test suite growing to 109 tests.'
  },
  {
    project: 'kd-cli',
    date: '2026-08-13',
    summary: 'Realigned with the current KnowDrive API after a full OpenAPI review, restoring file upload and sync against the live server; all nine test packages green.'
  },
  {
    project: 'kdconsole',
    date: '2026-08-10',
    summary: 'KnowDrive Enterprise Console v1 design prototype — 14 pages covering provisioning, SSO, governance, billing, and audit — now deployed with auto-publish on every change.'
  },
  {
    project: 'cnc',
    date: '2026-08-05',
    summary: 'MoonShot RTS went from tech demo to playable match: real win/lose conditions, resource and combat loops, AI pacing rebalance, and a rebuilt 2D production-art pipeline.'
  },
  {
    project: 'kdfinder',
    date: '2026-07-31',
    summary: 'Live ingestion, real passage previews in the inspector, a first-run onboarding flow, and a re-architecture onto a single user-owned store.'
  },
  {
    project: 'recoursellm-site',
    date: '2026-07-30',
    summary: 'A standalone marketing site for recoursellm.com built from scratch and sharpened through multiple design-critique rounds; builds clean as a static export.'
  },
  {
    project: 'kd-infra',
    date: '2026-07-25',
    summary: 'Dev pipeline stability: maintenance liveness settings tuned so long compaction runs can complete, deployed and verified live.'
  },
  {
    project: 'knowdrive-gtm',
    date: '2026-07-20',
    summary: 'Go-to-market groundwork: positioning and strategy documents consolidated across parallel working sessions.'
  },
  {
    project: 'knowdb',
    date: '2026-07-15',
    summary: 'The KnowDB whitepaper grounded against a live instance for the first time — rev 3 now carries observed behavior and real atom exhibits for every platform claim.'
  }
];
