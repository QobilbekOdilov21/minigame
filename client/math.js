export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const iso = (x, y, z = 0) => ({ x: (x - y) * 48, y: (x + y) * 24 - z });
export const uniso = (x, y) => ({ x: x / 96 + y / 48, y: y / 48 - x / 96 });
export function wall(map, x, y) {
  return map[Math.floor(y)]?.[Math.floor(x)] !== 0;
}
export function valid(map, x, y, r = 0.26, gates = [], props = []) {
  return (
    ![
      [x - r, y - r],
      [x + r, y - r],
      [x - r, y + r],
      [x + r, y + r],
    ].some(([a, b]) => wall(map, a, b)) &&
    !gates.some(
      (g) =>
        g.locked &&
        Math.abs(x - g.x) < 0.43 + r &&
        Math.abs(y - g.y) < 0.43 + r,
    ) &&
    !props.some(
      (p) =>
        p.solid &&
        Math.abs(x - p.x) < p.radius + r &&
        Math.abs(y - p.y) < p.radius + r,
    )
  );
}
export function clear(map, a, b, gates = []) {
  const n = Math.ceil(distance(a, b) * 8);
  for (let i = 1; i < n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n,
      y = a.y + ((b.y - a.y) * i) / n;
    if (
      wall(map, x, y) ||
      gates.some(
        (g) => g.locked && Math.abs(x - g.x) < 0.42 && Math.abs(y - g.y) < 0.42,
      )
    )
      return false;
  }
  return true;
}
export function hash(x, y, seed = 0) {
  let n =
    (Math.imul(x + 13, 374761393) + Math.imul(y + 17, 668265263) + seed) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}
export const screenDirection = (a) => {
  const p = iso(Math.cos(a), Math.sin(a));
  return (Math.round(Math.atan2(p.y, p.x) / (Math.PI / 4)) + 8) % 8;
};
