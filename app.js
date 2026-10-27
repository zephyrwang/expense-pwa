import { TAXONOMY, TYPES, SERIES_COLORS, CHART_SURFACE } from './taxonomy.js';
import * as api from './api.js';
import * as agg from './analytics.js';
import { SUB_ICONS, FALLBACK_ICON } from './icons.js';

const view = document.getElementById('view');
const tabs = document.querySelectorAll('.tab');

// ---------- helpers ----------

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toast(msg) {
  const t = el(`<div class="toast"></div>`);
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

function isDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function merchants() {
  const seen = new Set();
  for (const e of api.cachedEntries()) if (e.merchant) seen.add(e.merchant);
  return [...seen].sort();
}

// ---------- kitty theme pieces ----------

const CAT = {
  window: './img/cat-face-window.jpg',
  couch: './img/cat-face-couch.jpg',
  up: './img/cat-face-up.jpg',
  lookUp: './img/cat-look-up.jpg',
  nap: './img/cat-nap-curl.jpg'
};

const PAW = '<ellipse cx="12" cy="16" rx="7" ry="6"/><circle cx="4" cy="8" r="3"/><circle cx="9.5" cy="3.5" r="3"/><circle cx="15" cy="3.5" r="3"/><circle cx="20" cy="8" r="3"/>';

function pawSvg(cls) {
  return `<svg class="${cls}" viewBox="0 0 24 22" aria-hidden="true">${PAW}</svg>`;
}

const PAW_TRAIL = `
  <svg class="paws" width="64" height="18" viewBox="0 0 64 18" aria-hidden="true">
    <g transform="translate(2 6) scale(0.5)">${PAW}</g>
    <g transform="translate(22 0) scale(0.5)">${PAW}</g>
    <g transform="translate(42 6) scale(0.5)">${PAW}</g>
  </svg>`;

// Round cat photo with little cat ears on the frame. earsVar names a CSS color token.
function catFrame(src, alt, size, { lifted = false, earsVar = '--accent' } = {}) {
  const frame = el(`
    <div class="cat-frame${lifted ? ' lifted' : ''}" style="--size: ${size}px; --frame-ears: var(${earsVar})">
      <svg class="ears" viewBox="0 0 100 30" aria-hidden="true" style="stroke-width: ${(300 / size).toFixed(2)}"><path d="M10 30 L18 2 L40 22 Z M90 30 L82 2 L60 22 Z"/></svg>
      <img>
    </div>`);
  const img = frame.querySelector('img');
  img.src = src;
  img.alt = alt;
  return frame;
}

function pageHead(title, { greeting, photo } = {}) {
  const head = el(`<header class="page-head"><div class="titles"><h1></h1></div></header>`);
  head.querySelector('h1').textContent = title;
  if (greeting) {
    const g = el(`<p class="greeting"></p>`);
    g.textContent = greeting;
    head.querySelector('.titles').prepend(g);
  }
  if (photo) head.appendChild(catFrame(photo, 'My cat', 54));
  return head;
}

const BADGE_FILLS = ['--mint', '--sky', '--lavender', '--accent', '--butter'];

// Pastel circle tinted by type, with a doodle icon for the subcategory.
function catBadge(type, subcategory) {
  const fill = BADGE_FILLS[Math.max(0, TYPES.indexOf(type)) % BADGE_FILLS.length];
  const icon = SUB_ICONS[subcategory] || FALLBACK_ICON;
  return el(`
    <svg class="cat-badge" viewBox="0 0 40 40" aria-hidden="true" style="--badge: var(${fill})">
      <circle class="disc" cx="20" cy="20" r="18"/>
      <g class="icon" transform="translate(7.5 7.5) scale(1.04)">${icon}</g>
    </svg>`);
}

function entryRow(e, catLine) {
  const row = el(`
    <button class="entry-row">
      <span class="entry-main"><span class="entry-merchant"></span><span class="entry-cat"></span></span>
      <span class="entry-amount"></span>
    </button>`);
  row.prepend(catBadge(e.type, e.subcategory));
  row.querySelector('.entry-merchant').textContent = e.merchant || '(no merchant)';
  row.querySelector('.entry-cat').textContent = catLine;
  row.querySelector('.entry-amount').textContent = agg.fmtUSD(e.amount);
  row.onclick = () => { location.hash = `#/edit/${e.id}`; };
  return row;
}

// Drawn decorations for the "Purrfect!" screen: paw prints, sparkles and the
// ginger tabby mascot cheering beside the photo. Colors come from CSS classes.
const CONFIRM_DECOR = `
  <svg class="decor" viewBox="0 0 300 220" aria-hidden="true">
    <g class="k-accent" transform="translate(8 26) rotate(-20)">${PAW}</g>
    <g class="k-sky" transform="translate(262 14) rotate(18)">${PAW}</g>
    <g class="k-mint" transform="translate(140 0) scale(0.8)">${PAW}</g>
    <path class="k-butter k-line" d="M44 70 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" stroke-width="2.5" stroke-linejoin="round"/>
    <path class="k-accent k-line" d="M262 70 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" stroke-width="2.5" stroke-linejoin="round"/>
    <g transform="translate(222 140) scale(0.62)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="k-butter k-line" cx="118" cy="44" rx="10" ry="11"/>
      <path class="k-line" d="M113 37 v4 M118 35 v4 M123 37 v4" stroke-width="2" fill="none"/>
      <path class="k-butter k-line" d="M48 30 C48 18 56 16 58 24 C60 14 70 16 70 30 Z"/>
      <path class="k-butter k-line" d="M22 50 L24 8 L54 30 Z M98 50 L96 8 L66 30 Z"/>
      <path class="k-ear" d="M30 36 L30 19 L44 30 Z M90 36 L90 19 L76 30 Z" stroke="none"/>
      <path class="k-butter k-line" d="M60 24 C80 24 96 32 104 46 C112 48 114 56 108 60 C116 64 114 74 106 76 C110 84 104 92 96 92 C92 100 80 104 60 104 C40 104 28 100 24 92 C16 92 10 84 14 76 C6 74 4 64 12 60 C6 56 8 48 16 46 C24 32 40 24 60 24 Z"/>
      <path class="k-stripe" d="M53 30 l2 9 M60 28 v10 M67 30 l-2 9" fill="none"/>
      <path class="k-line" d="M38 63 q6 -8 12 0 M70 63 q6 -8 12 0" fill="none"/>
      <ellipse class="k-ear" cx="36" cy="74" rx="7" ry="4.5" stroke="none"/>
      <ellipse class="k-ear" cx="84" cy="74" rx="7" ry="4.5" stroke="none"/>
      <path class="k-ear k-line" d="M56 69 L64 69 L60 74 Z" stroke-width="2"/>
      <path class="k-line" d="M52 76 q4 6 8 0 q4 6 8 0 M28 70 L10 67 M28 77 L11 79 M92 70 L110 67 M92 77 L109 79" stroke-width="2.4" fill="none"/>
    </g>
  </svg>`;

// ---------- router ----------

const routes = {
  home: renderHome,
  add: renderAdd,
  added: renderAdded,
  history: renderHistory,
  analytics: renderAnalytics,
  settings: renderSettings
};

function route() {
  const hash = location.hash.replace(/^#\//, '') || 'home';
  const [name, arg] = hash.split('/');
  if (!api.hasSettings() && name !== 'settings') {
    location.hash = '#/settings';
    return;
  }
  const fn = name === 'edit' ? () => renderEdit(arg) : routes[name] || renderHome;
  const tabName = name === 'edit' ? 'history' : name === 'added' ? 'add' : name;
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName));
  view.innerHTML = '';
  fn();
}

