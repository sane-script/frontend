export function sparkPath(arr: number[], w: number, h: number): string {
  const min = Math.min(...arr), max = Math.max(...arr), rng = (max - min) || 1;
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * w;
    const y = h - ((v - min) / rng) * (h - 2) - 1;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

export function chartLinePath(arr: number[], W: number, H: number): string {
  const min = Math.min(...arr), max = Math.max(...arr), rng = (max - min) || 1;
  const cx = (i: number) => (i / (arr.length - 1)) * W;
  const cy = (v: number) => 8 + (H - 16) - ((v - min) / rng) * (H - 16);
  return arr.map((v, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join(' ');
}

export function chartAreaPath(arr: number[], W: number, H: number): string {
  const min = Math.min(...arr), max = Math.max(...arr), rng = (max - min) || 1;
  const cx = (i: number) => (i / (arr.length - 1)) * W;
  const cy = (v: number) => 8 + (H - 16) - ((v - min) / rng) * (H - 16);
  const linePoints = arr.map((v, i) => `L${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join(' ');
  return `M0 ${H} ${linePoints} L${W} ${H} Z`;
}

export function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return String(n);
}