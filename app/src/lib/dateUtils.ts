export function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

export function mondayOf(d: Date): Date {
  const r = new Date(d); const day = (r.getDay() + 6) % 7;
  r.setHours(0, 0, 0, 0); return addDays(r, -day);
}

export function fmtISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function sameDay(a: Date, b: Date): boolean { return fmtISO(a) === fmtISO(b); }

export function md(d: Date): string {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${MON[d.getMonth()]} ${d.getDate()}`;
}

export function hourLabel(h: number): string {
  const ap = h >= 12 ? 'PM' : 'AM'; let hh = h % 12; if (hh === 0) hh = 12; return `${hh} ${ap}`;
}