# Expenses — personal spend tracker PWA

A simple, installable web app for logging daily spending from your phone and laptop.
Data lives in your own Google Sheet; a Google Apps Script bound to the sheet acts as
the API. No accounts, no servers, no build step.

- **Add** — log an expense in seconds: amount, date, type → subcategory, merchant, note.
- **History** — browse by month with daily subtotals; tap any entry to edit or delete it.
- **Analytics** — spend-by-type doughnut and period totals bar chart, by month, quarter, or year.
- **Settings** — where the API URL and token live (stored only in your browser's localStorage).

---

## One-time setup

### 1. Create the Google Sheet + API

1. Go to [sheets.new](https://sheets.new) and name the spreadsheet **Expenses**.
2. Open **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the entire contents of
   [`apps-script/Code.gs`](apps-script/Code.gs). Save (⌘S).
4. In the function dropdown (toolbar), select **`setupSheet`** and click **Run**.
   Approve the authorization prompt (it will warn "Google hasn't verified this app" —
   click *Advanced → Go to … (unsafe)*; it's your own script). This creates and
   formats the `Expenses` tab.
5. Generate a secret token on your laptop:
   ```bash
   openssl rand -hex 24
   ```
6. In the Apps Script editor: **Project Settings (gear icon) → Script Properties →
   Add script property**. Property: `API_TOKEN`, Value: the token from step 5.
7. **Deploy → New deployment → (gear) Web app**:
   - Description: anything
   - **Execute as: Me**
   - **Who has access: Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

### 2. Verify the API (optional but recommended)

From your laptop terminal (replace URL and TOKEN):

```bash
curl -sL -d '{"token":"TOKEN","action":"add","payload":{"date":"2026-08-12","amount":12.5,"type":"Eating","subcategory":"Coffee/bar/drinks","merchant":"Test Cafe"}}' 'URL'
```

You should get `{"ok":true,...}` and see the row in the sheet. A wrong token returns
`{"ok":false,"error":"unauthorized"}`. Delete the test row from History later, or via
the sheet.

### 3. Configure the app

Open the app, go to **Settings**, paste the `/exec` URL and the token, and hit
**Save & test connection**.

### 4. Install on your phone (Android)

Open the app's URL in Chrome → menu (⋮) → **Add to Home screen** → **Install**.
It launches full-screen like a native app. Same works in desktop Chrome (install
icon in the address bar).

---

## Hosting on GitHub Pages

1. Create a GitHub repository (public is fine — the code contains no secrets;
   your URL/token live only in each browser's localStorage).
2. Push this folder to it.
3. Repo **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Your app is at `https://<username>.github.io/<repo>/` a minute later.

For local testing instead: `python3 -m http.server 8000` in this folder →
[http://localhost:8000](http://localhost:8000). (PWA features work on localhost
without HTTPS.)

---

## Things worth knowing

- **If it didn't say "Saved", it isn't saved.** The app is online-only by design;
  an entry attempted offline shows an error and keeps your input so you can retry.
- **Apps Script code changes don't go live on save.** After editing `Code.gs`, use
  **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. (A brand-new
  deployment would change the URL and you'd have to update Settings.)
- **App updates:** after deploying new app files, bump `CACHE_VERSION` in `sw.js`
  (e.g. `shell-v2`) so installed phones pick up the change. The **Reload app** button
  in Settings force-refreshes.
- **First call of the day can take 1–3 s** — Apps Script cold start, normal.
- **Hand-editing the sheet is OK** for values and row deletion. Never edit column A
  (`id`); rows added by hand without an id are ignored by the app.
- **Category list** lives in `taxonomy.js` (app) and `Code.gs` (validation) — if you
  ever change it, change both, then redeploy both. The app will happily show a new
  type whose `Code.gs` half hasn't shipped, and every save under it fails with
  `invalid_type`. Bump `CACHE_VERSION` too, or installed phones keep the old list.
  If you have added your own code to the script project, edit the `TAXONOMY` block
  in the Apps Script editor rather than pasting this repo's `Code.gs` over it.
- **Security honesty:** the API is guarded only by the secret token — no rate
  limiting, no OAuth. Fine for a personal spend log; rotate the token occasionally
  (change the Script Property + Settings) if you want.