window.addEventListener('hashchange', route);

// ---------- entry form (shared by Add and Edit) ----------

function entryForm({ entry, onSave, onDelete }) {
  const f = el(`
    <form class="entry-form" novalidate>
      <label class="field amount-field">
        <span>How much?</span>
        <span class="amount-row"><span class="currency" aria-hidden="true">$</span><input name="amount" type="number" inputmode="decimal" step="0.01" min="0.01" placeholder="0.00" required class="amount-input"></span>
      </label>
      <label class="field">
        <span>Date</span>
        <input name="date" type="date" required>
      </label>
      <div class="field"><span>Type</span><div class="type-grid" data-role="types"></div></div>
      <div class="field hidden" data-role="subwrap"><span>Subcategory</span><div class="type-grid" data-role="subs"></div></div>
      <label class="field">
        <span>Merchant</span>
        <input name="merchant" type="text" list="merchant-list" autocomplete="off" placeholder="Where?">
      </label>
      <label class="field">
        <span>Note <em>(optional)</em></span>
        <input name="note" type="text" placeholder="">
      </label>
      <p class="form-error hidden" data-role="error"></p>
      <button type="submit" class="btn primary" data-role="save">${pawSvg('paw')}<span>Save</span></button>
    </form>`);

  const dl = document.getElementById('merchant-list');
  dl.innerHTML = merchants().map((m) => `<option value="${m.replace(/"/g, '&quot;')}">`).join('');

  const typeGrid = f.querySelector('[data-role=types]');
  const subWrap = f.querySelector('[data-role=subwrap]');
  const subGrid = f.querySelector('[data-role=subs]');
  const errEl = f.querySelector('[data-role=error]');
  const saveBtn = f.querySelector('[data-role=save]');
  const saveLabel = saveBtn.querySelector('span');
  let selType = entry ? entry.type : null;
  let selSub = entry ? entry.subcategory : null;

  function renderTypes() {
    typeGrid.innerHTML = '';
    for (const t of TYPES) {
      const b = el(`<button type="button" class="chip"></button>`);
      b.textContent = t;
      b.classList.toggle('selected', t === selType);
      b.onclick = () => { selType = t; selSub = null; renderTypes(); renderSubs(); };
      typeGrid.appendChild(b);
    }
  }

  function renderSubs() {
    if (!selType) { subWrap.classList.add('hidden'); return; }
    subWrap.classList.remove('hidden');
    subGrid.innerHTML = '';
    for (const s of TAXONOMY[selType]) {
      const b = el(`<button type="button" class="chip"></button>`);
      b.textContent = s;
      b.classList.toggle('selected', s === selSub);
      b.onclick = () => { selSub = s; renderSubs(); };
      subGrid.appendChild(b);
    }
  }

  renderTypes();
  renderSubs();

  f.amount.value = entry ? entry.amount : '';
  f.date.value = entry ? entry.date : todayStr();
  f.merchant.value = entry ? entry.merchant : '';
  f.note.value = entry ? entry.note : '';

  function showError(msg) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }

  f.onsubmit = async (ev) => {
    ev.preventDefault();
    errEl.classList.add('hidden');
    const amount = Number(f.amount.value);
    if (!isFinite(amount) || amount <= 0) return showError('Enter a positive amount.');
    if (!f.date.value) return showError('Pick a date.');
    if (!selType) return showError('Pick a type.');
    if (!selSub) return showError('Pick a subcategory.');
    const fields = {
      date: f.date.value,
      amount,
      type: selType,
      subcategory: selSub,
      merchant: f.merchant.value.trim(),
      note: f.note.value.trim()
    };
    saveBtn.disabled = true;
    saveLabel.textContent = 'Saving…';
    try {
      await onSave(fields);
    } catch (e) {
      showError(e.message);
    } finally {
      saveBtn.disabled = false;
      saveLabel.textContent = 'Save';
    }
  };

  if (onDelete) {
    const del = el(`<button type="button" class="btn danger">Delete entry</button>`);
    del.onclick = async () => {
      if (!confirm('Delete this entry? This cannot be undone.')) return;
      del.disabled = true;
      del.textContent = 'Deleting…';
      try {
        await onDelete();
      } catch (e) {
        del.disabled = false;
        del.textContent = 'Delete entry';
        showError(e.message);
      }
    };
    f.appendChild(del);
  }

  return f;
}

