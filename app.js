import { TAXONOMY, TYPES, SERIES_COLORS, CHART_SURFACE } from './taxonomy.js';
import * as api from './api.js';
import * as agg from './analytics.js';

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
      <label class="field">
        <span>Amount</span>
        <input name="amount" type="number" inputmode="decimal" step="0.01" min="0.01" placeholder="0.00" required class="amount-input">
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
      <button type="submit" class="btn primary" data-role="save">Save</button>
    </form>`);

  const dl = document.getElementById('merchant-list');
  dl.innerHTML = merchants().map((m) => `<option value="${m.replace(/"/g, '&quot;')}">`).join('');

  const typeGrid = f.querySelector('[data-role=types]');
  const subWrap = f.querySelector('[data-role=subwrap]');
  const subGrid = f.querySelector('[data-role=subs]');
  const errEl = f.querySelector('[data-role=error]');
  const saveBtn = f.querySelector('[data-role=save]');
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
    saveBtn.textContent = 'Saving…';
    try {
      await onSave(fields);
    } catch (e) {
      showError(e.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
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
  view.appendChild(el(`<h1>${agg.periodLabel(monthKey, 'month')}</h1>`));
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
      <p class="hero-total"></p>
      <p class="hero-caption">spent this month</p>
      <div class="hero-stats">
        <span>Today <b data-role="today"></b></span>
        <span data-role="topwrap">Top <b data-role="top"></b></span>
      </div>
    </section>`);
  hero.querySelector('.hero-total').textContent = agg.fmtUSD(monthTotal);
  hero.querySelector('[data-role=today]').textContent = agg.fmtUSD(todayTotal);
  if (topType) {
    hero.querySelector('[data-role=top]').textContent = `${topType[0]} · ${agg.fmtUSD(topType[1])}`;
  } else {
    hero.querySelector('[data-role=topwrap]').remove();
  }
  body.appendChild(hero);

  const addBtn = el(`<button class="btn primary block">＋ Add expense</button>`);
  addBtn.onclick = () => { location.hash = '#/add'; };
  body.appendChild(addBtn);

  const recent = entries.slice()
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);
  if (!recent.length) {
    body.appendChild(el(`<p class="empty">No entries yet — add your first expense.</p>`));
    return;
  }
  body.appendChild(el(`<h2>Recent</h2>`));
  const list = el(`<div class="day-list"></div>`);
  for (const e of recent) {
    const row = el(`
      <button class="entry-row">
        <span class="entry-main"><span class="entry-merchant"></span><span class="entry-cat"></span></span>
        <span class="entry-amount"></span>
      </button>`);
    row.querySelector('.entry-merchant').textContent = e.merchant || '(no merchant)';
    row.querySelector('.entry-cat').textContent = `${e.date} · ${e.type} · ${e.subcategory}`;
    row.querySelector('.entry-amount').textContent = agg.fmtUSD(e.amount);
    row.onclick = () => { location.hash = `#/edit/${e.id}`; };
    list.appendChild(row);
  }
  body.appendChild(list);
}

// ---------- Add ----------

