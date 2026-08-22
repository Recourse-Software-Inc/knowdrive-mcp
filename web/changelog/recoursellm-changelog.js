/*
 * RecourseLLM group-wide changelog widget.
 *
 * Renders the last 60 days of commit activity across every project in the
 * public GitLab group (https://gitlab.com/recoursellm-group) into
 * <div id="recoursellm-changelog"></div>. Data is fetched live from the
 * GitLab public REST API in the visitor's browser — no token, no backend.
 *
 * Drop-in usage on any page:
 *   <div id="recoursellm-changelog"></div>
 *   <script src="/path/to/recoursellm-changelog.js" defer></script>
 *
 * Optional config via data-attributes on the container:
 *   data-group="recoursellm-group"  GitLab group path (default shown)
 *   data-days="60"                  window size in days (default 60)
 *
 * Optional offline fallback: set window.RECOURSELLM_CHANGELOG_SNAPSHOT to an
 * array of {id,title,committed_date,author_name,web_url,project_name,project_url}
 * before this script runs; it is rendered only if the live fetch fails.
 *
 * Optional "Ongoing work" section: set window.RECOURSELLM_PROJECT_SUMMARIES to
 * an array of {project, date, summary} (see project-summaries.js, generated
 * from the team's KnowDrive kd-handoff stream) and a project-cards section is
 * rendered above the commit feed. KnowDrive is a private API, so these
 * summaries are baked in at generation time rather than fetched by visitors.
 */