// ---------- Home ----------

async function renderHome() {
  const monthKey = agg.currentPeriodKey('month');
  view.appendChild(pageHead('My little wallet', { greeting: 'Meow, welcome back!', photo: CAT.window }));
  const body = el(`<div class="loading">Loading…</div>`);
  view.appendChild(body);
  let entries;
  try {
    entries = await api.loadAll();
  } catch (e) {
    body.className = 'form-error';
    body.textContent = e.message;
    return;
  }
  body.className = '';
  body.innerHTML = '';

  const today = todayStr();
  const monthEntries = entries.filter((e) => e.date.slice(0, 7) === monthKey);
  const monthTotal = monthEntries.reduce((s, e) => s + e.amount, 0);
  const todayTotal = monthEntries.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
  const topType = Object.entries(agg.sumByType(entries, 'month', monthKey))
    .sort((a, b) => b[1] - a[1])[0];

  const hero = el(`
    <section class="card home-hero">
      ${pawSvg('hero-paw')}
      <p class="hero-total"></p>
      <p class="hero-caption"></p>
      <div class="hero-stats">
        <span>Today <b data-role="today"></b></span>
        <span data-role="topwrap">Top <b data-role="top"></b></span>
      </div>
    </section>`);
  hero.prepend(catFrame(CAT.couch, 'My cat peeking over the card', 88, { lifted: true }));
  hero.querySelector('.hero-total').textContent = agg.fmtUSD(monthTotal);
  hero.querySelector('.hero-caption').textContent = `spent in ${agg.periodLabel(monthKey, 'month')}`;
  hero.querySelector('[data-role=today]').textContent = agg.fmtUSD(todayTotal);
  if (topType) {
    hero.querySelector('[data-role=top]').textContent = `${topType[0]} · ${agg.fmtUSD(topType[1])}`;
  } else {
    hero.querySelector('[data-role=topwrap]').remove();
  }
  body.appendChild(hero);

  const addBtn = el(`<button class="btn primary block"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Add expense</button>`);
  addBtn.onclick = () => { location.hash = '#/add'; };
  body.appendChild(addBtn);

  const recent = entries.slice()
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);
  if (!recent.length) {
    body.appendChild(el(`<p class="empty">No entries yet — add your first expense.</p>`));
    return;
  }
  body.appendChild(el(`<div class="section-head"><h2>Recent</h2>${PAW_TRAIL}</div>`));
  const list = el(`<div class="day-list"></div>`);
  for (const e of recent) list.appendChild(entryRow(e, `${e.date} · ${e.type} · ${e.subcategory}`));
  body.appendChild(list);
}

