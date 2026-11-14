const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  World,
  WEAPONS,
  QUIZZES,
  generateMaze,
  validMove,
} = require("../server/simulation.cjs");
const cfg = (mode = "escape") => ({
  mode,
  duration: 300,
  rounds: 3,
  lives: 1,
  mapSize: "small",
  monsters: "none",
  ammo: "limited",
  puzzles: true,
  practice: true,
});
const people = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: "p" + i,
    name: "Player " + i,
    joined: i,
    participates: true,
  }));
const world = (mode = "escape", n = 2) =>
  new World(cfg(mode), people(n), [0, 0], 1, 123);
const arena = (w) => {
  w.map = Array.from({ length: 15 }, (_, y) =>
    Array.from({ length: 15 }, (_, x) =>
      x === 0 || y === 0 || x === 14 || y === 14 ? 1 : 0,
    ),
  );
  w.size = 15;
  w.gates = [];
  w.drops = [];
  w.lamps = [];
  w.monsters = [];
  w.terminals = [];
  w.props = [];
  w.buyEndsAt = 0;
  const ps = [...w.players.values()];
  ps.forEach((p, i) => Object.assign(p, { x: 4 + i * 2, y: 4, a: 0 }));
  return ps;
};
test("1000 valid unique questions and correct arithmetic", () => {
  assert.equal(QUIZZES.length, 1000);
  assert.equal(new Set(QUIZZES.map((q) => q.q)).size, 1000);
  for (const q of QUIZZES) {
    assert.equal(q.a.length, 4);
    assert.equal(new Set(q.a).size, 4);
    assert.ok(q.correct >= 0 && q.correct < 4);
    const m = q.q.match(/x=(-?\d+).*change x by (\d+)/);
    if (m) assert.equal(+q.a[q.correct], +m[1] + +m[2]);
  }
});
test("all generated maps connected and deterministic across 100 seeds", () => {
  for (const n of [29, 39, 51])
    for (let seed = 1; seed <= 100; seed++) {
      const map = generateMaze(n, seed);
      assert.deepEqual(map, generateMaze(n, seed));
      const open = [];
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) if (map[y][x] === 0) open.push(y * n + x);
      const seen = new Set([open[0]]),
        q = [open[0]];
      for (let i = 0; i < q.length; i++) {
        const p = q[i];
        for (const v of [p - 1, p + 1, p - n, p + n])
          if (
            v >= 0 &&
            v < n * n &&
            map[Math.floor(v / n)][v % n] === 0 &&
            !seen.has(v)
          ) {
            seen.add(v);
            q.push(v);
          }
      }
      assert.equal(seen.size, open.length);
    }
});
test("server clamps movement and bullets cannot pass a closed gate", () => {
  const w = world(),
    [p] = arena(w);
  p.inventory.rifle = { mag: 30, reserve: 90 };
  p.weapon = "rifle";
  w.setInput(p.id, { dx: Infinity, dy: NaN, aim: NaN, seq: 1 });
  assert.equal(p.input.dx, 1);
  assert.equal(p.input.dy, 0);
  w.gates = [{ id: "g", x: 5.5, y: 4, locked: true }];
  w.fire(p, Date.now());
  for (let i = 0; i < 10; i++) w.step(1 / 30);
  assert.equal(w.bullets.length, 0);
  assert.equal(p.inventory.rifle.mag, 29);
  assert.ok(validMove(w.map, p.x, p.y));
});
test("magazine, reload and buy economy are authoritative", () => {
  const w = world(),
    [p] = arena(w);
  p.inventory.pistol = { mag: 0, reserve: 5 };
  assert.equal(w.reload(p), true);
  p.reloadAt = Date.now() - 1;
  w.step(1 / 30);
  assert.equal(p.inventory.pistol.mag, 5);
  assert.equal(p.inventory.pistol.reserve, 0);
  p.credits = 50;
  w.buy(p, "rifle");
  assert.equal(p.credits, 50);
  assert.equal(p.inventory.rifle, undefined);
  p.credits = 1000;
  w.buy(p, "rifle");
  assert.equal(p.credits, 150);
  assert.equal(p.inventory.rifle.mag, 30);
});
test("corpse and chest cannot be looted twice", () => {
  const w = world(),
    [p, enemy] = arena(w);
  enemy.credits = 500;
  w.kill(enemy, p.id);
  const d = w.drops.find((x) => x.kind === "corpse");
  const before = p.credits;
  w.pickup(p, d);
  const after = p.credits;
  assert.ok(after > before);
  w.pickup(p, d);
  assert.equal(p.credits, after);
});
test("quiz reservations, stale-answer rejection, fresh question on wrong, one chest on success", () => {
  const w = world(),
    [p, p2] = arena(w);
  p2.x = p.x;
  p2.y = p.y;
  const t = {
    id: "t",
    x: p.x + 0.5,
    y: p.y,
    solved: false,
    quiz: w.nextQuiz(),
  };
  w.terminals = [t];
  w.interact(p);
  w.interact(p2);
  assert.equal(t.reservedBy, p.id);
  const a = QUIZZES[t.quiz].correct,
    original = t.quiz;
  w.solve(p, { terminal: t.id, quiz: t.quiz, answer: (a + 1) % 4 });
  assert.notEqual(t.quiz, original);
  assert.equal(p.credits, 700);
  w.solve(p, { terminal: t.id, quiz: original, answer: a });
  assert.equal(t.solved, false);
  w.solve(p2, {
    terminal: t.id,
    quiz: t.quiz,
    answer: QUIZZES[t.quiz].correct,
  });
  assert.equal(t.solved, false);
  w.solve(p, { terminal: t.id, quiz: t.quiz, answer: QUIZZES[t.quiz].correct });
  assert.equal(t.solved, true);
  assert.equal(w.drops.filter((d) => d.kind === "chest").length, 1);
  w.solve(p, { terminal: t.id, quiz: t.quiz, answer: QUIZZES[t.quiz].correct });
  assert.equal(w.drops.filter((d) => d.kind === "chest").length, 1);
});
test("snapshot hides enemy coordinates, roles, targeted puzzle events and answers behind walls", () => {
  const w = world("double", 4),
    [p, e] = arena(w);
  e.x = 8;
  e.y = 4;
  p.a = 0;
  w.map[4][6] = 1;
  e.role = "double";
  w.event("shot", { x: e.x, y: e.y, player: e.id });
  w.event("puzzle_open", {
    x: p.x,
    y: p.y,
    target: e.id,
    question: { q: "secret", a: ["1"] },
    quiz: 42,
  });
  const snap = w.snapshotFor(p.id);
  assert.equal(
    snap.players.some((a) => a.id === e.id),
    false,
  );
  assert.equal(snap.events.length, 0);
  assert.ok(snap.roster.every((a) => !("x" in a) && !("role" in a)));
  assert.equal(JSON.stringify(snap).includes("correct"), false);
  w.map[4][6] = 0;
  assert.equal(
    w.snapshotFor(p.id).players.find((a) => a.id === e.id)?.role,
    undefined,
  );
});
test("dead spectator only gets teammate LOS, never unrestricted map", () => {
  const w = world("team", 4),
    ps = arena(w);
  ps[0].alive = false;
  ps[0].lives = 0;
  ps[2].x = 4;
  ps[1].x = 12;
  ps[1].y = 12;
  w.map[8][8] = 1;
  const s = w.snapshotFor(ps[0].id);
  assert.equal(s.eye.id, ps[2].id);
  assert.equal(
    s.players.some((p) => p.id === ps[1].id),
    false,
  );
});
test("balanced 20 and 21 participants; own hidden role only", () => {
  for (const count of [20, 21]) {
    const w = world("team", count),
      teams = [...w.players.values()].map((x) => x.team);
    assert.equal(
      Math.abs(
        teams.filter((x) => x === 0).length -
          teams.filter((x) => x === 1).length,
      ),
      count % 2,
    );
  }
  const w = world("impostor", 6);
  assert.equal(
    [...w.players.values()].filter((p) => p.role === "traitor").length,
    1,
  );
  const s = w.snapshotFor("p0");
  assert.ok(s.players.every((p) => !("role" in p)));
  assert.ok(s.me.role);
});
test("five mode victory transitions, timed draw and one vote per player", () => {
  for (const mode of ["team", "double"]) {
    const w = world(mode, 4);
    [...w.players.values()]
      .filter((p) => p.team === 1)
      .forEach((p) => {
        p.alive = false;
        p.lives = 0;
      });
    w.checkVictory();
    assert.equal(w.roundWinner, "QIZILLAR");
  }
  const f = world("ffa");
  f.kill(f.getPlayer("p1"), "p0");
  assert.equal(f.phase, "round_end");
  const e = world("escape");
  e.gates = [];
  e.drops = [];
  const p = e.getPlayer("p0");
  Object.assign(p, e.exit, { pieces: 3 });
  e.interact(p);
  assert.equal(e.phase, "round_end");
  const s = world("impostor", 4);
  const traitor = [...s.players.values()].find((p) => p.role === "traitor");
  traitor.alive = false;
  traitor.lives = 0;
  s.checkVictory();
  assert.equal(s.roundWinner, "AGENTLAR");
  const t = world("team");
  t.expireRound();
  assert.equal(t.roundWinner, "DURANG");
});
test("15 monsters include six types and respect collisions", () => {
  const w = new World({ ...cfg(), monsters: "horde" }, people(1), [0, 0], 1, 8);
  assert.equal(w.monsters.length, 15);
  assert.equal(new Set(w.monsters.map((m) => m.kind)).size, 6);
  for (let i = 0; i < 300; i++) w.step(1 / 30);
  for (const m of w.monsters) assert.ok(validMove(w.map, m.x, m.y, 0.18));
});

test("training first E always opens its terminal despite random loot placement", () => {
  for (let seed = 1; seed <= 80; seed++) {
    const w = new World(
      { ...cfg(), monsters: "few" },
      people(1),
      [0, 0],
      1,
      seed,
    );
    w.preparePractice("p0");
    const p = w.getPlayer("p0");
    w.interact(p);
    assert.equal(w.events.at(-1).kind, "puzzle_open");
    assert.equal(w.events.at(-1).terminal, "training-terminal");
    assert.equal(
      w.drops.some((d) => Math.hypot(d.x - p.x, d.y - p.y) < 1.25),
      false,
    );
  }
});
