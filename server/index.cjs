"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes, randomUUID } = require("node:crypto");
const { performance } = require("node:perf_hooks");
const { WebSocketServer, WebSocket } = require("ws");
const { World, MODES } = require("./simulation.cjs");
const ROOT = path.resolve(__dirname, "..");
const rooms = new Map(),
  metrics = { ticks: 0, maxTickMs: 0, totalTickMs: 0, connections: 0 };
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpeg": "image/jpeg",
};
function config(raw = {}) {
  const integer = (v, d, min, max) =>
    Number.isFinite(+v) ? Math.max(min, Math.min(max, Math.floor(+v))) : d;
  return {
    mode: Object.hasOwn(MODES, raw.mode) ? raw.mode : "team",
    duration: integer(raw.duration, 480, 60, 1800),
    rounds: integer(raw.rounds, 3, 1, 7),
    lives: integer(raw.lives, 3, 1, 5),
    mapSize: ["small", "medium", "large"].includes(raw.mapSize)
      ? raw.mapSize
      : "small",
    monsters: ["none", "few", "normal", "horde"].includes(raw.monsters)
      ? raw.monsters
      : "few",
    ammo: raw.ammo === "scarce" ? "scarce" : "limited",
    puzzles: raw.puzzles !== false,
    friendly: raw.friendly === true,
    radar: false,
    practice: raw.practice === true,
  };
}
function send(ws, data) {
  if (ws?.readyState === WebSocket.OPEN && ws.bufferedAmount < 512 * 1024)
    ws.send(JSON.stringify(data));
}
function fail(ws, message) {
  send(ws, { t: "error", message });
}
function lobby(r) {
  const data = {
    t: "lobby",
    room: r.code,
    host: r.host,
    config: r.config,
    players: [...r.people.values()].map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      connected: !!p.ws,
      ready: p.ready,
    })),
  };
  for (const p of r.people.values()) send(p.ws, data);
}
function mapFor(r, p) {
  send(p.ws, { t: "map", map: r.world.map, config: r.config, room: r.code });
}
function start(r) {
  const people = [...r.people.values()].filter((p) => p.ws);
  const min =
    r.config.mode === "escape"
      ? 1
      : ["impostor", "double"].includes(r.config.mode)
        ? 4
        : 2;
  if (people.length < min)
    return "Bu rejim uchun kamida " + min + " o‘yinchi kerak.";
  r.world = new World(
    r.config,
    people.map((p) => ({ ...p, participates: true })),
    [0, 0],
  );
  r.world.quizSeen = r.quizSeen;
  r.world.quizDeck = [];
  // A deterministic, reachable introductory encounter in solo practice.
  if (r.config.practice) {
    const w = r.world,
      p = w.players.values().next().value;
    Object.assign(p, w.near({ x: 6.5, y: 6.5 }), {
      credits: 1800,
      weapon: "rifle",
      inventory: {
        pistol: { mag: 12, reserve: 36 },
        rifle: { mag: 30, reserve: 90 },
      },
    });
    w.gates = [];
    w.terminals = [
      {
        id: "training-terminal",
        ...w.near({ x: p.x + 1, y: p.y + 1 }),
        quiz: w.nextQuiz(),
        solved: false,
      },
      ...w.terminals.slice(0, 4),
    ];
    w.drops.unshift({
      id: randomUUID(),
      ...w.near({ x: p.x - 1, y: p.y + 1 }),
      kind: "chest",
      reward: "ammo",
    });
    w.lamps.push({ x: p.x, y: p.y, r: 5, color: "amber" });
    if (w.monsters.length)
      Object.assign(w.monsters[0], w.near({ x: p.x + 4, y: p.y }));
  }
  r.lastActive = Date.now();
  for (const p of r.people.values()) mapFor(r, p);
  return null;
}
function next(r) {
  const w = r.world;
  if (!w) return;
  if (w.round >= r.config.rounds) {
    w.phase = "match_end";
    return;
  }
  const raw = [...r.people.values()].map((p) => ({
    ...p,
    participates: true,
    stats: w.players.get(p.id),
  }));
  const next = new World(r.config, raw, w.matchWins, w.round + 1);
  next.quizSeen = r.quizSeen;
  r.world = next;
  for (const p of r.people.values()) mapFor(r, p);
}
function identity(ws, r, p) {
  ws.room = r.code;
  ws.pid = p.id;
  p.ws = ws;
  p.offlineAt = 0;
  send(ws, {
    t: "welcome",
    room: r.code,
    id: p.id,
    token: p.token,
    host: r.host,
  });
  lobby(r);
  if (r.world) {
    mapFor(r, p);
    send(ws, r.world.snapshotFor(p.id));
  }
}
function handle(ws, m) {
  if (!m || typeof m !== "object" || typeof m.t !== "string") return;
  if (m.t === "ping") {
    send(ws, { t: "pong", at: m.at, now: Date.now() });
    return;
  }
  if (m.t === "create" || m.t === "join") {
    if (ws.pid) return fail(ws, "Avval joriy xonadan chiqing.");
    let r;
    if (m.t === "create") {
      if (rooms.size >= 64) return fail(ws, "Server band.");
      const code = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
      r = {
        code,
        host: null,
        config: config(m.config),
        people: new Map(),
        world: null,
        quizSeen: new Set(),
        lastActive: Date.now(),
      };
      rooms.set(code, r);
    } else r = rooms.get(String(m.room || "").toUpperCase());
    if (!r)
      return fail(ws, "Xona topilmadi. Kod va server manzilini tekshiring.");
    let p = [...r.people.values()].find(
      (p) => typeof m.token === "string" && p.token === m.token,
    );
    if (p) {
      if (p.ws && p.ws !== ws) p.ws.close(4001, "Reconnected elsewhere");
      const actor = r.world?.getPlayer(p.id);
      if (actor) actor.active = true;
      return identity(ws, r, p);
    }
    if (r.world)
      return fail(
        ws,
        "Match boshlangan. Yangi o‘yinchi keyingi lobbyda qo‘shiladi.",
      );
    if (r.people.size >= 30) return fail(ws, "Xona to‘ldi (30).");
    const base =
      String(m.name || "O‘YINCHI")
        .replace(/[<>\x00-\x1f]/g, "")
        .trim()
        .slice(0, 18) || "O‘YINCHI";
    let name = base,
      n = 2;
    while ([...r.people.values()].some((p) => p.name === name))
      name = base.slice(0, 14) + " #" + n++;
    p = {
      id: randomUUID(),
      token: randomBytes(24).toString("hex"),
      name,
      team: r.people.size % 2,
      joined: Date.now(),
      ready: false,
      ws,
    };
    r.people.set(p.id, p);
    if (!r.host) r.host = p.id;
    identity(ws, r, p);
    return;
  }
  const r = rooms.get(ws.room),
    p = r?.people.get(ws.pid);
  if (!r || !p || p.ws !== ws) return;
  r.lastActive = Date.now();
  if (m.t === "input") {
    if (
      r.world &&
      m.input &&
      typeof m.input === "object" &&
      Number.isSafeInteger(m.input.seq) &&
      m.input.seq > (p.lastSeq || 0)
    ) {
      p.lastSeq = m.input.seq;
      r.world.setInput(p.id, m.input);
    }
    return;
  }
  if (m.t === "ready") {
    p.ready = !p.ready;
    lobby(r);
    return;
  }
  if (m.t === "command") {
    if (r.world && typeof m.action === "string") r.world.command(p.id, m);
    return;
  }
  if (p.id !== r.host) return;
  if (m.t === "start" && !r.world) {
    const e = start(r);
    if (e) fail(ws, e);
    return;
  }
  if (m.t === "rematch") {
    r.world = null;
    for (const actor of r.people.values()) actor.lastSeq = 0;
    lobby(r);
    return;
  }
  if (m.t === "kick" && m.id !== p.id) {
    const target = r.people.get(m.id);
    if (target) {
      target.ws?.close(4003, "Host removed");
      r.people.delete(m.id);
      const actor = r.world?.getPlayer(m.id);
      if (actor) {
        actor.active = false;
        actor.lives = 1;
        r.world.kill(actor, null, "kicked");
      }
      lobby(r);
    }
    return;
  }
  if (m.t === "pause" && r.world) {
    const w = r.world;
    if (w.paused) {
      const delta = Date.now() - w.pauseStarted;
      w.endsAt += delta;
      w.buyEndsAt += delta;
      if (w.bomb.planted) w.bomb.expiresAt += delta;
      for (const a of w.players.values()) {
        if (a.reloadAt) a.reloadAt += delta;
        if (a.respawnAt) a.respawnAt += delta;
      }
      w.paused = false;
    } else {
      w.paused = true;
      w.pauseStarted = Date.now();
    }
    return;
  }
  if (m.t === "end" && r.world)
    r.world.endRound("HOST YAKUNLADI", "Raund yakunlandi");
}
function createServer() {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          ok: true,
          rooms: rooms.size,
          tickRate: 30,
          ...metrics,
        }),
      );
    }
    let file = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
    // Explicit public allowlist: no server, quiz answers, source documents, or credentials.
    if (
      !["/index.html", "/styles.css", "/client/", "/shared/", "/public/"].some(
        (prefix) =>
          prefix.endsWith("/") ? file.startsWith(prefix) : file === prefix,
      )
    ) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const full = path.resolve(ROOT, "." + file);
    if (!full.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    fs.stat(full, (e, stat) => {
      if (e || !stat.isFile()) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(full)] || "application/octet-stream",
        "Cache-Control": file.includes("/assets/")
          ? "public, max-age=3600"
          : "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin",
        "Content-Security-Policy":
          "default-src 'self'; connect-src 'self' ws: wss:; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'",
      });
      fs.createReadStream(full).pipe(res);
    });
  });
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 4096,
    perMessageDeflate: false,
  });
  wss.on("connection", (ws, req) => {
    metrics.connections++;
    ws.alive = true;
    ws.rateAt = Date.now();
    ws.rate = 0;
    ws.on("pong", () => (ws.alive = true));
    const origin = req.headers.origin;
    if (
      origin &&
      process.env.ALLOWED_ORIGIN &&
      origin !== process.env.ALLOWED_ORIGIN
    ) {
      ws.close(4003, "Origin not allowed");
      return;
    }
    ws.on("message", (bytes) => {
      if (Date.now() - ws.rateAt > 1000) {
        ws.rate = 0;
        ws.rateAt = Date.now();
      }
      if (++ws.rate > 90) {
        ws.close(4008, "Rate limit");
        return;
      }
      try {
        handle(ws, JSON.parse(bytes));
      } catch {
        fail(ws, "Noto‘g‘ri xabar.");
      }
    });
    ws.on("close", () => {
      const r = rooms.get(ws.room),
        p = r?.people.get(ws.pid);
      if (!p || p.ws !== ws) return;
      p.ws = null;
      p.offlineAt = Date.now();
      const a = r.world?.getPlayer(p.id);
      if (a) {
        a.active = false;
        a.input = { dx: 0, dy: 0, aim: a.a, fire: false, run: false };
      }
      if (r.host === p.id) {
        const candidate = [...r.people.values()].find((x) => x.ws);
        if (candidate) r.host = candidate.id;
      }
      lobby(r);
    });
  });
  let step = 0;
  const timer = setInterval(() => {
    const begin = performance.now();
    step++;
    for (const [code, r] of rooms) {
      const online = [...r.people.values()].some((p) => p.ws);
      if (!online && Date.now() - r.lastActive > 120000) {
        rooms.delete(code);
        continue;
      }
      if (!online) continue;
      if (r.world) {
        r.world.step(1 / 30);
        if (
          r.world.phase === "round_end" &&
          Date.now() - r.world.roundEndAt > 7000
        )
          next(r);
        if (step % 2 === 0)
          for (const p of r.people.values()) {
            const snap = r.world.snapshotFor(p.id);
            if (snap) send(p.ws, snap);
          }
      }
    }
    const ms = performance.now() - begin;
    metrics.ticks++;
    metrics.totalTickMs += ms;
    metrics.maxTickMs = Math.max(metrics.maxTickMs, ms);
  }, 1000 / 30);
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) {
        ws.terminate();
        continue;
      }
      ws.alive = false;
      ws.ping();
    }
  }, 15000);
  server.on("close", () => {
    clearInterval(timer);
    clearInterval(heartbeat);
    for (const ws of wss.clients) ws.terminate();
    wss.close();
  });
  return server;
}
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, "0.0.0.0", () =>
    console.log("MAZE CLASH server on http://localhost:" + port),
  );
}
module.exports = { createServer, rooms, config, handle, metrics };