// ---------- Add ----------

function renderAdd() {
  view.appendChild(pageHead('Add expense', { photo: CAT.up }));
  const form = entryForm({
    onSave: async (fields) => {
      lastAdded = await api.addEntry(fields);
      location.hash = '#/added';
    }
  });
  view.appendChild(form);
  form.amount.focus();
}

// ---------- Added confirmation ----------

let lastAdded = null;

function renderAdded() {
  if (!lastAdded) { location.hash = '#/home'; return; }
  const e = lastAdded;
  const box = el(`
    <section class="confirm">
      <div class="confirm-art">${CONFIRM_DECOR}</div>
      <h1>Purrfect!</h1>
      <p class="confirm-sub">Added successfully</p>
      <div class="card confirm-card">
        <p class="confirm-amount"></p>
        <p class="confirm-line" data-role="cat"></p>
        <p class="confirm-line" data-role="meta"></p>
      </div>
      <button class="btn primary block" data-role="again">Add another</button>
      <button class="btn block" data-role="home">Go to Home</button>
    </section>`);
  // Photo goes under the decor layer so the tabby mascot peeks in front of it.
  box.querySelector('.confirm-art').prepend(catFrame(CAT.lookUp, 'My cat looking up happily', 168, { lifted: true }));
  box.querySelector('.confirm-amount').textContent = agg.fmtUSD(e.amount);
  box.querySelector('[data-role=cat]').textContent = `${e.type} · ${e.subcategory}`;
  box.querySelector('[data-role=meta]').textContent = [e.date, e.merchant, e.note].filter(Boolean).join(' · ');
  box.querySelector('[data-role=again]').onclick = () => { location.hash = '#/add'; };
  box.querySelector('[data-role=home]').onclick = () => { location.hash = '#/home'; };
  view.appendChild(box);
}

// ---------- History ----------

let historyMonth = null; // 'YYYY-MM'