(function () {
  'use strict';

  var API = 'https://gitlab.com/api/v4';

  var TYPE_LABELS = {
    feat: 'Feature',
    fix: 'Fix',
    docs: 'Docs',
    test: 'Tests',
    refactor: 'Refactor',
    perf: 'Perf',
    chore: 'Chore',
    build: 'Build',
    ci: 'CI',
    style: 'Style',
    revert: 'Revert'
  };

  var CSS = [
    '.rl-cl{--rl-fg:#1a1d23;--rl-fg-soft:#5b6472;--rl-line:#e4e7ec;--rl-card:#ffffff;--rl-chip-bg:#f1f3f6;--rl-chip-fg:#3d4450;',
    ' --rl-feat:#0a7d4f;--rl-feat-bg:#e3f5ec;--rl-fix:#b25000;--rl-fix-bg:#fdeede;--rl-docs:#1d5fbf;--rl-docs-bg:#e7effb;',
    ' --rl-other:#6b5bd2;--rl-other-bg:#eeebfa;',
    ' color:var(--rl-fg);font:15px/1.55 inherit;max-width:100%}',
    '@media (prefers-color-scheme: dark){.rl-cl:not([data-rl-theme=light]){--rl-fg:#e8eaf0;--rl-fg-soft:#9aa3b2;--rl-line:#2a2f3a;',
    ' --rl-card:transparent;--rl-chip-bg:#232833;--rl-chip-fg:#c2c9d6;--rl-feat:#4cc38a;--rl-feat-bg:#12291d;',
    ' --rl-fix:#f0a35e;--rl-fix-bg:#2e2114;--rl-docs:#6cb2f5;--rl-docs-bg:#152238;--rl-other:#a695f0;--rl-other-bg:#221e38}}',
    '.rl-cl[data-rl-theme=dark]{--rl-fg:#e8eaf0;--rl-fg-soft:#9aa3b2;--rl-line:#2a2f3a;--rl-card:transparent;',
    ' --rl-chip-bg:#232833;--rl-chip-fg:#c2c9d6;--rl-feat:#4cc38a;--rl-feat-bg:#12291d;--rl-fix:#f0a35e;--rl-fix-bg:#2e2114;',
    ' --rl-docs:#6cb2f5;--rl-docs-bg:#152238;--rl-other:#a695f0;--rl-other-bg:#221e38}',
    '.rl-cl a{color:inherit;text-decoration:none}',
    '.rl-cl .rl-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 20px}',
    '.rl-cl .rl-filter{border:1px solid var(--rl-line);background:transparent;color:var(--rl-fg-soft);border-radius:999px;',
    ' padding:4px 14px;font-size:13px;cursor:pointer;font-family:inherit}',
    '.rl-cl .rl-filter[aria-pressed=true]{background:var(--rl-chip-bg);color:var(--rl-fg);border-color:transparent}',
    '.rl-cl .rl-meta{margin-left:auto;font-size:13px;color:var(--rl-fg-soft)}',
    '.rl-cl .rl-day{margin:0 0 8px;padding-top:18px}',
    '.rl-cl .rl-day h3{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rl-fg-soft);',
    ' margin:0 0 10px;border-bottom:1px solid var(--rl-line);padding-bottom:8px}',
    '.rl-cl ul{list-style:none;margin:0;padding:0}',
    '.rl-cl .rl-item{display:flex;gap:10px;align-items:baseline;padding:7px 0;flex-wrap:wrap}',
    '.rl-cl .rl-badge{flex:none;font-size:11px;font-weight:600;letter-spacing:.03em;border-radius:5px;padding:2px 8px;',
    ' text-transform:uppercase;background:var(--rl-other-bg);color:var(--rl-other)}',
    '.rl-cl .rl-badge-feat{background:var(--rl-feat-bg);color:var(--rl-feat)}',
    '.rl-cl .rl-badge-fix{background:var(--rl-fix-bg);color:var(--rl-fix)}',
    '.rl-cl .rl-badge-docs,.rl-cl .rl-badge-test{background:var(--rl-docs-bg);color:var(--rl-docs)}',
    '.rl-cl .rl-title{flex:1 1 340px;min-width:0}',
    '.rl-cl .rl-title a:hover{text-decoration:underline}',
    '.rl-cl .rl-scope{color:var(--rl-fg-soft)}',
    '.rl-cl .rl-side{flex:none;display:flex;gap:8px;align-items:baseline;font-size:12.5px;color:var(--rl-fg-soft)}',
    '.rl-cl .rl-proj{background:var(--rl-chip-bg);color:var(--rl-chip-fg);border-radius:5px;padding:1px 7px}',
    '.rl-cl .rl-proj:hover,.rl-cl .rl-sha:hover{text-decoration:underline}',
    '.rl-cl .rl-sha{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}',
    '.rl-cl .rl-work{margin:0 0 36px}',
    '.rl-cl .rl-work h2{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rl-fg-soft);',
    ' margin:0 0 14px;border-bottom:1px solid var(--rl-line);padding-bottom:8px}',
    '.rl-cl .rl-work-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}',
    '.rl-cl .rl-card{border:1px solid var(--rl-line);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}',
    '.rl-cl .rl-card-head{display:flex;align-items:baseline;gap:10px}',
    '.rl-cl .rl-card-head strong{font-size:14.5px;font-weight:600}',
    '.rl-cl .rl-card-date{margin-left:auto;flex:none;font-size:12px;color:var(--rl-fg-soft)}',
    '.rl-cl .rl-card p{margin:0;font-size:13.5px;line-height:1.5;color:var(--rl-fg-soft)}',
    '.rl-cl .rl-work-more{margin-top:12px}',
    '.rl-cl .rl-feed h2{font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--rl-fg-soft);',
    ' margin:0 0 14px;border-bottom:1px solid var(--rl-line);padding-bottom:8px}',
    '.rl-cl .rl-state{padding:36px 0;color:var(--rl-fg-soft);text-align:center;font-size:14px}',
    '.rl-cl .rl-foot{margin-top:26px;padding-top:14px;border-top:1px solid var(--rl-line);font-size:12.5px;color:var(--rl-fg-soft)}',
    '.rl-cl .rl-foot a{text-decoration:underline}'
  ].join('');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('GitLab API ' + r.status + ' for ' + url);
      return r.json().then(function (data) {
        return { data: data, next: r.headers.get('X-Next-Page') };
      });
    });
  }

  // Follow X-Next-Page pagination until exhausted.
  function fetchAll(url, acc) {
    acc = acc || [];
    return fetchJSON(url).then(function (res) {
      acc = acc.concat(res.data);
      if (res.next) {
        return fetchAll(url.replace(/([?&])page=\d+/, '$1page=' + res.next), acc);
      }
      return acc;
    });
  }

  function parseTitle(title) {
    // "type(scope): subject" | "prefix: subject" | plain subject
    var m = /^([A-Za-z0-9_+\/.-]+)(\(([^)]*)\))?!?:\s+(.*)$/.exec(title);
    if (!m) return { type: null, label: null, scope: null, subject: title };
    var key = m[1].toLowerCase();
    if (TYPE_LABELS[key]) return { type: key, label: TYPE_LABELS[key], scope: m[3] || null, subject: m[4] };
    // Unknown prefix (e.g. "kd-handoff:") — treat it as a component chip.
    return { type: 'other', label: m[1], scope: m[3] || null, subject: m[4] };
  }

  function dayKey(iso) {
    return iso.slice(0, 10);
  }

  function dayHeading(key) {
    var d = new Date(key + 'T12:00:00Z');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function filterGroupFor(type) {
    if (type === 'feat' || type === 'fix' || type === 'docs') return type;
    return 'other';
  }

  function renderWork(root, opts) {
    var items = window.RECOURSELLM_PROJECT_SUMMARIES;
    if (!items || !items.length) return false;
    items = items.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    var section = el('section', 'rl-work');
    section.appendChild(el('h2', null, 'Ongoing work'));
    var grid = el('div', 'rl-work-grid');
    var INITIAL = 6;

    function card(it) {
      var c = el('article', 'rl-card');
      var head = el('div', 'rl-card-head');
      head.appendChild(el('strong', null, it.project));
      var d = new Date(it.date + 'T12:00:00Z');
      head.appendChild(el('span', 'rl-card-date',
        'Updated ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })));
      c.appendChild(head);
      c.appendChild(el('p', null, it.summary));
      return c;
    }

    items.slice(0, INITIAL).forEach(function (it) { grid.appendChild(card(it)); });
    section.appendChild(grid);

    if (items.length > INITIAL) {
      var more = el('button', 'rl-filter rl-work-more', 'Show all ' + items.length + ' projects');
      more.type = 'button';
      more.addEventListener('click', function () {
        items.slice(INITIAL).forEach(function (it) { grid.appendChild(card(it)); });
        more.remove();
      });
      section.appendChild(more);
    }

    root.appendChild(section);
    return true;
  }

  function render(root, commits, opts) {
    root.textContent = '';

    if (renderWork(root, opts)) {
      var feedHead = el('div', 'rl-feed');
      feedHead.appendChild(el('h2', null, 'Latest changes'));
      root.appendChild(feedHead);
    }

    var toolbar = el('div', 'rl-toolbar');
    var groups = [
      { key: 'all', label: 'All' },
      { key: 'feat', label: 'Features' },
      { key: 'fix', label: 'Fixes' },
      { key: 'docs', label: 'Docs' },
      { key: 'other', label: 'Other' }
    ];
    var active = 'all';
    var list = el('div');

    function count(key) {
      if (key === 'all') return commits.length;
      return commits.filter(function (c) { return filterGroupFor(c.parsed.type) === key; }).length;
    }

    groups.forEach(function (g) {
      var b = el('button', 'rl-filter', g.label + ' (' + count(g.key) + ')');
      b.type = 'button';
      b.setAttribute('aria-pressed', g.key === active ? 'true' : 'false');
      b.addEventListener('click', function () {
        active = g.key;
        toolbar.querySelectorAll('.rl-filter').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        drawList();
      });
      toolbar.appendChild(b);
    });
    toolbar.appendChild(el('span', 'rl-meta', 'Last ' + opts.days + ' days · ' + commits.length + ' updates'));
    root.appendChild(toolbar);
    root.appendChild(list);

    function drawList() {
      list.textContent = '';
      var visible = commits.filter(function (c) {
        return active === 'all' || filterGroupFor(c.parsed.type) === active;
      });
      if (!visible.length) {
        list.appendChild(el('div', 'rl-state', 'Nothing in this category yet.'));
        return;
      }
      var currentKey = null, ul = null;
      visible.forEach(function (c) {
        var key = dayKey(c.committed_date);
        if (key !== currentKey) {
          currentKey = key;
          var day = el('section', 'rl-day');
          day.appendChild(el('h3', null, dayHeading(key)));
          ul = el('ul');
          day.appendChild(ul);
          list.appendChild(day);
        }
        var li = el('li', 'rl-item');

        var p = c.parsed;
        var badge = el('span', 'rl-badge' + (p.type && p.type !== 'other' ? ' rl-badge-' + p.type : ''),
          p.label || 'Update');
        li.appendChild(badge);

        var title = el('span', 'rl-title');
        var link = el('a');
        link.href = c.web_url;
        link.target = '_blank';
        link.rel = 'noopener';
        if (p.scope) {
          link.appendChild(el('span', 'rl-scope', p.scope + ': '));
        }
        link.appendChild(document.createTextNode(p.subject));
        title.appendChild(link);
        li.appendChild(title);

        var side = el('span', 'rl-side');
        var proj = el('a', 'rl-proj', c.project_name);
        proj.href = c.project_url;
        proj.target = '_blank';
        proj.rel = 'noopener';
        side.appendChild(proj);
        side.appendChild(el('span', null, c.author_name.replace(/\s+/g, ' ').trim()));
        var sha = el('a', 'rl-sha', c.id.slice(0, 8));
        sha.href = c.web_url;
        sha.target = '_blank';
        sha.rel = 'noopener';
        side.appendChild(sha);
        li.appendChild(side);

        ul.appendChild(li);
      });
    }

    drawList();

    var foot = el('div', 'rl-foot');
    foot.appendChild(document.createTextNode(opts.snapshot ? 'From a saved snapshot · ' : 'Live from GitLab · '));
    var gl = el('a', null, 'gitlab.com/' + opts.group);
    gl.href = 'https://gitlab.com/' + opts.group;
    gl.target = '_blank';
    gl.rel = 'noopener';
    foot.appendChild(gl);
    root.appendChild(foot);
  }

  function load(root) {
    var opts = {
      group: root.getAttribute('data-group') || 'recoursellm-group',
      days: parseInt(root.getAttribute('data-days') || '60', 10)
    };
    root.classList.add('rl-cl');
    root.appendChild(el('div', 'rl-state', 'Loading recent updates…'));

    var since = new Date(Date.now() - opts.days * 864e5).toISOString();

    fetchAll(API + '/groups/' + encodeURIComponent(opts.group) +
             '/projects?per_page=100&page=1&include_subgroups=true&order_by=last_activity_at')
      .then(function (projects) {
        return Promise.all(projects.map(function (p) {
          return fetchAll(API + '/projects/' + p.id + '/repository/commits?since=' +
                          encodeURIComponent(since) + '&per_page=100&page=1')
            .then(function (commits) {
              return commits.map(function (c) {
                return {
                  id: c.id,
                  title: c.title,
                  committed_date: c.committed_date,
                  author_name: c.author_name,
                  web_url: c.web_url,
                  project_name: p.name,
                  project_url: p.web_url
                };
              });
            });
        }));
      })
      .then(function (perProject) {
        show(root, [].concat.apply([], perProject), opts);
      })
      .catch(function (err) {
        if (window.console && console.error) console.error('recoursellm-changelog:', err);
        var snapshot = window.RECOURSELLM_CHANGELOG_SNAPSHOT;
        if (snapshot && snapshot.length) {
          opts.snapshot = true;
          show(root, snapshot, opts);
          return;
        }
        root.textContent = '';
        var state = el('div', 'rl-state');
        state.appendChild(document.createTextNode('Couldn’t load the changelog right now. '));
        var a = el('a', null, 'View activity on GitLab →');
        a.href = 'https://gitlab.com/' + opts.group;
        a.style.textDecoration = 'underline';
        state.appendChild(a);
        root.appendChild(state);
      });
  }

  function show(root, commits, opts) {
    commits = commits
      .filter(function (c) { return !/^Merge (branch|remote|pull)/.test(c.title); })
      .sort(function (a, b) { return a.committed_date < b.committed_date ? 1 : -1; });
    commits.forEach(function (c) { c.parsed = parseTitle(c.title); });
    if (!commits.length) {
      root.textContent = '';
      root.appendChild(el('div', 'rl-state', 'No updates in the last ' + opts.days + ' days.'));
      return;
    }
    render(root, commits, opts);
  }

  function init() {
    var root = document.getElementById('recoursellm-changelog');
    if (!root) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    load(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
