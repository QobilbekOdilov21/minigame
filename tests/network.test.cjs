const { test } = require("node:test");
const assert = require("node:assert/strict");
const { WebSocket } = require("ws");
const { createServer, rooms } = require("../server/index.cjs");
function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url),
      messages = [];
    ws.on("error", reject);
    ws.on("message", (buf) => messages.push(JSON.parse(buf)));
    ws.on("open", () =>
      resolve({
        ws,
        messages,
        send: (data) => ws.send(JSON.stringify(data)),
        wait: async (type, predicate = () => true) => {
          const end = Date.now() + 4000;
          while (Date.now() < end) {
            const i = messages.findIndex((m) => m.t === type && predicate(m));
            if (i >= 0) return messages.splice(i, 1)[0];
            await new Promise((r) => setTimeout(r, 15));
          }
          throw Error("Timeout " + type);
        },
      }),
    );
  });
}
test("HTTP allowlist, two-client sync, host transfer and token reconnect", async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port,
    url = "ws://127.0.0.1:" + port + "/ws";
  let a, b, c;
  try {
    for (const name of [
      "/server/quiz-bank.json",
      "/quiz-bank.js",
      "/.env",
      "/legacy/game.js",
    ])
      assert.equal(
        (await fetch("http://127.0.0.1:" + port + name)).status,
        404,
      );
    assert.equal((await fetch("http://127.0.0.1:" + port + "/")).status, 200);
    a = await connect(url);
    a.send({
      t: "create",
      name: "Same",
      config: { mode: "team", monsters: "none" },
    });
    const host = await a.wait("welcome");
    b = await connect(url);
    b.send({ t: "join", room: host.room, name: "Same" });
    const guest = await b.wait("welcome");
    const lobby = await b.wait("lobby", (m) => m.players.length === 2);
    assert.notEqual(lobby.players[0].name, lobby.players[1].name);
    a.send({ t: "start" });
    await a.wait("map");
    await b.wait("map");
    let snap = await b.wait("snapshot");
    assert.equal(snap.roster.length, 2);
    const room = rooms.get(host.room);
    room.world.buyEndsAt = 0;
    const p = room.world.getPlayer(guest.id);
    Object.assign(p, room.world.near({ x: 6.5, y: 6.5 }));
    const start = p.x;
    b.send({ t: "input", input: { dx: 1, dy: 0, aim: 0, fire: true, seq: 1 } });
    await new Promise((r) => setTimeout(r, 200));
    assert.ok(p.x > start);
    assert.ok(p.inventory.pistol.mag < 12);
    b.send({
      t: "input",
      input: { dx: 0, dy: 0, aim: 0, fire: false, seq: 2 },
    });
    a.ws.close();
    await b.wait("lobby", (m) => m.host === guest.id);
    b.ws.close();
    await new Promise((r) => setTimeout(r, 40));
    c = await connect(url);
    c.send({ t: "join", room: guest.room, token: guest.token, name: "Same" });
    const re = await c.wait("welcome");
    assert.equal(re.id, guest.id);
    snap = await c.wait("snapshot");
    assert.equal(snap.me.team, p.team);
    assert.ok(snap.me.inventory);
    c.send({ t: "input", input: { dx: 1, seq: 1 } });
    assert.equal(room.people.get(guest.id).lastSeq, 2); // replayed input ignored
  } finally {
    a?.ws.terminate();
    b?.ws.terminate();
    c?.ws.terminate();
    await new Promise((r) => server.close(r));
    rooms.clear();
  }
});