async function renderHistory() {
  view.appendChild(el(`<h1>History</h1>`));
  const body = el(`<div class="loading">Loading…</div>`);
  view.appendChild(body);
  let entries;
  try {
    entries = await api.loadAll();
  } catch (e) {
    body.className = 'form-error';
    body.textContent = e.message;
    return;
  }
  if (!historyMonth) historyMonth = agg.currentPeriodKey('month');

  body.className = '';
  body.innerHTML = '';

  const picker = el(`
    <div class="period-picker">
      <button class="btn nav" data-role="prev" aria-label="Previous month">‹</button>
      <div class="period-center">
        <span class="period-label" data-role="label"></span>
        <span class="month-total" data-role="total"></span>
      </div>
      <button class="btn nav" data-role="next" aria-label="Next month">›</button>
    </div>`);
  const listWrap = el(`<div></div>`);
  body.append(picker, listWrap);

  function renderList() {
    picker.querySelector('[data-role=label]').textContent = agg.periodLabel(historyMonth, 'month');
    const monthEntries = entries
      .filter((e) => e.date.slice(0, 7) === historyMonth)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

    const totalEl = picker.querySelector('[data-role=total]');
    totalEl.innerHTML = '';
    listWrap.innerHTML = '';
    if (!monthEntries.length) {
      listWrap.appendChild(el(`<p class="empty">No entries this month.</p>`));
      return;
    }
    const total = monthEntries.reduce((s, e) => s + e.amount, 0);
    const totalAmt = el(`<b></b>`);
    totalAmt.textContent = agg.fmtUSD(total);
    totalEl.append('Month total ', totalAmt);

    let currentDate = null;
    let dayList = null;
    for (const e of monthEntries) {
      if (e.date !== currentDate) {
        currentDate = e.date;
        const daySum = monthEntries.filter((x) => x.date === e.date).reduce((s, x) => s + x.amount, 0);
        const header = el(`<div class="day-header"><span class="day-date"></span><span class="day-sum"></span></div>`);
        header.firstElementChild.textContent = e.date;
        header.lastElementChild.textContent = agg.fmtUSD(daySum);
        listWrap.appendChild(header);
        dayList = el(`<div class="day-list"></div>`);
        listWrap.appendChild(dayList);
      }
      dayList.appendChild(entryRow(e, `${e.type} · ${e.subcategory}`));
    }
  }

  picker.querySelector('[data-role=prev]').onclick = () => { historyMonth = agg.shiftPeriod(historyMonth, 'month', -1); renderList(); };
  picker.querySelector('[data-role=next]').onclick = () => { historyMonth = agg.shiftPeriod(historyMonth, 'month', 1); renderList(); };
  renderList();
}

// ---------- Edit ----------

async function renderEdit(id) {
  view.appendChild(pageHead('Edit expense', { photo: CAT.up }));
  let entries;
  try {
    entries = await api.loadAll();
  } catch (e) {
    view.appendChild(el(`<p class="form-error">${e.message}</p>`));
    return;
  }
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    view.appendChild(el(`<p class="form-error">Entry not found.</p>`));
    return;
  }
  const form = entryForm({
    entry,
    onSave: async (fields) => {
      await api.updateEntry({ id, ...fields });
      toast('Updated');
      location.hash = '#/history';
    },
    onDelete: async () => {
      await api.deleteEntry(id);
      toast('Deleted');
      location.hash = '#/history';
    }
  });
  view.appendChild(form);
}

// ---------- Analytics ----------

let anGranularity = 'month';
let anPeriod = null;
let pieChart = null;
let barChart = null;

