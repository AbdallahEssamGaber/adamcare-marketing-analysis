export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function getDelta(current, previous) {
  if (!previous || previous === 0) return null;
  const pct = (((current - previous) / previous) * 100).toFixed(1);
  return { value: pct, positive: Number(pct) >= 0 };
}

export function weekIndex(day) {
  return Math.min(Math.floor((day - 1) / 7), 3);
}

export function previousMonth({ year, month }) {
  let pm = month - 1;
  let py = year;
  if (pm === 0) {
    pm = 12;
    py--;
  }
  return { year: py, month: pm };
}
