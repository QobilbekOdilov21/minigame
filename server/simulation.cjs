"use strict";
const { randomUUID } = require("node:crypto");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const uid = () => randomUUID();
const colorFor = (i) => `hsl(${(i * 137.508 + 32) % 360} 62% 65%)`;
function hash(x, y, seed = 0) {
  let n =
    (Math.imul(x + 13, 374761393) + Math.imul(y + 17, 668265263) + seed) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}
const QUIZZES = require("./quiz-bank.json");
const MODES = {
  team: {
    name: "TEAM CLASH",
    summary:
      "Qizillar vs Ko‘klar. Raqiblarni yenging va data-core qurilmasini himoya qiling yoki faollashtiring.",
    type: "tactical",
  },
  ffa: {
    name: "FREE FOR ALL",
    summary:
      "Barcha o‘yinchilar mustaqil. Eng ko‘p raqibni yenggan va omon qolgan g‘olib.",
    type: "survival",
  },
  impostor: {
    name: "SECRET AGENT",
    summary:
      "Agentlar topshiriqlarni bajaradi. Xoin yashirin hujum qiladi; yig‘ilishda kimga ishonishni hal qiling.",
    type: "social",
  },
  escape: {
    name: "MAZE ESCAPE",
    summary:
      "Uchta kod-parchani toping, jumboq yeching va chiqish portaliga birinchi yetib boring.",
    type: "puzzle",
  },
  double: {
    name: "DOUBLE AGENT",
    summary:
      "Ikki jamoa, lekin har biri orasida o‘z tomoniga sabotaj qiladigan sirli xoin bor.",
    type: "betrayal",
  },
};
const TEAMS = [
  { name: "QIZILLAR", color: "#f0806e" },
  { name: "KO‘KLAR", color: "#82b9d6" },
];
const { WEAPONS, SHOP } = require("../shared/config.json");

function generateMaze(n, seed) {
  // Deterministic connected facility: five rooms and wide navigable corridors.
  n = n | 1;
  let state = seed >>> 0;
  const rng = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const g = Array.from({ length: n }, () => Array(n).fill(1));
  const mid = Math.floor(n / 2);
  const carve = (x, y, w, h) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++)
        if (xx > 0 && yy > 0 && xx < n - 1 && yy < n - 1) g[yy][xx] = 0;
  };
  const centers = [
    [6, 6],
    [n - 7, 6],
    [mid, mid],
    [6, n - 7],
    [n - 7, n - 7],
  ];
  for (const [x, y] of centers) carve(x - 4, y - 4, 9, 9);
  for (let i = 0; i < centers.length - 1; i++) {
    const [a, b] = centers[i],
      [c, d] = centers[i + 1];
    carve(Math.min(a, c), b - 1, Math.abs(c - a) + 1, 3);
    carve(c - 1, Math.min(b, d), 3, Math.abs(d - b) + 1);
  }
  carve(5, mid - 1, n - 10, 3);
  carve(mid - 1, 5, 3, n - 10);
  for (const [cx, cy] of centers)
    for (let i = 0; i < 3; i++) {
      const x = cx + Math.floor(rng() * 7) - 3,
        y = cy + Math.floor(rng() * 7) - 3;
      if (Math.abs(x - cx) > 1 && Math.abs(y - cy) > 1) g[y][x] = 1;
    }
  return g;
}
const isWall = (grid, x, y) =>
  !grid ||
  y < 0 ||
  x < 0 ||
  y >= grid.length ||
  x >= grid.length ||
  grid[Math.floor(y)][Math.floor(x)] === 1;
function lineClear(grid, ax, ay, bx, by) {
  const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * 7);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isWall(grid, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}
function spawnCells(map) {
  const cells = [];
  for (let y = 2; y < map.length - 2; y++)
    for (let x = 2; x < map.length - 2; x++)
      if (!map[y][x]) cells.push({ x: x + 0.5, y: y + 0.5 });
  return cells;
}
const randomCell = (cells) =>
  cells[Math.floor(Math.random() * cells.length)] || { x: 1.5, y: 1.5 };
function validMove(map, x, y, r = 0.28) {
  return (
    !isWall(map, x - r, y - r) &&
    !isWall(map, x + r, y - r) &&
    !isWall(map, x - r, y + r) &&
    !isWall(map, x + r, y + r)
  );
}
class World {
  constructor(
    config,
    players,
    matchWins,
    round = 1,
    seed = Math.floor(Math.random() * 1e8),
  ) {
    this.config = config;
    this.mode = config.mode;
    this.round = round;
    this.seed = seed;
    this.map = generateMaze(
      config.mapSize === "large" ? 51 : config.mapSize === "small" ? 29 : 39,
      seed,
    );
    this.size = this.map.length;
    this.cells = spawnCells(this.map);
    this.started = Date.now();
    this.endsAt = this.started + config.duration * 1000;
    this.phase = "playing";
    this.paused = false;
    this.pauseStarted = 0;
    this.last = Date.now();
    this.players = new Map();
    this.bullets = [];
    this.drops = [];
    this.terminals = [];
    this.gates = [];
    this.smokes = [];
    this.monsters = [];
    this.lamps = [];
    this.pathCache = new Map();
    this.pathCacheAt = 0;
    this.events = [];
    this.eventNum = 0;
    this.nextBullet = 0;
    this.matchWins = matchWins || [0, 0];
    this.bomb = {
      planted: false,
      expiresAt: 0,
      site: this.near({ x: this.size / 2, y: this.size / 2 }),
      carrier: null,
    };
    this.exit = this.near({ x: this.size - 3.5, y: this.size - 3.5 });
    this.meeting = null;
    this.sabotageEndsAt = 0;
    this.sabotageTeam = -1;
    this.roundWinner = null;
    this.roundReason = "";
    this.roundEndAt = 0;
    this.lastSignal = 0;
    this.lastDropAt = Date.now();
    this.quizSeen = new Set();
    this.placeObjects();
    this.addPlayers(players);
    this.createLights();
    this.spawnMonsters();
    this.buyEndsAt = this.config.practice ? 0 : Date.now() + 6000;
    this.props = [];
    this.decorate();
  }
  near(pos) {
    let b = this.cells[0],
      d = Infinity;
    for (const cell of this.cells) {
      const v = distance(pos, cell);
      if (v < d) {
        b = cell;
        d = v;
      }
    }
    return { x: b.x, y: b.y };
  }
  placeObjects() {
    const candidates = [...this.cells].sort(() => Math.random() - 0.5);
    const isFar = (x, y) =>
      distance({ x, y }, this.bomb.site) > 3 &&
      distance({ x, y }, this.exit) > 2.8;
    for (const c of candidates) {
      if (
        this.config.puzzles &&
        this.terminals.length <
          Math.min(9, Math.max(5, Math.floor(this.size / 5))) &&
        isFar(c.x, c.y) &&
        this.terminals.every((t) => distance(t, c) > 5)
      ) {
        this.terminals.push({
          id: "term" + this.terminals.length,
          x: c.x,
          y: c.y,
          quiz: this.nextQuiz(),
          solved: false,
          by: null,
        });
      }
      if (
        this.drops.length < Math.floor(this.size * 0.45) &&
        isFar(c.x, c.y) &&
        this.drops.every((d) => distance(d, c) > 2.4)
      )
        this.drops.push({
          id: uid(),
          x: c.x,
          y: c.y,
          kind: [
            "cash",
            "cash",
            "ammo",
            "medkit",
            "armor",
            "weapon",
            "scanner",
            "energy",
          ][Math.floor(Math.random() * 8)],
          amount: 90 + Math.floor(rand(0, 5)) * 30,
        });
      if (
        this.terminals.length >= 8 &&
        this.drops.length >= Math.floor(this.size * 0.45)
      )
        break;
    }
    for (const c of candidates) {
      if (this.gates.length >= 4) break;
      if (
        isFar(c.x, c.y) &&
        this.gates.every((g) => distance(g, c) > 6) &&
        this.terminals.every((t) => distance(t, c) > 2.2)
      ) {
        this.gates.push({
          id: "gate" + this.gates.length,
          x: c.x,
          y: c.y,
          locked: true,
        });
      }
    }
  }

