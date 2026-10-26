# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An installable PWA for logging personal expenses. No build step, no framework, no
dependencies to install: plain ES modules served as static files, plus a vendored
`vendor/chart.umd.js` (Chart.js UMD). The backend is a Google Apps Script web app
bound to the user's own "Expenses" spreadsheet (`apps-script/Code.gs`). There is no
test suite and no linter.

## Commands

```bash
python3 -m http.server 8000        # serve locally; PWA features work on localhost
```

Verify the deployed API directly (URL ends in `/exec`):

```bash
curl -sL -d '{"token":"TOKEN","action":"list","payload":{}}' 'URL'
```

Hosting is GitHub Pages from `main` at the repo root — pushing to `main` deploys.

## Architecture

Four client modules, strictly layered, imported by `app.js` only:

- `taxonomy.js` — the `TAXONOMY` type → subcategory map, plus the validated chart
  palette (`SERIES_COLORS`, `CHART_SURFACE`).
- `analytics.js` — pure aggregation. Dates are `YYYY-MM-DD` strings end to end and
  period keys (`2026-08`, `2026-Q3`, `2026`) are derived with string slicing, never
  `Date` arithmetic, so no timezone can shift a month boundary. Keep it that way.
- `api.js` — Apps Script client *and* the app's only data store: `loadAll()` fetches
  the full entry list once per session and caches it in a module-level `entries`
  array; `addEntry`/`updateEntry`/`deleteEntry` patch that array in place from the
  server's response. Views read `cachedEntries()` and never re-fetch except via the
  explicit "Refresh data" button (`loadAll(true)`).
- `app.js` — hash router (`#/home`, `#/add`, `#/added`, `#/history`, `#/edit/<id>`,
  `#/analytics`, `#/settings`) plus every view. Views render by clearing `#view` and
  building DOM through the `el()` template helper; text always goes in via
  `textContent`, not interpolated HTML. `entryForm()` is shared by Add and Edit.
  Unconfigured app (no URL/token in localStorage) is redirected to `#/settings`.

Settings (`expense.apiUrl`, `expense.apiToken`) live only in `localStorage`; the
repo contains no secrets.

### Client ↔ API contract

Every call is `POST {token, action, payload}` to the `/exec` URL with
`Content-Type: text/plain` — Apps Script cannot answer a CORS preflight, so the
request must stay a "simple request". That is why the token travels in the body
rather than a header. Do not add custom headers, JSON content types, or GET-based
data calls.

The API always returns HTTP 200 with `{ok:true,data}` or `{ok:false,error:"code"}`.
Error codes are mapped to user-facing text in `apiErrorMessage()` in `api.js`; a new
error code in `Code.gs` needs an entry there or it surfaces raw.

### Apps Script side

`doPost` authenticates against the `API_TOKEN` script property, takes a script lock,
and dispatches `add`/`list`/`update`/`delete`. Rows are addressed by the UUID in
column A; rows without an id (hand-inserted) are skipped by `readAll_`. Written in
ES5 style (`var`, `function`) — match it. `setupSheet()` is the one-time helper that
creates the tab and forces column B to plain text.

## Things that must be changed together

- **Taxonomy**: `TAXONOMY` exists twice — `taxonomy.js` (what the UI offers) and
  `Code.gs` (what the API accepts). Edit both, or saves under a new type fail with
  `invalid_type`.
- **Service worker**: bump `CACHE_VERSION` in `sw.js` on *every* deploy of changed
  app files, or installed clients keep serving the old shell. Any new file that the
  app loads must also be added to the `SHELL` array. `sw.js` deliberately never
  intercepts cross-origin requests — the API is never cached, the app is online-only
  by design.
- **Apps Script deploys are manual**: editing `Code.gs` in the repo changes nothing
  live. The user must paste it into the bound script project and do
  *Deploy → Manage deployments → edit → New version* (a new deployment would change
  the URL). Flag this whenever you touch `Code.gs`.

## Conventions

- Currency always through `agg.fmtUSD`; amounts are rounded to 2 decimals server-side.
- Colors come from the CSS custom properties in `style.css` (light + dark blocks) or
  from `SERIES_COLORS` for charts — no hard-coded hex in `app.js`.
- Charts show at most 8 series: `topWithOther(totals, 7)`, colored in palette slot
  order, which is why the palette is adjacent-pair safe in that exact sequence.
- Visual theme is "fluffy kitty": cream page, pastel fills, chunky `--line` outlines
  with `--shadow` drop shadows, M PLUS Rounded 1c from Google Fonts (falls back to
  system-ui). The user's cat photos live in `img/` as small EXIF-stripped crops;
  the originals in `cat_pic/` are gitignored and must never be committed (the
  site is public). New photos get the same treatment and an entry in `SHELL`.