function renderAdd() {
  view.appendChild(el(`<h1>Add expense</h1>`));
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
      <div class="confirm-check" aria-hidden="true">✓</div>
      <h1>Added successfully</h1>
      <div class="card confirm-card">
        <p class="confirm-amount"></p>
        <p class="confirm-line" data-role="cat"></p>
        <p class="confirm-line" data-role="meta"></p>
      </div>
      <button class="btn primary block" data-role="again">＋ Add another</button>
      <button class="btn block" data-role="home">Go to Home</button>
    </section>`);
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
      <span class="period-label" data-role="label"></span>
      <button class="btn nav" data-role="next" aria-label="Next month">›</button>
    </div>`);
  const listWrap = el(`<div></div>`);
  body.append(picker, listWrap);

  function renderList() {
    picker.querySelector('[data-role=label]').textContent = agg.periodLabel(historyMonth, 'month');
    const monthEntries = entries
      .filter((e) => e.date.slice(0, 7) === historyMonth)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

    listWrap.innerHTML = '';
    if (!monthEntries.length) {
      listWrap.appendChild(el(`<p class="empty">No entries this month.</p>`));
      return;
    }
    const total = monthEntries.reduce((s, e) => s + e.amount, 0);
    const totalRow = el(`<p class="month-total"></p>`);
    totalRow.textContent = `Month total: ${agg.fmtUSD(total)}`;
    listWrap.appendChild(totalRow);

    let currentDate = null;
    let dayList = null;
    for (const e of monthEntries) {
      if (e.date !== currentDate) {
        currentDate = e.date;
        const daySum = monthEntries.filter((x) => x.date === e.date).reduce((s, x) => s + x.amount, 0);
        const header = el(`<div class="day-header"><span></span><span class="day-sum"></span></div>`);
        header.firstElementChild.textContent = e.date;
        header.lastElementChild.textContent = agg.fmtUSD(daySum);
        listWrap.appendChild(header);
        dayList = el(`<div class="day-list"></div>`);
        listWrap.appendChild(dayList);
      }
      const row = el(`
        <button class="entry-row">
          <span class="entry-main"><span class="entry-merchant"></span><span class="entry-cat"></span></span>
          <span class="entry-amount"></span>
        </button>`);
      row.querySelector('.entry-merchant').textContent = e.merchant || '(no merchant)';
      row.querySelector('.entry-cat').textContent = `${e.type} · ${e.subcategory}`;
      row.querySelector('.entry-amount').textContent = agg.fmtUSD(e.amount);
      row.onclick = () => { location.hash = `#/edit/${e.id}`; };
      dayList.appendChild(row);
    }
  }

  picker.querySelector('[data-role=prev]').onclick = () => { historyMonth = agg.shiftPeriod(historyMonth, 'month', -1); renderList(); };
  picker.querySelector('[data-role=next]').onclick = () => { historyMonth = agg.shiftPeriod(historyMonth, 'month', 1); renderList(); };
  renderList();
}

// ---------- Edit ----------

async function renderEdit(id) {
  view.appendChild(el(`<h1>Edit expense</h1>`));
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
      <div class="pie-wrap"><canvas id="pie-canvas" role="img" aria-label="Spend distribution by type"></canvas></div>
      <ol class="ranked" data-role="ranked"></ol>
    </section>`);
  const barCard = el(`
    <section class="card">
      <h2 data-role="bar-title">Spend over time</h2>
      <div class="bar-wrap"><canvas id="bar-canvas" role="img" aria-label="Total spend per period"></canvas></div>
    </section>`);
  body.append(controls, pieCard, barCard);

  const mode = isDark() ? 'dark' : 'light';
  const colors = SERIES_COLORS[mode];
  const surface = CHART_SURFACE[mode];
  const css = getComputedStyle(document.documentElement);
  const inkMuted = css.getPropertyValue('--text-muted').trim();
  const gridline = css.getPropertyValue('--gridline').trim();

  function renderCharts() {
    controls.querySelectorAll('[data-g]').forEach((b) =>
      b.classList.toggle('selected', b.dataset.g === anGranularity));
    controls.querySelector('[data-role=label]').textContent = agg.periodLabel(anPeriod, anGranularity);

    // --- doughnut: top 7 types + Other, slices in validated slot-color order ---
    const totals = agg.sumByType(entries, anGranularity, anPeriod);
    const slices = agg.topWithOther(totals, 7);
    const grand = slices.reduce((s, x) => s + x.amount, 0);

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
    if (!slices.length) {
      pieCard.querySelector('.pie-wrap').innerHTML = '<p class="empty">No entries in this period.</p>';
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
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
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
          backgroundColor: colors[0],
          borderRadius: { topLeft: 4, topRight: 4 },
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