  nextQuiz() {
    this.quizSeen ||= new Set();
    if (this.quizSeen.size >= QUIZZES.length) this.quizSeen.clear();
    if (!this.quizDeck?.length) {
      this.quizDeck = Array.from(
        { length: QUIZZES.length },
        (_, i) => i,
      ).filter((id) => !this.quizSeen.has(id));
      for (let i = this.quizDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.quizDeck[i], this.quizDeck[j]] = [
          this.quizDeck[j],
          this.quizDeck[i],
        ];
      }
    }
    const id = this.quizDeck.pop();
    this.quizSeen.add(id);
    return id;
  }
  createLights() {
    let seq = 0;
    for (let y = 3; y < this.size - 3; y += 4)
      for (let x = 3; x < this.size - 3; x += 4) {
        const cx = x + (hash(x, y, this.seed) % 4),
          cy = y + (hash(y, x, this.seed) % 4);
        if (!this.map[cy]?.[cx] && hash(cx, cy, this.seed) % 3 !== 0)
          this.lamps.push({
            x: cx + 0.5,
            y: cy + 0.5,
            r: 2.7 + (hash(cy, cx, this.seed) % 5) * 0.14,
            color: seq++ % 5 === 0 ? "amber" : "mint",
          });
      }
  }
  spawnMonsters() {
    const total =
      { none: 0, few: 4, normal: 8, horde: 15 }[this.config.monsters] || 0;
    const occupants = [...this.players.values()];
    const cells = [...this.cells].sort(() => Math.random() - 0.5);
    for (const c of cells) {
      if (this.monsters.length >= total) break;
      if (
        occupants.some((p) => distance(p, c) < 3) ||
        this.monsters.some((m) => distance(m, c) < 1.8) ||
        distance(c, this.exit) < 2
      )
        continue;
      const kind = ["walker", "brute", "stalker", "toxic", "runner", "boss"][
        this.monsters.length % 6
      ];
      this.monsters.push({
        id: "creature-" + this.monsters.length,
        x: c.x,
        y: c.y,
        a: 0,
        hp: kind === "boss" ? 340 : kind === "brute" ? 145 : 70,
        maxHp: kind === "boss" ? 340 : kind === "brute" ? 145 : 70,
        alive: true,
        kind,
        attackAt: 0,
        pathAt: 0,
        stepDir: null,
      });
    }
  }
  flowTo(target) {
    const tx = Math.floor(target.x),
      ty = Math.floor(target.y),
      n = this.size,
      key = tx + "," + ty;
    if (Date.now() - this.pathCacheAt > 800) {
      this.pathCache.clear();
      this.pathCacheAt = Date.now();
    }
    if (this.pathCache.has(key)) return this.pathCache.get(key);
    const dist = new Int16Array(n * n).fill(-1),
      queue = new Int32Array(n * n),
      start = ty * n + tx;
    dist[start] = 0;
    queue[0] = start;
    let head = 0,
      tail = 1;
    while (head < tail) {
      const i = queue[head++],
        x = i % n,
        y = Math.floor(i / n);
      for (const k of [1, -1, n, -n]) {
        const v = i + k;
        const nx = v % n,
          ny = Math.floor(v / n);
        if (
          v < 0 ||
          v >= n * n ||
          Math.abs(nx - x) + Math.abs(ny - y) !== 1 ||
          this.map[ny][nx] ||
          dist[v] >= 0
        )
          continue;
        dist[v] = dist[i] + 1;
        queue[tail++] = v;
      }
    }
    this.pathCache.set(key, dist);
    return dist;
  }
  moveMonsters(dt, now) {
    const live = [...this.players.values()].filter((p) => p.alive && p.active);
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const speed =
        {
          walker: 1.05,
          brute: 0.85,
          stalker: 1.65,
          toxic: 1.1,
          runner: 2.4,
          boss: 0.8,
        }[m.kind] || 1.3;
      const nearest = live
        .filter(
          (p) =>
            distance(m, p) < 12 &&
            (this.sight(m, p) ||
              (now - p.lastFire < 600 && distance(m, p) < 9)),
        )
        .sort((a, b) => distance(m, a) - distance(m, b))[0];
      if (nearest) {
        m.target = { x: nearest.x, y: nearest.y };
        m.memoryUntil = now + 4000;
        m.state = "chase";
      } else if (m.target && now < m.memoryUntil) m.state = "search";
      else {
        m.state = "patrol";
        if (
          !m.target ||
          distance(m, m.target) < 0.3 ||
          now > (m.patrolUntil || 0)
        ) {
          m.target = this.cells[Math.floor(Math.random() * this.cells.length)];
          m.patrolUntil = now + 5000;
        }
      }
      if (nearest && distance(m, nearest) < 0.8 && this.sight(m, nearest)) {
        m.state = "attack";
        if (now > m.attackAt) {
          m.attackAt = now + (m.kind === "runner" ? 900 : 1400);
          this.damage(
            nearest,
            m.kind === "boss" ? 30 : m.kind === "brute" ? 20 : 10,
            m.id,
          );
        }
        continue;
      }
      const t = m.target;
      if (!t) continue;
      let dest = t;
      if (!this.sight(m, t)) {
        const field = this.flowTo(t),
          x = Math.floor(m.x),
          y = Math.floor(m.y);
        let best = Infinity;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const xx = x + dx,
            yy = y + dy;
          if (isWall(this.map, xx + 0.5, yy + 0.5)) continue;
          const d = field[yy * this.size + xx];
          if (d >= 0 && d < best) {
            best = d;
            dest = { x: xx + 0.5, y: yy + 0.5 };
          }
        }
      }
      const dx = dest.x - m.x,
        dy = dest.y - m.y,
        len = Math.hypot(dx, dy);
      if (len > 0.08) {
        m.a = Math.atan2(dy, dx);
        const step = Math.min(len, speed * dt);
        if (this.collide(m.x + (dx / len) * step, m.y, 0.2))
          m.x += (dx / len) * step;
        if (this.collide(m.x, m.y + (dy / len) * step, 0.2))
          m.y += (dy / len) * step;
      }
    }
  }
  hitMonster(m, damage, owner) {
    if (!m.alive) return;
    m.hp = Math.max(0, m.hp - damage);
    this.event("monster_hit", { x: m.x, y: m.y });
    if (m.hp > 0) return;
    m.alive = false;
    const p = this.getPlayer(owner);
    if (p) {
      p.credits = clamp(p.credits + (m.kind === "brute" ? 160 : 80), 0, 9999);
      p.score += m.kind === "brute" ? 110 : 60;
    }
    const rewards = ["ammo", "cash", "medkit", "armor", "weapon", "energy"];
    this.drops.push({
      id: uid(),
      x: m.x,
      y: m.y,
      kind: rewards[Math.floor(Math.random() * rewards.length)],
      amount: 90 + Math.floor(rand(0, 5)) * 30,
    });
    this.event("monster_death", { x: m.x, y: m.y, team: 2, kindType: m.kind });
  }
  rollChest() {
    const rewards = [
      "cash",
      "cash",
      "ammo",
      "ammo",
      "medkit",
      "armor",
      "energy",
      "scanner",
      "weapon",
      "weapon",
      "key",
    ];
    return rewards[Math.floor(Math.random() * rewards.length)];
  }
  addPlayers(raw) {
    const order = [...raw]
      .filter((p) => p.participates)
      .sort((a, b) => a.joined - b.joined || a.id.localeCompare(b.id));
    const occupied = [];
    for (let i = 0; i < order.length; i++) {
      const u = order[i];
      let team = this.mode === "team" || this.mode === "double" ? i % 2 : -1;
      const target =
        team === 0
          ? { x: 3, y: 3 }
          : team === 1
            ? { x: this.size - 4, y: this.size - 4 }
            : { x: rand(4, this.size - 4), y: rand(4, this.size - 4) };
      let pool = this.cells.filter(
        (c) =>
          distance(c, target) <
            (this.mode === "team" || this.mode === "double" ? 8 : this.size) &&
          occupied.every((o) => distance(o, c) > 3.2),
      );
      if (!pool.length)
        pool = this.cells.filter((c) =>
          occupied.every((o) => distance(o, c) > 2),
        );
      const cell = randomCell(pool.length ? pool : this.cells);
      occupied.push(cell);
      const previous = u.stats || {};
      const p = {
        id: u.id,
        name: u.name,
        team,
        role: "operative",
        color: team < 0 ? colorFor(i) : TEAMS[team].color,
        x: cell.x,
        y: cell.y,
        a: 0,
        hp: 100,
        armor: 0,
        lives: this.config.lives,
        alive: true,
        respawnAt: 0,
        kills: previous.kills || 0,
        deaths: previous.deaths || 0,
        assists: previous.assists || 0,
        score: previous.score || 0,
        credits: clamp(previous.credits ?? 700, 0, 9999),
        inventory: {
          pistol: { mag: 12, reserve: this.config.ammo === "scarce" ? 12 : 36 },
        },
        weapon: "pistol",
        items: { scanner: 0, smoke: 0, key: 0, medkit: 0 },
        pieces: previous.pieces || 0,
        meetingsLeft: 1,
        stamina: 100,
        input: { dx: 0, dy: 0, aim: 0, fire: false, run: false },
        lastFire: 0,
        reloadAt: 0,
        lastSpecial: 0,
        scannerEndsAt: 0,
        lastAttacker: null,
        lastDamageAt: 0,
        taskCount: 0,
        joined: u.joined,
        active: true,
      };
      if (this.mode === "impostor") {
        p.inventory = { pistol: { mag: 0, reserve: 0 } };
        p.credits = 0;
      }
      this.players.set(p.id, p);
    }
    const active = [...this.players.values()];
    if (this.mode === "impostor" && active.length >= 2) {
      const n = Math.max(1, Math.floor(active.length / 5));
      const arr = [...active].sort(() => Math.random() - 0.5);
      arr.slice(0, n).forEach((p) => (p.role = "traitor"));
      active
        .filter((p) => p.role !== "traitor")
        .forEach((p) => (p.role = "crew"));
    }
    if (this.mode === "double" && active.length >= 4)
      for (const team of [0, 1]) {
        const group = active.filter((p) => p.team === team);
        if (group.length > 1) {
          group[Math.floor(Math.random() * group.length)].role = "double";
        }
      }
  }
  event(kind, more = {}) {
    const e = { id: ++this.eventNum, kind, time: Date.now(), ...more };
    this.events.push(e);
    if (this.events.length > 100) this.events.shift();
    return e;
  }
  collide(x, y, r = 0.26) {
    return (
      validMove(this.map, x, y, r) &&
      !this.gates.some(
        (g) =>
          g.locked &&
          Math.abs(x - g.x) < 0.43 + r &&
          Math.abs(y - g.y) < 0.43 + r,
      ) &&
      !(this.props || []).some(
        (p) =>
          p.solid &&
          Math.abs(x - p.x) < p.radius + r &&
          Math.abs(y - p.y) < p.radius + r,
      )
    );
  }
  getPlayer(id) {
    return this.players.get(id);
  }
  setInput(id, d) {
    const p = this.getPlayer(id);
    if (!p || !p.alive) return;
    p.input = {
      dx: clamp(Number(d.dx) || 0, -1, 1),
      dy: clamp(Number(d.dy) || 0, -1, 1),
      aim: Number.isFinite(d.aim) ? d.aim : 0,
      fire: !!d.fire,
      run: !!d.run,
    };
    p.seq = Number.isSafeInteger(d.seq) ? d.seq : p.seq || 0;
    p.inputAt = Date.now();
  }
  step(dt) {
    if (this.paused || this.phase === "round_end" || this.phase === "match_end")
      return;
    const now = Date.now();
    this.smokes = this.smokes.filter((s) => s.until > now);
    if (this.phase === "meeting") {
      if (now > this.meeting.endsAt) this.resolveMeeting();
      return;
    }
    for (const p of this.players.values()) {
      if (!p.alive) {
        if (
          p.lives > 0 &&
          p.respawnAt &&
          now > p.respawnAt &&
          this.phase === "playing"
        ) {
          const cell = this.near({
            x: p.team === 0 ? 2 : this.size - 3,
            y: p.team === 1 ? this.size - 3 : 3,
          });
          p.x = cell.x;
          p.y = cell.y;
          p.hp = 100;
          p.armor = 0;
          p.inventory = { pistol: { mag: 12, reserve: 24 } };
          p.alive = true;
          p.respawnAt = 0;
          p.input.fire = false;
          this.event("respawn", { player: p.name, x: p.x, y: p.y });
        }
        continue;
      }
      if (p.reloadAt && now >= p.reloadAt) {
        const gun = p.inventory[p.weapon];
        if (gun) {
          const w = WEAPONS[p.weapon],
            taken = Math.min(w.mag - gun.mag, gun.reserve);
          gun.mag += taken;
          gun.reserve -= taken;
        }
        p.reloadAt = 0;
      }
      if (now - (p.inputAt || now) > 300)
        p.input = { dx: 0, dy: 0, aim: p.a, fire: false, run: false };
      const ix = p.input.dx,
        iy = p.input.dy,
        mag = Math.hypot(ix, iy),
        run = p.input.run && p.stamina > 3,
        spd = (run ? 4.8 : 3.25) * dt,
        nx = ix / mag || 0,
        ny = iy / mag || 0;
      if (mag > 0.01 && now > this.buyEndsAt) {
        if (this.collide(p.x + nx * spd, p.y)) p.x += nx * spd;
        if (this.collide(p.x, p.y + ny * spd)) p.y += ny * spd;
      }
      p.stamina = clamp(
        p.stamina + (run && mag > 0.01 ? -35 : 20) * dt,
        0,
        100,
      );
      p.a = p.input.aim;
      if (p.input.fire && now > this.buyEndsAt && this.mode !== "impostor")
        this.fire(p, now);
      // Health is never regenerated automatically: the medkit economy matters.
    }
    if (now > this.buyEndsAt) this.moveMonsters(dt, now);
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      let removed = false,
        steps = Math.max(2, Math.ceil(b.speed * dt * 4));
      for (let j = 0; j < steps; j++) {
        b.x += (b.dx * b.speed * dt) / steps;
        b.y += (b.dy * b.speed * dt) / steps;
        b.life -= dt / steps;
        if (!this.collide(b.x, b.y, 0.03) || b.life <= 0) {
          removed = true;
          this.event("impact", { x: b.x, y: b.y });
          break;
        }
        for (const p of this.players.values()) {
          if (!p.alive || p.id === b.owner || this.mode === "impostor")
            continue;
          if (
            p.team !== -1 &&
            p.team === b.team &&
            !this.config.friendly &&
            !(this.mode === "double" && b.betrayal)
          )
            continue;
          if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < 0.38 ** 2) {
            removed = true;
            this.damage(p, b.damage, b.owner);
            this.event("impact", { x: b.x, y: b.y });
            break;
          }
        }
        if (!removed)
          for (const m of this.monsters) {
            if (!m.alive) continue;
            if ((m.x - b.x) ** 2 + (m.y - b.y) ** 2 < 0.4 ** 2) {
              removed = true;
              this.hitMonster(m, b.damage, b.owner);
              this.event("impact", { x: b.x, y: b.y });
              break;
            }
          }
        if (removed) break;
      }
      if (removed) this.bullets.splice(i, 1);
    }
    if (this.bomb.planted && now >= this.bomb.expiresAt) {
      this.event("bomb", {
        x: this.bomb.site.x,
        y: this.bomb.site.y,
        msg: "DATA CORE PORTLADI",
      });
      this.endRound("QIZILLAR", "DATA CORE faollashtirildi");
      return;
    }
    if (now >= this.endsAt) {
      this.expireRound();
      return;
    }
    this.checkVictory();
  }
  fire(p, now) {
    const w = WEAPONS[p.weapon],
      g = p.inventory[p.weapon];
    if (!g || p.reloadAt || now - p.lastFire < w.delay) return;
    if (g.mag <= 0) {
      this.reload(p);
      return;
    }
    g.mag--;
    p.lastFire = now;
    let angle = p.a;
    for (let k = 0; k < w.pellets; k++) {
      const a = angle + rand(-w.spread, w.spread);
      this.bullets.push({
        id: ++this.nextBullet,
        owner: p.id,
        team: p.team,
        betrayal: p.role === "double",
        x: p.x + Math.cos(a) * 0.36,
        y: p.y + Math.sin(a) * 0.36,
        dx: Math.cos(a),
        dy: Math.sin(a),
        speed: w.speed,
        damage: w.damage,
        life: w.range / w.speed,
        weapon: p.weapon,
      });
    }
    this.event("shot", { x: p.x, y: p.y, a: angle, player: p.id });
    if (this.bullets.length > 350) this.bullets.splice(0, 40);
  }
  reload(p) {
    const g = p.inventory[p.weapon],
      w = WEAPONS[p.weapon];
    if (!g || g.mag >= w.mag || g.reserve < 1 || p.reloadAt) return false;
    p.reloadAt = Date.now() + w.load;
    return true;
  }
  damage(p, damage, from) {
    if (!p.alive) return;
    const absorbed = Math.min(p.armor, damage * 0.55);
    p.armor -= absorbed;
    p.hp = Math.max(0, Math.round(p.hp - (damage - absorbed)));
    p.lastAttacker = from;
    p.lastDamageAt = Date.now();
    this.event("hit", { x: p.x, y: p.y, target: p.id, damage });
    if (p.hp <= 0) this.kill(p, from);
  }
  kill(p, attacker, reason = "shot") {
    if (!p.alive) return;
    p.alive = false;
    p.hp = 0;
    p.deaths++;
    p.lives = Math.max(0, p.lives - 1);
    p.respawnAt = p.lives > 0 ? Date.now() + 3200 : 0;
    p.input.fire = false;
    const a = this.getPlayer(attacker);
    if (a && a.id !== p.id) {
      a.kills++;
      a.score += 125;
      a.credits = clamp(a.credits + 220, 0, 9999);
    }
    if (this.mode !== "impostor") {
      this.drops.push({
        id: uid(),
        x: p.x,
        y: p.y,
        kind: "corpse",
        amount: Math.floor(p.credits * 0.42),
        from: p.id,
        weapon: p.weapon,
        ammo: p.inventory[p.weapon] ? { ...p.inventory[p.weapon] } : null,
        armor: p.armor,
        items: { ...p.items },
      });
      p.credits = Math.floor(p.credits * 0.58);
    }
    p.inventory = { pistol: { mag: 0, reserve: 0 } };
    p.weapon = "pistol";
    p.items = { scanner: 0, smoke: 0, key: 0, medkit: 0 };
    p.reloadAt = 0;
    this.event("death", {
      x: p.x,
      y: p.y,
      player: p.name,
      killer: a?.name || "LABIRINT",
      target: p.id,
      reason,
      team: p.team,
    });
    this.checkVictory();
  }
  command(id, msg) {
    const p = this.getPlayer(id);
    if (!p) return;
    const type = msg.action;
    const now = Date.now();
    if (type === "vote") {
      if (this.meeting && p.alive && !Object.hasOwn(this.meeting.votes, id)) {
        const target = msg.target;
        if (target !== "skip" && !this.players.get(target)?.alive) return;
        this.meeting.votes[id] = target;
        this.event("vote", { player: p.name });
        if (
          Object.keys(this.meeting.votes).length >=
          [...this.players.values()].filter((v) => v.alive).length
        )
          this.resolveMeeting();
      }
      return;
    }
    if (type === "chat") {
      if (this.meeting && p.alive) {
        const message = String(msg.text || "")
          .replace(/[<>\x00-\x1f]/g, "")
          .trim()
          .slice(0, 100);
        if (message && this.meeting.messages.length < 75)
          this.meeting.messages.push({
            id: uid(),
            name: p.name,
            text: message,
          });
      }
      return;
    }
    if (type === "cancelPuzzle") {
      const t = this.terminals.find(
        (t) => t.id === msg.terminal && t.reservedBy === p.id,
      );
      if (t) {
        t.reservedBy = null;
        t.reservedUntil = 0;
      }
      return;
    }
    if (!p.alive || this.phase !== "playing" || this.paused) return;
    if (type === "reload") {
      this.reload(p);
      return;
    }
    if (type === "equip") {
      const weapon = String(msg.weapon);
      if (WEAPONS[weapon] && p.inventory[weapon]) {
        p.weapon = weapon;
        p.reloadAt = 0;
      }
      return;
    }
    if (type === "buy") {
      this.buy(p, String(msg.item));
      return;
    }
    if (type === "interact") {
      this.interact(p);
      return;
    }
    if (type === "solve") {
      this.solve(p, msg);
      return;
    }
    if (type === "special") {
      this.special(p);
      return;
    }
    if (type === "meeting" && this.mode === "impostor" && p.meetingsLeft > 0) {
      this.startMeeting(p);
      return;
    }
    if (type === "useMed" && p.items.medkit > 0) {
      p.items.medkit--;
      p.hp = clamp(p.hp + 60, 0, 100);
      this.event("heal", { x: p.x, y: p.y });
      return;
    }
  }
  buy(p, id) {
    if (!this.config.practice && Date.now() > this.buyEndsAt) return;
    const item = SHOP.find((a) => a.id === id);
    if (!item || p.credits < item.cost || this.mode === "impostor") return;
    p.credits -= item.cost;
    if (item.kind === "gun") {
      const w = WEAPONS[id];
      if (p.inventory[id]) {
        p.inventory[id].reserve = clamp(
          p.inventory[id].reserve + w.mag,
          0,
          250,
        );
      } else
        p.inventory[id] = {
          mag: w.mag,
          reserve: this.config.ammo === "scarce" ? w.mag : w.reserve,
        };
      p.weapon = id;
      p.reloadAt = 0;
    } else if (id === "ammo") {
      const w = WEAPONS[p.weapon],
        g = p.inventory[p.weapon];
      g.reserve = clamp(g.reserve + w.mag * 2, 0, 250);
    } else if (id === "medkit") p.items.medkit = (p.items.medkit || 0) + 1;
    else if (id === "armor") p.armor = clamp(p.armor + 50, 0, 100);
    else if (id === "scanner") {
      p.items.scanner++;
      p.scannerEndsAt = Date.now() + 8000;
      p.items.scanner--;
    } else if (id === "smoke") {
      this.smokes.push({
        x: p.x + Math.cos(p.a) * 1.1,
        y: p.y + Math.sin(p.a) * 1.1,
        until: Date.now() + 10000,
      });
      this.event("smoke", { x: p.x, y: p.y });
    } else if (id === "energy") p.stamina = 100;
    else if (id === "key") {
      p.items.key++;
      p.pieces++;
    }
    this.event("purchase", { x: p.x, y: p.y, player: p.name, item: item.name });
  }
  interact(p) {
    if (this.mode === "team" || this.mode === "double") {
      if (
        distance(p, this.bomb.site) < 1.9 &&
        this.sight(p, this.bomb.site) &&
        Date.now() > this.buyEndsAt
      ) {
        if (p.team === 0 && !this.bomb.planted) {
          this.bomb.planted = true;
          this.bomb.expiresAt = Date.now() + 35000;
          this.event("bomb", {
            x: this.bomb.site.x,
            y: this.bomb.site.y,
            msg: "DATA CORE FAOLLASHTIRILDI",
          });
          return;
        }
        if (p.team === 1 && this.bomb.planted) {
          this.bomb.planted = false;
          this.event("bomb", {
            x: this.bomb.site.x,
            y: this.bomb.site.y,
            msg: "DATA CORE ZARARSIZLANTIRILDI",
          });
          this.endRound("KO‘KLAR", "Data core zararsizlantirildi");
          return;
        }
      }
    }
    if (this.mode === "escape" && distance(p, this.exit) < 1.7) {
      if (p.pieces >= 3)
        this.endRound(p.name, "Labirintdan muvaffaqiyatli chiqdi");
      else
        this.event("hint", {
          target: p.id,
          msg: `Chiqish uchun ${Math.max(0, 3 - p.pieces)} ta kod-parcha kerak`,
        });
      return;
    }
    const gate = this.gates.find((g) => g.locked && distance(g, p) < 1.65);
    if (gate) {
      if (p.items.key > 0) {
        p.items.key--;
        gate.locked = false;
        this.event("gate", {
          x: gate.x,
          y: gate.y,
          msg: "YASHIRIN ESHIK OCHILDI",
          player: p.name,
        });
      } else
        this.event("hint", {
          target: p.id,
          msg: "ESHIKNI OCHISH UCHUN KALIT KERAK",
        });
      return;
    }
    const loot = this.drops.find((d) => distance(d, p) < 1.25);
    if (loot && this.sight(p, loot)) {
      this.pickup(p, loot);
      return;
    }
    const task = this.terminals.find((t) => !t.solved && distance(t, p) < 1.5);
    if (task && this.sight(p, task)) {
      if (
        task.reservedBy &&
        task.reservedBy !== p.id &&
        task.reservedUntil > Date.now()
      ) {
        this.event("hint", {
          target: p.id,
          msg: "Terminal band. Biroz kuting.",
        });
        return;
      }
      task.reservedBy = p.id;
      task.reservedUntil = Date.now() + 45000;
      this.openPuzzle(p, task);
      return;
    }
    this.event("hint", {
      target: p.id,
      msg: "Yaqiningizda olinadigan resurs yo‘q",
    });
  }
  pickup(p, d) {
    if (!this.drops.includes(d)) return;
    this.drops = this.drops.filter((a) => a.id !== d.id);
    if (d.kind === "chest") {
      const reward = d.reward || "cash";
      if (reward === "cash")
        p.credits = clamp(p.credits + (d.amount || 240), 0, 9999);
      else if (reward === "ammo")
        p.inventory[p.weapon].reserve = clamp(
          p.inventory[p.weapon].reserve + WEAPONS[p.weapon].mag * 3,
          0,
          250,
        );
      else if (reward === "medkit") p.items.medkit = (p.items.medkit || 0) + 2;
      else if (reward === "armor") p.armor = clamp(p.armor + 70, 0, 100);
      else if (reward === "energy") p.stamina = 100;
      else if (reward === "scanner") p.scannerEndsAt = Date.now() + 12000;
      else if (reward === "key") p.items.key = (p.items.key || 0) + 2;
      else if (reward === "weapon") {
        const id = ["smg", "rifle", "shotgun", "sniper"][
          Math.floor(Math.random() * 4)
        ];
        p.inventory[id] = {
          mag: WEAPONS[id].mag,
          reserve: WEAPONS[id].reserve,
        };
        p.weapon = id;
      }
      this.event("chest_open", {
        target: p.id,
        x: d.x,
        y: d.y,
        msg: "SANDIQ: " + reward.toUpperCase(),
        reward,
      });
    } else if (d.kind === "corpse") {
      p.credits = clamp(p.credits + (d.amount || 0), 0, 9999);
      p.armor = clamp(p.armor + Math.round((d.armor || 0) * 0.5), 0, 100);
      if (d.weapon && d.weapon !== "pistol" && d.ammo) {
        p.inventory[d.weapon] = { mag: d.ammo.mag, reserve: d.ammo.reserve };
        p.weapon = d.weapon;
      } else if (d.ammo) {
        p.inventory[p.weapon].reserve = clamp(
          p.inventory[p.weapon].reserve + d.ammo.reserve,
          0,
          250,
        );
      }
      p.items.key = (p.items.key || 0) + Math.min(2, d.items?.key || 0);
      p.items.medkit =
        (p.items.medkit || 0) + Math.min(2, d.items?.medkit || 0);
    } else if (d.kind === "cash")
      p.credits = clamp(p.credits + d.amount, 0, 9999);
    else if (d.kind === "ammo")
      p.inventory[p.weapon].reserve = clamp(
        p.inventory[p.weapon].reserve + WEAPONS[p.weapon].mag * 2,
        0,
        250,
      );
    else if (d.kind === "medkit") p.items.medkit = (p.items.medkit || 0) + 1;
    else if (d.kind === "armor") p.armor = clamp(p.armor + 40, 0, 100);
    else if (d.kind === "energy") p.stamina = 100;
    else if (d.kind === "scanner") p.scannerEndsAt = Date.now() + 7000;
    else if (d.kind === "weapon") {
      const w = ["smg", "rifle", "shotgun"][Math.floor(rand(0, 3))];
      p.inventory[w] = { mag: WEAPONS[w].mag, reserve: WEAPONS[w].mag };
      p.weapon = w;
    }
    this.event("pickup", {
      x: d.x,
      y: d.y,
      player: p.name,
      kind: d.kind,
      target: p.id,
    });
  }
  solve(p, msg) {
    const t = this.terminals.find((q) => q.id === msg.terminal);
    if (
      !t ||
      t.solved ||
      distance(t, p) > 1.7 ||
      !this.config.puzzles ||
      !Number.isInteger(msg.answer) ||
      msg.answer < 0 ||
      msg.answer > 3 ||
      t.reservedBy !== p.id ||
      t.reservedUntil < Date.now() ||
      msg.quiz !== t.quiz ||
      !this.sight(p, t)
    )
      return;
    const q = QUIZZES[t.quiz];
    if (!q) return;
    if (msg.answer === q.correct) {
      t.solved = true;
      t.by = p.name;
      p.pieces++;
      p.taskCount++;
      p.score += 160;
      const reward = this.rollChest();
      this.drops.push({
        id: uid(),
        x: t.x,
        y: t.y,
        kind: "chest",
        reward,
        amount: 200 + Math.floor(rand(0, 5)) * 60,
      });
      this.event("solved", {
        x: t.x,
        y: t.y,
        player: p.name,
        target: p.id,
        reward: "SANDIQ OCHILDI",
      });
      this.checkVictory();
    } else {
      t.quiz = this.nextQuiz();
      t.reservedUntil = Date.now() + 45000;
      this.event("hint", {
        target: p.id,
        msg: "NOTO‘G‘RI · BOSHQA SAVOL BERILDI",
      });
      this.openPuzzle(p, t);
    }
  }
  special(p) {
    const now = Date.now();
    if (now - p.lastSpecial < 14000) return;
    if (this.mode === "impostor" && p.role === "traitor") {
      const victims = [...this.players.values()].filter(
        (e) =>
          e.alive &&
          e.id !== p.id &&
          e.role !== "traitor" &&
          distance(e, p) < 1.55 &&
          lineClear(this.map, p.x, p.y, e.x, e.y),
      );
      victims.sort((a, b) => distance(a, p) - distance(b, p));
      if (victims[0]) {
        p.lastSpecial = now;
        this.kill(victims[0], p.id, "silent");
      } else {
        p.lastSpecial = now;
        this.sabotageEndsAt = now + 11000;
        this.event("sabotage", { x: p.x, y: p.y, msg: "ELEKTR O‘CHDI" });
      }
      return;
    }
    if (this.mode === "double" && p.role === "double") {
      p.lastSpecial = now;
      this.sabotageEndsAt = now + 12000;
      this.sabotageTeam = p.team;
      p.credits = clamp(p.credits + 150, 0, 9999);
      this.event("sabotage", { x: p.x, y: p.y, msg: "COMMS JAMMED" });
      return;
    }
    if (p.items.key > 0) {
      p.items.key--;
      p.armor = clamp(p.armor + 15, 0, 100);
      this.event("shield", { x: p.x, y: p.y });
    }
  }
  startMeeting(p) {
    if (this.meeting || p.meetingsLeft < 1) return;
    p.meetingsLeft--;
    this.phase = "meeting";
    this.meeting = {
      calledBy: p.name,
      startedAt: Date.now(),
      endsAt: Date.now() + 32000,
      votes: {},
      messages: [
        {
          id: uid(),
          name: "SYSTEM",
          text: p.name + " yig‘ilish chaqirdi. Kimdan shubhalanasiz?",
        },
      ],
    };
    this.event("meeting", { msg: p.name + " emergency meeting chaqirdi" });
  }
  resolveMeeting() {
    if (!this.meeting) return;
    const votes = Object.values(this.meeting.votes).filter((v) => v !== "skip");
    const count = {};
    for (const v of votes) count[v] = (count[v] || 0) + 1;
    const ranks = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const tied = ranks.length > 1 && ranks[0][1] === ranks[1][1];
    const target = !tied ? ranks[0]?.[0] : null;
    const p = target ? this.getPlayer(target) : null;
    if (
      p &&
      ranks[0][1] >=
        Math.ceil([...this.players.values()].filter((v) => v.alive).length / 2)
    ) {
      p.lives = 1;
      this.kill(p, null, "voted");
      this.event("meeting_result", { msg: p.name + " chiqarildi" });
    } else this.event("meeting_result", { msg: "Hech kim chiqarilmadi" });
    this.endsAt += Date.now() - this.meeting.startedAt;
    this.meeting = null;
    this.phase = "playing";
    this.checkVictory();
  }
  checkVictory() {
    if (this.phase !== "playing") return;
    const list = [...this.players.values()];
    if (!list.length) return;
    if (this.mode === "impostor") {
      const alive = list.filter((p) => p.alive || p.lives > 0),
        traitors = alive.filter((p) => p.role === "traitor").length,
        crew = alive.length - traitors;
      if (traitors === 0) {
        this.endRound("AGENTLAR", "Barcha xoinlar aniqlandi");
        return;
      }
      if (traitors >= crew) {
        this.endRound("XOINLAR", "Xoinlar ustunlikka erishdi");
        return;
      }
      if (this.config.puzzles && this.terminals.every((t) => t.solved)) {
        this.endRound("AGENTLAR", "Barcha vazifalar yakunlandi");
        return;
      }
      return;
    }
    if (this.mode === "escape") return;
    if (this.mode === "ffa") {
      const possible = list.filter((p) => p.alive || p.lives > 0);
      if (possible.length === 1 && list.length > 1)
        this.endRound(possible[0].name, "Yagona omon qolgan o‘yinchi");
      return;
    }
    const a = [0, 1].map(
      (team) =>
        list.filter((p) => p.team === team && (p.alive || p.lives > 0)).length,
    );
    if (a[0] === 0 && a[1] === 0) {
      this.endRound("DURANG", "Hech kim omon qolmadi");
      return;
    }
    if (a[0] === 0 && a[1] > 0)
      this.endRound("KO‘KLAR", "Barcha qizil o‘yinchilar mag‘lub bo‘ldi");
    else if (a[1] === 0 && a[0] > 0)
      this.endRound("QIZILLAR", "Barcha ko‘k o‘yinchilar mag‘lub bo‘ldi");
  }
  expireRound() {
    const list = [...this.players.values()];
    if (this.mode === "impostor") {
      this.endRound("XOINLAR", "Vaqt tugadi");
      return;
    }
    if (this.mode === "escape") {
      const sorted = list.sort(
        (a, b) => b.pieces - a.pieces || b.score - a.score,
      );
      this.endRound(
        sorted[0]?.name || "HECH KIM",
        "Vaqt tugadi, eng ko‘p kod topgan g‘olib",
      );
      return;
    }
    if (this.mode === "ffa") {
      list.sort(
        (a, b) => b.kills - a.kills || b.lives - a.lives || b.score - a.score,
      );
      const a = list[0],
        b = list[1];
      this.endRound(
        a &&
          b &&
          a.kills === b.kills &&
          a.lives === b.lives &&
          a.score === b.score
          ? "DURANG"
          : a?.name || "HECH KIM",
        "Vaqt tugadi",
      );
      return;
    }
    if (this.bomb.planted) {
      this.endsAt = Date.now() + 1000;
      return;
    }
    const tally = [0, 1].map((team) =>
      list
        .filter((p) => p.team === team)
        .reduce((n, p) => n + p.kills * 3 + p.lives, 0),
    );
    this.endRound(
      tally[0] > tally[1]
        ? "QIZILLAR"
        : tally[1] > tally[0]
          ? "KO‘KLAR"
          : "DURANG",
      "Vaqt tugadi · jamoaviy ochkolar hisoblandi",
    );
  }
  endRound(winner, reason) {
    if (this.phase === "round_end" || this.phase === "match_end") return;
    this.phase = "round_end";
    this.roundWinner = winner;
    this.roundReason = reason;
    this.roundEndAt = Date.now();
    if (winner === "QIZILLAR") this.matchWins[0]++;
    if (winner === "KO‘KLAR") this.matchWins[1]++;
    this.event("round_end", { winner, reason });
  }
  snapshotFor(id) {
    const now = Date.now(),
      self = this.getPlayer(id);
    if (!self) return null;
    const all = [...this.players.values()];
    // Dead players spectate an alive teammate. Social modes retain their own location.
    const eyes =
      !self.alive && ["team", "double"].includes(this.mode)
        ? all.find((p) => p.alive && p.team === self.team) || self
        : self;
    const radius =
      this.sabotageEndsAt > now &&
      (this.sabotageTeam === -1 || self.team === this.sabotageTeam)
        ? 3
        : 10;
    const visible = (v) => {
      const d = distance(eyes, v);
      if (d > radius || !this.sight(eyes, v)) return false;
      const forward =
        d < 7.4 &&
        Math.cos(Math.atan2(v.y - eyes.y, v.x - eyes.x) - eyes.a) > 0.63;
      const lit = this.lamps.some(
        (l) => distance(l, v) < l.r && this.sight(l, v),
      );
      return (
        d < 1.7 || forward || lit || (self.scannerEndsAt > now && d < radius)
      );
    };
    const publicPlayer = (p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      a: p.a,
      team: p.team,
      color: p.color,
      hp: p.hp,
      alive: p.alive,
      weapon: p.weapon,
      lives: p.lives,
      moving: Math.hypot(p.input.dx, p.input.dy) > 0.01,
      run: p.input.run,
      seq: p.seq || 0,
      reloadAt: p.reloadAt,
      lastFire: p.lastFire,
    });
    const pview = all
      .filter((p) => p.id === id || visible(p))
      .map(publicPlayer);
    const events = this.events
      .filter(
        (e) =>
          e.time > now - 1500 &&
          (e.target ? e.target === id : "x" in e ? visible(e) : true),
      )
      .map((e) => ({ ...e }));
    const me = {
      ...publicPlayer(self),
      armor: self.armor,
      credits: self.credits,
      inventory: structuredClone(self.inventory),
      stamina: self.stamina,
      items: { ...self.items },
      pieces: self.pieces,
      taskCount: self.taskCount,
      role: self.role,
      scannerEndsAt: self.scannerEndsAt,
    };
    return {
      t: "snapshot",
      now,
      mode: this.mode,
      phase: this.phase,
      round: this.round,
      rounds: this.config.rounds,
      endsAt: this.endsAt,
      buyEndsAt: this.buyEndsAt,
      remaining: Math.max(
        0,
        (this.endsAt -
          (this.paused ? this.pauseStarted : this.meeting?.startedAt || now)) /
          1000,
      ),
      paused: this.paused,
      players: pview,
      me,
      eye: eyes.id === self.id ? null : publicPlayer(eyes),
      roster: all.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        alive: p.alive,
        kills: p.kills,
        deaths: p.deaths,
        score: p.score,
        taskCount: p.taskCount,
      })),
      bullets: this.bullets
        .filter(visible)
        .map((b) => ({ x: b.x, y: b.y, dx: b.dx, dy: b.dy, weapon: b.weapon })),
      monsters: this.monsters
        .filter((m) => m.alive && visible(m))
        .map((m) => ({
          id: m.id,
          x: m.x,
          y: m.y,
          a: m.a,
          hp: m.hp,
          maxHp: m.maxHp,
          kind: m.kind,
          state: m.state,
        })),
      drops: this.drops
        .filter(visible)
        .map((d) => ({ id: d.id, x: d.x, y: d.y, kind: d.kind })),
      terminals: this.terminals
        .filter(visible)
        .map((t) => ({ id: t.id, x: t.x, y: t.y, solved: t.solved })),
      gates: this.gates.map((g) => ({ ...g })),
      lamps: this.lamps,
      props: this.props,
      smokes: this.smokes.filter(visible),
      exit: this.exit,
      bomb: { ...this.bomb },
      events,
      sabotageEndsAt: this.sabotageEndsAt,
      taskTotal: this.terminals.length,
      taskSolved: this.terminals.filter((t) => t.solved).length,
      matchWins: this.matchWins,
      roundWinner: this.roundWinner,
      roundReason: this.roundReason,
      meeting: this.meeting
        ? {
            endsAt: this.meeting.endsAt,
            voted: Object.keys(this.meeting.votes),
            messages: this.meeting.messages,
            calledBy: this.meeting.calledBy,
          }
        : null,
    };
  }
  sight(a, b) {
    if (!lineClear(this.map, a.x, a.y, b.x, b.y)) return false;
    const n = Math.ceil(distance(a, b) * 8);
    for (let i = 1; i < n; i++) {
      const x = a.x + ((b.x - a.x) * i) / n,
        y = a.y + ((b.y - a.y) * i) / n;
      if (
        this.gates.some(
          (g) =>
            g.locked && Math.abs(g.x - x) < 0.42 && Math.abs(g.y - y) < 0.42,
        )
      )
        return false;
    }
    return true;
  }
  openPuzzle(p, t) {
    const q = QUIZZES[t.quiz];
    this.event("puzzle_open", {
      target: p.id,
      terminal: t.id,
      quiz: t.quiz,
      question: { q: q.q, a: q.a },
    });
  }
  decorate() {
    const types = [
      "crate",
      "barrel",
      "sandbags",
      "generator",
      "server",
      "classroom",
      "medical",
      "armory",
      "storage",
      "workbench",
      "camera",
      "power",
    ];
    for (const c of this.cells) {
      const h = hash(c.x * 2, c.y * 2, this.seed);
      if (
        h % 17 !== 0 ||
        this.terminals.some((t) => distance(c, t) < 1.5) ||
        this.gates.some((t) => distance(c, t) < 1.5) ||
        [...this.players.values()].some((p) => distance(c, p) < 1.4) ||
        this.monsters.some((m) => distance(c, m) < 1)
      )
        continue;
      const wallNear =
        isWall(this.map, c.x + 1, c.y) || isWall(this.map, c.x, c.y + 1);
      if (wallNear)
        this.props.push({
          ...c,
          type: types[h % types.length],
          id: "prop-" + h,
          solid: types[h % types.length] !== "camera",
          radius: 0.25,
        });
    }
  }
}
module.exports = {
  World,
  WEAPONS,
  SHOP,
  MODES,
  QUIZZES,
  generateMaze,
  lineClear,
  validMove,
  distance,
  clamp,
};
