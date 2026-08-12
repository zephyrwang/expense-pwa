// Apps Script API client + in-memory entry store.
//
// Requests are POSTed with Content-Type text/plain so the browser sends a
// "simple request" — Apps Script cannot answer CORS preflights. The token rides
// in the body for the same reason (custom headers would trigger preflight).

const LS_URL = 'expense.apiUrl';
const LS_TOKEN = 'expense.apiToken';

export function getSettings() {
  return {
    url: localStorage.getItem(LS_URL) || '',
    token: localStorage.getItem(LS_TOKEN) || ''
  };
}

export function saveSettings(url, token) {
  localStorage.setItem(LS_URL, url.trim());
  localStorage.setItem(LS_TOKEN, token.trim());
}

export function hasSettings() {
  const s = getSettings();
  return Boolean(s.url && s.token);
}

async function apiCall(action, payload = {}) {
  const { url, token } = getSettings();
  if (!url || !token) throw new Error('Not configured — open Settings first.');
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, action, payload })
    });
  } catch (e) {
    throw new Error("Network error — are you online? Entry wasn't saved.");
  }
  let body;
  try {
    body = await res.json();
  } catch (e) {
    throw new Error('Unexpected response from the API (check the /exec URL).');
  }
  if (!body.ok) throw new Error(apiErrorMessage(body.error));
  return body.data;
}

function apiErrorMessage(code) {
  const messages = {
    unauthorized: 'Wrong token — check Settings.',
    not_found: 'Entry not found — it may have been deleted elsewhere. Refresh.',
    busy: 'The sheet is busy, try again in a moment.',
    invalid_date: 'Invalid date.',
    invalid_amount: 'Amount must be a positive number.',
    invalid_type: 'Invalid category.',
    invalid_subcategory: 'Invalid subcategory.'
  };
  return messages[code] || `API error: ${code}`;
}

// ---- In-memory store: fetch once per session, patch on mutation ----

let entries = null;

export async function loadAll(force = false) {
  if (entries === null || force) {
    entries = await apiCall('list');
  }
  return entries;
}

export function cachedEntries() {
  return entries || [];
}

export async function addEntry(fields) {
  const rec = await apiCall('add', fields);
  if (entries) entries.push(rec);
  return rec;
}

export async function updateEntry(fields) {
  const rec = await apiCall('update', fields);
  if (entries) {
    const i = entries.findIndex((e) => e.id === rec.id);
    if (i >= 0) entries[i] = rec;
  }
  return rec;
}

export async function deleteEntry(id) {
  await apiCall('delete', { id });
  if (entries) entries = entries.filter((e) => e.id !== id);
}

export async function testConnection() {
  await apiCall('list');
}
