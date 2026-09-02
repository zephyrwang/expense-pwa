/**
 * Expense tracker API — Google Apps Script web app bound to the "Expenses" spreadsheet.
 *
 * Deploy: Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * After code changes: Deploy > Manage deployments > edit > New version (same URL).
 * Secret: set Script Property API_TOKEN (Project Settings > Script Properties).
 *
 * Request (POST body, Content-Type: text/plain to avoid CORS preflight):
 *   { "token": "...", "action": "add"|"list"|"update"|"delete", "payload": {...} }
 * Response: always HTTP 200, { "ok": true, "data": ... } or { "ok": false, "error": "..." }
 *
 * Note: if you have added your own actions to the deployed script, pasting this
 * file over it will remove them. Re-apply them before deploying a new version.
 */

var SHEET_NAME = 'Expenses';
var HEADERS = ['id', 'date', 'amount', 'type', 'subcategory', 'merchant', 'note', 'createdAt', 'updatedAt'];

// Keep in sync with taxonomy.js in the PWA client.
var TAXONOMY = {
  'Housing': ['Rent/mortgage', 'Property tax', 'HOA fees', 'Maintenance/repair', 'Home supplies', 'Furniture/appliances'],
  'Utilities': ['Electricity', 'Water/gas', 'Internet', 'Mobile phone plan'],
  'Eating': ['Groceries/supermarket', 'Restaurant', 'Coffee/bar/drinks', 'Bakery', 'Takeout/delivery'],
  'Transportation': ['Car payment', 'Fuel/EV charging', 'Public transit', 'Rideshare/taxi', 'Parking/tolls', 'Expressway fees', 'Car registration', 'Car maintenance', 'Car insurance'],
  'Pet': ['Pet food', 'Vet/medical', 'Grooming', 'Toys/supplies'],
  'Kids': ['Childcare/daycare', 'School tuition/fees', 'Kids clothing', 'Toys/activities', 'Kids health'],
  'Clothing & Personal Care': ['Clothes/shoes', 'Haircut/salon', 'Personal care products'],
  'Health & Medical': ['Doctor/dental', 'Pharmacy/medicine', 'Health insurance', 'Gym/fitness'],
  'Subscriptions': ['Streaming', 'Software/apps', 'Memberships'],
  'Shopping': ['Electronics', 'Home decor', 'General merchandise'],
  'Entertainment': ['Movie/event tickets', 'Hobbies', 'Vacation'],
  'Education': ['Courses', 'Books', 'Certifications'],
  'Gifts & Donations': ['Gifts', 'Charity/donations'],
  'Financial': ['Bank fees', 'Credit card fees', 'Life insurance', 'Taxes'],
  'Other': ['Uncategorized']
};

function doGet(e) {
  return json_({ ok: true, data: 'expense-api v1' });
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }
  if (!req || req.token !== getSecret_()) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  try {
    switch (req.action) {
      case 'add': return json_(add_(req.payload || {}));
      case 'list': return json_(list_(req.payload || {}));
      case 'update': return json_(update_(req.payload || {}));
      case 'delete': return json_(remove_(req.payload || {}));
      default: return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json_({ ok: false, error: 'server_error: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

function add_(p) {
  var err = validate_(p);
  if (err) return { ok: false, error: err };
  var now = new Date().toISOString();
  var rec = {
    id: Utilities.getUuid(),
    date: p.date,
    amount: round2_(p.amount),
    type: p.type,
    subcategory: p.subcategory,
    merchant: String(p.merchant || ''),
    note: String(p.note || ''),
    createdAt: now,
    updatedAt: now
  };
  sheet_().appendRow(HEADERS.map(function (h) { return rec[h]; }));
  return { ok: true, data: rec };
}

function list_(p) {
  var rows = readAll_();
  var from = p.from, to = p.to;
  if (from || to) {
    rows = rows.filter(function (r) {
      return (!from || r.date >= from) && (!to || r.date <= to);
    });
  }
  return { ok: true, data: rows };
}

function update_(p) {
  if (!p.id) return { ok: false, error: 'missing_id' };
  var err = validate_(p);
  if (err) return { ok: false, error: err };
  var found = findRow_(p.id);
  if (!found) return { ok: false, error: 'not_found' };
  var rec = {
    id: p.id,
    date: p.date,
    amount: round2_(p.amount),
    type: p.type,
    subcategory: p.subcategory,
    merchant: String(p.merchant || ''),
    note: String(p.note || ''),
    createdAt: found.record.createdAt,
    updatedAt: new Date().toISOString()
  };
  sheet_().getRange(found.rowIndex, 1, 1, HEADERS.length)
    .setValues([HEADERS.map(function (h) { return rec[h]; })]);
  return { ok: true, data: rec };
}

function remove_(p) {
  if (!p.id) return { ok: false, error: 'missing_id' };
  var found = findRow_(p.id);
  if (!found) return { ok: false, error: 'not_found' };
  sheet_().deleteRow(found.rowIndex);
  return { ok: true, data: { id: p.id } };
}

function validate_(p) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date || ''))) return 'invalid_date';
  var amount = Number(p.amount);
  if (!isFinite(amount) || amount <= 0) return 'invalid_amount';
  var subs = TAXONOMY[p.type];
  if (!subs) return 'invalid_type';
  if (subs.indexOf(p.subcategory) === -1) return 'invalid_subcategory';
  return null;
}

function readAll_() {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    if (!v[0]) continue; // skip hand-inserted rows without an id
    rows.push({
      id: String(v[0]),
      date: dateStr_(v[1]),
      amount: Number(v[2]),
      type: String(v[3]),
      subcategory: String(v[4]),
      merchant: String(v[5]),
      note: String(v[6]),
      createdAt: String(v[7]),
      updatedAt: String(v[8])
    });
  }
  return rows;
}

function findRow_(id) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return null;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) {
      var rowIndex = i + 2;
      var v = sh.getRange(rowIndex, 1, 1, HEADERS.length).getValues()[0];
      var record = {};
      for (var j = 0; j < HEADERS.length; j++) record[HEADERS[j]] = v[j];
      return { rowIndex: rowIndex, record: record };
    }
  }
  return null;
}

// The date column should be Plain Text, but if Sheets coerced a value to a Date
// anyway, format it in the script's timezone rather than mangling it via ISO/UTC.
function dateStr_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function round2_(n) {
  return Math.round(Number(n) * 100) / 100;
}

function sheet_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('sheet "' + SHEET_NAME + '" not found');
  return sh;
}

function getSecret_() {
  return PropertiesService.getScriptProperties().getProperty('API_TOKEN');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * One-time helper: run this from the Apps Script editor to create/format the
 * Expenses tab (headers, frozen row, plain-text date column). Safe to re-run.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange('B:B').setNumberFormat('@'); // plain text dates
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());
}