async function renderAnalytics() {
  view.appendChild(el(`<h1>Analytics</h1>`));
  const body = el(`<div class="loading">Loading…</div>`);
  view.appendChild(body);
  let entries;
  try {
    entries = await api.loadAll();
  } catch (e) {
    body.className = 'form-error';
    body.textContent = e.message;
    return;
  }
  body.className = '';
  body.innerHTML = '';

  if (!anPeriod) anPeriod = agg.currentPeriodKey(anGranularity);

  const controls = el(`
    <div class="an-controls">
      <div class="seg" data-role="gran">
        <button data-g="month">Month</button>
        <button data-g="quarter">Quarter</button>
        <button data-g="year">Year</button>
      </div>
      <div class="period-picker">
        <button class="btn nav" data-role="prev" aria-label="Previous period">‹</button>
        <span class="period-label" data-role="label"></span>
        <button class="btn nav" data-role="next" aria-label="Next period">›</button>
      </div>
    </div>`);
  const pieCard = el(`
    <section class="card">
      <h2>Spend by type</h2>
      <div class="an-total"><span class="an-total-amt" data-role="total"></span><span class="an-total-caption">Total spent</span></div>
      <div class="pie-wrap">
        <canvas id="pie-canvas" role="img" aria-label="Spend distribution by type"></canvas>
        <img class="pie-photo" alt="">
      </div>
      <div class="pie-empty" data-role="pie-empty" hidden>
        <b>Shhh… cat nap in progress</b>
        <span>No entries in this period.</span>
      </div>
      <ol class="ranked" data-role="ranked"></ol>
    </section>`);
  pieCard.querySelector('.pie-photo').src = CAT.up;
  pieCard.querySelector('[data-role=pie-empty]').prepend(catFrame(CAT.nap, 'My cat curled up asleep', 150, { lifted: true, earsVar: '--sky' }));
  const barCard = el(`
    <section class="card">
      <div class="card-head"><h2 data-role="bar-title">Spend over time</h2>${pawSvg('paws')}</div>
      <div class="bar-wrap"><canvas id="bar-canvas" role="img" aria-label="Total spend per period"></canvas></div>
    </section>`);
  body.append(controls, pieCard, barCard);

  const mode = isDark() ? 'dark' : 'light';
  const colors = SERIES_COLORS[mode];
  const surface = CHART_SURFACE[mode];
  const css = getComputedStyle(document.documentElement);
  const inkMuted = css.getPropertyValue('--text-muted').trim();
  const gridline = css.getPropertyValue('--gridline').trim();
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

  function renderCharts() {
    controls.querySelectorAll('[data-g]').forEach((b) =>
      b.classList.toggle('selected', b.dataset.g === anGranularity));
    controls.querySelector('[data-role=label]').textContent = agg.periodLabel(anPeriod, anGranularity);

    // --- doughnut: top 7 types + Other, slices in validated slot-color order ---
    const totals = agg.sumByType(entries, anGranularity, anPeriod);
    const slices = agg.topWithOther(totals, 7);
    const grand = slices.reduce((s, x) => s + x.amount, 0);
    pieCard.querySelector('[data-role=total]').textContent = agg.fmtUSD(grand);

    const ranked = pieCard.querySelector('[data-role=ranked]');
    ranked.innerHTML = '';
    const allSorted = Object.entries(totals).map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);
    for (const { type, amount } of allSorted) {
      const sliceIdx = slices.findIndex((s) => s.type === type);
      const color = sliceIdx >= 0 ? colors[sliceIdx] : colors[slices.length - 1];
      const li = el(`<li><span class="swatch"></span><span class="rk-type"></span><span class="rk-amt"></span><span class="rk-pct"></span></li>`);
      li.querySelector('.swatch').style.background = color;
      li.querySelector('.rk-type').textContent = type;
      li.querySelector('.rk-amt').textContent = agg.fmtUSD(amount);
      li.querySelector('.rk-pct').textContent = grand ? `${Math.round((amount / grand) * 100)}%` : '';
      ranked.appendChild(li);
    }

    if (pieChart) pieChart.destroy();
    const pieCtx = document.getElementById('pie-canvas');
    // Hide the canvas rather than replacing it, so a later non-empty period can draw again.
    pieCard.querySelector('.pie-wrap').hidden = !slices.length;
    pieCard.querySelector('[data-role=pie-empty]').hidden = !!slices.length;
    if (!slices.length) {
      pieChart = null;
    } else {
      pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: slices.map((s) => s.type),
          datasets: [{
            data: slices.map((s) => s.amount),
            backgroundColor: slices.map((_, i) => colors[i]),
            borderColor: surface,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%', // leaves room for the cat photo in the middle

          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${agg.fmtUSD(c.parsed)} (${grand ? Math.round((c.parsed / grand) * 100) : 0}%)`
              }
            }
          }
        }
      });
    }

    // --- bar: totals per period through the selected one ---
    const lastN = anGranularity === 'month' ? 12 : anGranularity === 'quarter' ? 8 : 100;
    const series = agg.sumByPeriod(entries, anGranularity, anPeriod, lastN);
    barCard.querySelector('[data-role=bar-title]').textContent =
      anGranularity === 'month' ? 'Monthly totals' : anGranularity === 'quarter' ? 'Quarterly totals' : 'Yearly totals';

    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById('bar-canvas'), {
      type: 'bar',
      data: {
        labels: series.map((s) => agg.periodLabel(s.key, anGranularity)),
        datasets: [{
          data: series.map((s) => s.total),
          // the selected period (always the last bar) stands out
          backgroundColor: series.map((_, i) => (i === series.length - 1 ? colors[0] : colors[1])),
          borderRadius: { topLeft: 10, topRight: 10 },
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${agg.fmtUSD(c.parsed.y)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: inkMuted, maxRotation: 45 } },
          y: {
            beginAtZero: true,
            grid: { color: gridline },
            border: { display: false },
            ticks: { color: inkMuted, callback: (v) => '$' + Number(v).toLocaleString() }
          }
        }
      }
    });
  }

  controls.querySelectorAll('[data-g]').forEach((b) => {
    b.onclick = () => {
      anGranularity = b.dataset.g;
      anPeriod = agg.currentPeriodKey(anGranularity);
      renderCharts();
    };
  });
  controls.querySelector('[data-role=prev]').onclick = () => { anPeriod = agg.shiftPeriod(anPeriod, anGranularity, -1); renderCharts(); };
  controls.querySelector('[data-role=next]').onclick = () => { anPeriod = agg.shiftPeriod(anPeriod, anGranularity, 1); renderCharts(); };

  const refresh = el(`<button class="btn subtle">Refresh data</button>`);
  refresh.onclick = async () => {
    refresh.disabled = true;
    refresh.textContent = 'Refreshing…';
    try {
      entries = await api.loadAll(true);
      renderCharts();
    } catch (e) {
      toast(e.message);
    } finally {
      refresh.disabled = false;
      refresh.textContent = 'Refresh data';
    }
  };
  body.appendChild(refresh);

  renderCharts();
}

// ---------- Settings ----------

function renderSettings() {
  view.appendChild(el(`<h1>Settings</h1>`));
  const s = api.getSettings();
  const firstRun = !api.hasSettings();
  if (firstRun) {
    view.appendChild(el(`<p class="hint">Welcome! Paste your Apps Script web-app URL (ends in <code>/exec</code>) and your API token, then test the connection. See the README for the one-time Google Sheet setup.</p>`));
  }
  const form = el(`
    <form class="entry-form">
      <label class="field"><span>Apps Script URL</span>
        <input name="url" type="url" placeholder="https://script.google.com/macros/s/…/exec" required>
      </label>
      <label class="field"><span>API token</span>
        <input name="token" type="password" autocomplete="off" required>
      </label>
      <p class="form-error hidden" data-role="error"></p>
      <button type="submit" class="btn primary">Save &amp; test connection</button>
      <button type="button" class="btn subtle" data-role="reload">Reload app (update)</button>
    </form>`);
  form.url.value = s.url;
  form.token.value = s.token;
  const errEl = form.querySelector('[data-role=error]');
  form.onsubmit = async (ev) => {
    ev.preventDefault();
    errEl.classList.add('hidden');
    api.saveSettings(form.url.value, form.token.value);
    const btn = form.querySelector('.primary');
    btn.disabled = true;
    btn.textContent = 'Testing…';
    try {
      await api.testConnection();
      toast('Connected ✓');
      location.hash = '#/home';
    } catch (e) {
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save & test connection';
    }
  };
  form.querySelector('[data-role=reload]').onclick = async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    location.reload();
  };
  view.appendChild(form);
}

// ---------- boot ----------

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
// Installed apps may still launch with "#/add" pinned in a cached manifest
// start_url; a cold start should land on Home, so rewrite that hash first.
if (location.hash === '#/add') history.replaceState(null, '', '#/home');
route();
