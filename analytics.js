// Pure aggregation helpers. Dates are YYYY-MM-DD strings end-to-end; period
// keys are derived with string math so no timezone shifts can creep in.

export function periodKey(dateStr, granularity) {
  const year = dateStr.slice(0, 4);
  const month = Number(dateStr.slice(5, 7));
  if (granularity === 'year') return year;
  if (granularity === 'quarter') return `${year}-Q${Math.ceil(month / 3)}`;
  return dateStr.slice(0, 7);
}

export function periodLabel(key, granularity) {
  if (granularity === 'month') {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
  }
  return key;
}

export function currentPeriodKey(granularity) {
  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  return periodKey(iso, granularity);
}

export function shiftPeriod(key, granularity, delta) {
  if (granularity === 'year') return String(Number(key) + delta);
  if (granularity === 'quarter') {
    const q = Number(key.slice(6)) - 1 + delta;
    const year = Number(key.slice(0, 4)) + Math.floor(q / 4);
    return `${year}-Q${((q % 4) + 4) % 4 + 1}`;
  }
  const m = Number(key.slice(5, 7)) - 1 + delta;
  const year = Number(key.slice(0, 4)) + Math.floor(m / 12);
  return `${year}-${String(((m % 12) + 12) % 12 + 1).padStart(2, '0')}`;
}

export function sumByType(entries, granularity, key) {
  const totals = {};
  for (const e of entries) {
    if (periodKey(e.date, granularity) !== key) continue;
    totals[e.type] = (totals[e.type] || 0) + e.amount;
  }
  return totals;
}

// Ordered list of {key, total} covering every period from the first entry
// through `throughKey` inclusive (zero-filled), capped at `lastN` periods.
export function sumByPeriod(entries, granularity, throughKey, lastN) {
  const totals = {};
  let firstKey = throughKey;
  for (const e of entries) {
    const k = periodKey(e.date, granularity);
    totals[k] = (totals[k] || 0) + e.amount;
    if (k < firstKey) firstKey = k;
  }
  const out = [];
  for (let k = throughKey; k >= firstKey && out.length < lastN; k = shiftPeriod(k, granularity, -1)) {
    out.push({ key: k, total: totals[k] || 0 });
  }
  return out.reverse();
}

// Top-N types by amount plus an "Other" rollup; returns [{type, amount}].
export function topWithOther(totalsByType, topN) {
  const sorted = Object.entries(totalsByType)
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => b.amount - a.amount);
  if (sorted.length <= topN + 1) return sorted;
  const top = sorted.slice(0, topN);
  const rest = sorted.slice(topN).reduce((s, x) => s + x.amount, 0);
  top.push({ type: 'Other types', amount: rest });
  return top;
}

export function fmtUSD(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
