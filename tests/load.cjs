const { performance } = require("node:perf_hooks");
const { createServer, metrics, rooms } = require("../server/index.cjs");
const { WebSocket } = require("ws");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = "ws://127.0.0.1:" + server.address().port + "/ws",
    clients = [];
  let code;
  const counts = new Map();
  function client(i) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.on("error", reject);
      ws.on("open", () =>
        ws.send(
          JSON.stringify(
            i === 0
              ? {
                  t: "create",
                  name: "Load 0",
                  config: {
                    mode: "team",
                    mapSize: "medium",
                    monsters: "horde",
                    duration: 900,
                  },
                }
              : { t: "join", name: "Load " + i, room: code },
          ),
        ),
      );
      ws.on("message", (buf) => {
        const m = JSON.parse(buf);
        if (m.t === "welcome") {
          if (i === 0) code = m.room;
          clients.push(ws);
          counts.set(ws, 0);
          resolve(ws);
        }
        if (m.t === "snapshot") counts.set(ws, counts.get(ws) + 1);
      });
    });
  }
  try {
    const host = await client(0);
    for (let i = 1; i < 20; i++) await client(i);
    host.send(JSON.stringify({ t: "start" }));
    await wait(250);
    const r = rooms.get(code);
    r.world.buyEndsAt = 0;
    const times = [];
    let seq = 0;
    const input = setInterval(() => {
      seq++;
      for (let i = 0; i < clients.length; i++)
        clients[i].send(
          JSON.stringify({
            t: "input",
            input: {
              dx: Math.sin(seq * 0.08 + i),
              dy: Math.cos(seq * 0.07 + i),
              aim: seq * 0.1,
              fire: true,
              run: false,
              seq,
            },
          }),
        );
    }, 1000 / 30);
    await wait(6000);
    clearInterval(input);
    const result = {
      players: clients.length,
      monsters: r.world.monsters.length,
      seconds: 6,
      ticks: metrics.ticks,
      meanTickMs: +(metrics.totalTickMs / metrics.ticks).toFixed(3),
      maxTickMs: +metrics.maxTickMs.toFixed(3),
      minSnapshots: Math.min(...counts.values()),
      snapshotHz: +(Math.min(...counts.values()) / 6).toFixed(1),
      rssMB: Math.round(process.memoryUsage().rss / 1048576),
    };
    console.log(JSON.stringify(result, null, 2));
    require("node:fs").writeFileSync(
      "docs/load-results.json",
      JSON.stringify(result, null, 2),
    );
    if (result.minSnapshots < 45 || result.maxTickMs > 100)
      process.exitCode = 1;
  } finally {
    for (const ws of clients) ws.terminate();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
