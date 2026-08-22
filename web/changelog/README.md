# RecourseLLM.com — GitLab group-wide changelog

A drop-in changelog for the RecourseLLM.com changelog page. It shows every
update across the projects in the public GitLab group
[recoursellm-group](https://gitlab.com/recoursellm-group) from the **last 60
days**, fetched live in the visitor's browser from the GitLab public REST API.

- **No token, no backend, no build step.** The group is public and
  `gitlab.com/api/v4` sends `Access-Control-Allow-Origin: *`, so a plain
  client-side `fetch` works from any origin.
- **Always current.** The 60-day window is computed at page load, so the page
  never goes stale and never needs redeploying.
- **Group-wide.** Projects are discovered from the group at load time
  (subgroups included) — new repos appear in the changelog automatically.
- Merge commits are filtered out. Conventional-commit prefixes (`feat:`,
  `fix:`, `docs:`, …) become colored badges and power the filter tabs
  (All / Features / Fixes / Docs / Other); unrecognized prefixes such as
  `kd-handoff:` are shown as-is on a neutral badge.
- Light and dark theme via `prefers-color-scheme`; responsive down to phone
  widths. All markup, styles, and behavior live in the one script — styles are
  `rl-`-prefixed and scoped to the container, and the widget inherits the
  page's font.

## Files

| File | What it is |
| --- | --- |
| `recoursellm-changelog.js` | The whole widget: fetch + render + scoped CSS. |
| `project-summaries.js` | Baked "Ongoing work" cards — one public-facing summary per project, condensed from each project's newest kd-handoff in KnowDrive (RSI Share store). |
| `changelog.html` | A complete standalone changelog page using the widget. |

## The Ongoing work section

When `project-summaries.js` is loaded before the widget, an "Ongoing work"
grid of project cards renders above the commit feed (first 6, with a
show-all toggle). KnowDrive is a private, authenticated API, so visitors'
browsers can't query it — the summaries are baked in at generation time.

To refresh them, ask Claude (with the KnowDrive MCP connected) to list files
tagged `kd-handoff` in the RSI Share store, read the newest handoff per
`project:` tag, and rewrite the array in `project-summaries.js`. **Review the
copy before deploying**: handoffs are internal working documents, and the
published summaries must stay public-appropriate (no incident details,
commit hashes, or internal strategy).

## Integrating into the existing changelog page

Copy `recoursellm-changelog.js` into the site's static assets, then put this
where the changelog content should render:

```html
<div id="recoursellm-changelog"></div>
<script src="/js/recoursellm-changelog.js" defer></script>
```

In a React/Next.js page, the equivalent is a container div plus
`<Script src="/js/recoursellm-changelog.js" strategy="afterInteractive" />`
(the script initializes itself and is safe to load after hydration; it does
nothing if the container div isn't present).

Optional attributes on the container:

```html
<div id="recoursellm-changelog" data-group="recoursellm-group" data-days="60"></div>
```

Optional offline fallback: define `window.RECOURSELLM_CHANGELOG_SNAPSHOT`
(an array of `{id, title, committed_date, author_name, web_url, project_name,
project_url}`) before the script tag and it will be rendered only if the live
GitLab fetch fails.

## Note on private projects

The browser-side fetch sees only what an anonymous visitor can see: public
projects in the group. If the group ever adds private repos that should appear
in the public changelog, that would need a small server-side proxy with a
read-only token — not needed today.
