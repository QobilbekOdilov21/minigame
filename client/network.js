export class Network {
  constructor(receive, status) {
    this.receive = receive;
    this.status = status;
    this.seq = 0;
    this.rtt = 0;
    this.generation = 0;
  }
  send(data) {
    if (this.worker) this.worker.postMessage(data);
    else if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(data));
  }
  async practice(name) {
    this.close();
    this.local = true;
    this.seq = 0;
    this.worker = new Worker(
      new URL("../public/practice-worker.js", import.meta.url),
    );
    this.worker.onmessage = (e) => this.receive(e.data);
    this.worker.onerror = () =>
      this.status("Mashq yuklanmadi. Sahifani yangilang.", true);
    this.send({
      t: "create",
      name,
      config: {
        mode: "escape",
        duration: 900,
        lives: 5,
        rounds: 1,
        mapSize: "small",
        monsters: "few",
        puzzles: true,
        practice: true,
      },
    });
  }
  async connect(url, message) {
    this.close();
    this.local = false;
    this.url = url;
    this.joinMessage = message;
    await this.open();
    this.send(message);
    this.pingTimer = setInterval(
      () => this.send({ t: "ping", at: performance.now() }),
      3000,
    );
  }
  open() {
    return new Promise((resolve, reject) => {
      const gen = this.generation;
      let ws;
      try {
        ws = new WebSocket(this.url);
      } catch (e) {
        reject(e);
        return;
      }
      this.ws = ws;
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Server javob bermadi."));
      }, 8000);
      ws.onopen = () => {
        clearTimeout(timeout);
        this.retry = 0;
        this.status("ULANDI");
        resolve();
      };
      ws.onmessage = (e) => {
        let m;
        try {
          m = JSON.parse(e.data);
        } catch {
          return;
        }
        if (m.t === "pong") {
          this.rtt = Math.round(performance.now() - m.at);
          return;
        }
        if (m.t === "welcome") {
          this.id = m.id;
          this.room = m.room;
          this.token = m.token;
          sessionStorage.setItem(
            "maze-session",
            JSON.stringify({ room: m.room, token: m.token, url: this.url }),
          );
        }
        this.receive(m);
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Serverga ulanib bo‘lmadi. Manzilni tekshiring."));
      };
      ws.onclose = (e) => {
        clearTimeout(timeout);
        if (gen !== this.generation) return;
        if (e.code === 4003 || e.code === 4008) {
          this.status("Ulanish yopildi: " + e.reason, true);
          return;
        }
        if (this.token && this.room) {
          this.status("ALOQA UZILDI · QAYTA ULANMOQDA");
          const wait = Math.min(5000, 500 * 2 ** (this.retry || 0));
          this.retry = (this.retry || 0) + 1;
          this.retryTimer = setTimeout(async () => {
            try {
              await this.open();
              this.send({
                t: "join",
                room: this.room,
                token: this.token,
                name: this.joinMessage.name,
              });
            } catch {
              /* onclose schedules next attempt */
            }
          }, wait);
        }
      };
    });
  }
  input(controls) {
    this.send({ t: "input", input: { ...controls, seq: ++this.seq } });
  }
  command(action, extra = {}) {
    this.send({ t: "command", action, ...extra });
  }
  close() {
    this.generation++;
    clearTimeout(this.retryTimer);
    clearInterval(this.pingTimer);
    this.worker?.terminate();
    this.worker = null;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.token = null;
    this.room = null;
    this.id = null;
  }
}
