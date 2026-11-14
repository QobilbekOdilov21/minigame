import { Assets } from "./assets.js";
import { Renderer } from "./render.js";
import { Network } from "./network.js";
import { iso, clamp, distance, valid } from "./math.js";
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const config = await fetch(
  new URL("../shared/config.json", import.meta.url),
).then((r) => r.json());
const settings = {
  quality: "medium",
  motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
  audio: false,
  zoom: 1,
  ...JSON.parse(localStorage.getItem("maze-settings") || "{}"),
};
let assetPromise,
  assets,
  renderer,
  view,
  map,
  me,
  playing = false,
  lobbyData,
  localId,
  hostId,
  pendingPractice = false,
  dialogType = "",
  lastSend = 0,
  lastHud = 0,
  last = performance.now(),
  sampleAt = last,
  sampleFrames = 0,
  remoteOld = new Map(),
  remoteAt = 0,
  modalQuestion,
  frame = 0;
const keys = new Set(),
  controls = { dx: 0, dy: 0, aim: 0, fire: false, run: false };
let pointerFire = false,
  touchFire = false,
  stick = null;
const seenEvents = new Set();
const net = new Network(receive, (s, bad) => {
  if ($("netStatus")) $("netStatus").textContent = s;
  if (bad) toast(s);
});
function toast(message) {
  const d = document.createElement("div");
  d.textContent = message;
  $("toasts").append(d);
  setTimeout(() => d.remove(), 4200);
}
function resetInput() {
  keys.clear();
  pointerFire = false;
  touchFire = false;
  controls.fire = false;
  controls.dx = 0;
  controls.dy = 0;
  net.input(controls);
}
function modal(title, type, content) {
  resetInput();
  dialogType = type;
  $("dialogTitle").textContent = title;
  $("dialogBody").replaceChildren();
  if (typeof content === "string") $("dialogBody").innerHTML = content;
  else if (content) $("dialogBody").append(content);
  if (!$("dialog").open) $("dialog").showModal();
}
function closeModal() {
  if (dialogType === "puzzle" && modalQuestion)
    net.command("cancelPuzzle", { terminal: modalQuestion.terminal });
  $("dialog").close();
  dialogType = "";
  resetInput();
  $("game").focus({ preventScroll: true });
}
$("closeDialog").onclick = closeModal;
$("dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeModal();
});
async function readyAssets() {
  assetPromise ||= new Assets()
    .load()
    .then((loaded) => {
      assets = loaded;
      renderer = new Renderer($("game"), assets, settings);
    })
    .catch((error) => {
      assetPromise = null;
      throw error;
    });
  return assetPromise;
}
const nickname = () => {
  const n = $("nickname").value.trim().slice(0, 18) || "Operativ";
  localStorage.setItem("maze-name", n);
  return n;
};
$("nickname").value = localStorage.getItem("maze-name") || "Operativ";
function defaultServer() {
  const saved = localStorage.getItem("maze-server");
  if (saved) return saved;
  if (location.hostname.endsWith("github.io")) return "";
  return location.origin.replace(/^http/, "ws") + "/ws";
}
function serverUrl(input) {
  let url = input.trim();
  if (!url)
    throw new Error(
      "Multiplayer server manzilini kiriting (ws:// yoki wss://).",
    );
  url = url.replace(/^http/, "ws");
  const u = new URL(url);
  if (!["ws:", "wss:"].includes(u.protocol) || u.username || u.password)
    throw new Error("Server manzili noto‘g‘ri.");
  if (u.pathname === "/") u.pathname = "/ws";
  if (location.protocol === "https:" && u.protocol === "ws:")
    throw new Error("HTTPS sahifa uchun wss:// manzil kerak.");
  localStorage.setItem("maze-server", u.href);
  return u.href;
}
$("practiceBtn").onclick = async () => {
  try {
    $("practiceBtn").disabled = true;
    await readyAssets();
    pendingPractice = true;
    await net.practice(nickname());
  } catch (e) {
    toast(e.message);
  } finally {
    $("practiceBtn").disabled = false;
  }
};
$("createBtn").onclick = () => createDialog();
function createDialog() {
  modal(
    "OPERATSIYANI SOZLASH",
    "create",
    `<div class="form-grid"><div class="full"><label>O‘YIN REJIMI</label><div class="mode-list">${Object.entries(
      config.MODES,
    )
      .map(
        ([id, m]) =>
          `<button data-mode="${id}" class="${id === "team" ? "selected" : ""}"><b>${m.name}</b><small>${m.summary}</small></button>`,
      )
      .join(
        "",
      )}</div></div><label>VAQT<select id="duration"><option value="300">5 daqiqa</option><option value="480" selected>8 daqiqa</option><option value="900">15 daqiqa</option></select></label><label>JONLAR<select id="life"><option value="1">1</option><option value="3" selected>3</option><option value="5">5</option></select></label><label>RAUNDLAR<select id="rounds"><option value="1">1</option><option value="3" selected>3</option><option value="5">5</option></select></label><label>XARITA<select id="mapSize"><option value="small">Ixcham / 29</option><option value="medium">O‘rta / 39</option><option value="large">Katta / 51</option></select></label><label>MAXLUQLAR<select id="monsters"><option value="none">0 ta</option><option value="few" selected>4 ta</option><option value="normal">8 ta</option><option value="horde">15 ta</option></select></label><label>O‘Q ZAXIRASI<select id="ammo"><option value="limited">Cheklangan</option><option value="scarce">Juda kam</option></select></label><label>JUMBOQLAR<select id="puzzles"><option value="yes">Yoqilgan</option><option value="no">O‘chirilgan</option></select></label><label>JAMOADOSHGA ZARAR<select id="friendly"><option value="no">O‘chirilgan</option><option value="yes">Yoqilgan</option></select></label><label class="full">MULTIPLAYER SERVER<input id="serverUrl" placeholder="wss://server.example/ws" value="${esc(defaultServer())}"></label><button class="primary full" id="confirmCreate">XONANI OCHISH ↗</button></div><p class="dialog-note">Host aloqasi uzilsa server matchni saqlaydi. 30 o‘yinchigacha; havola faqat siz ulashgan odamlarga. Birinchi 6 soniya xarid bosqichi.</p>`,
  );
  let mode = "team";
  document.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.mode;
        document
          .querySelectorAll("[data-mode]")
          .forEach((x) => x.classList.toggle("selected", x === b));
      }),
  );
  $("confirmCreate").onclick = async () => {
    try {
      const url = serverUrl($("serverUrl").value);
      $("confirmCreate").disabled = true;
      await readyAssets();
      await net.connect(url, {
        t: "create",
        name: nickname(),
        config: {
          mode,
          duration: +$("duration").value,
          lives: mode === "impostor" ? 1 : +$("life").value,
          rounds: +$("rounds").value,
          mapSize: $("mapSize").value,
          monsters: $("monsters").value,
          ammo: $("ammo").value,
          puzzles:
            ["impostor", "escape"].includes(mode) ||
            $("puzzles").value === "yes",
          friendly: $("friendly").value === "yes",
        },
      });
    } catch (e) {
      toast(e.message);
      if ($("confirmCreate")) $("confirmCreate").disabled = false;
    }
  };
}
function joinDialog(room = "") {
  modal(
    "XONAGA KIRISH",
    "join",
    `<div class="form-grid"><label>XONA KODI<input id="roomCode" placeholder="A1B2C3" value="${esc(room)}" maxlength="6"></label><label>OPERATIV ISMI<input id="joinName" value="${esc(nickname())}" maxlength="18"></label><label class="full">MULTIPLAYER SERVER<input id="joinServer" value="${esc(defaultServer())}" placeholder="wss://server.example/ws"></label><button class="primary full" id="confirmJoin">ULANISH →</button></div>`,
  );
  $("confirmJoin").onclick = async () => {
    try {
      const url = serverUrl($("joinServer").value);
      await readyAssets();
      await net.connect(url, {
        t: "join",
        room: $("roomCode").value.trim().toUpperCase(),
        name: $("joinName").value,
      });
    } catch (e) {
      toast(e.message);
    }
  };
}
$("joinBtn").onclick = () => joinDialog();
function receive(m) {
  if (m.t === "error") {
    toast(m.message);
    if ($("confirmCreate")) $("confirmCreate").disabled = false;
    return;
  }
  if (m.t === "welcome") {
    localId = m.id;
    hostId = m.host;
    return;
  }
  if (m.t === "lobby") {
    lobbyData = m;
    hostId = m.host;
    if (pendingPractice) {
      pendingPractice = false;
      net.send({ t: "start" });
      return;
    }
    if (m.config.practice) return;
    if (view && playing) return;
    renderLobby();
    return;
  }
  if (m.t === "map") {
    map = m.map;
    view = null;
    me = null;
    seenEvents.clear();
    renderer.setMap(map);
    renderer.cameraReady = false;
    playing = true;
    $("menu").hidden = true;
    $("play").hidden = false;
    if ($("dialog").open) $("dialog").close();
    dialogType = "";
    $("game").focus();
    return;
  }
  if (m.t === "snapshot") {
    remoteOld = new Map((view?.players || []).map((p) => [p.id, p]));
    remoteAt = performance.now();
    view = m;
    if (!me || me.round !== m.round || distance(me, m.me) > 2 || !m.me.alive)
      me = { ...m.me, round: m.round };
    else {
      const error = distance(me, m.me);
      me.x += (m.me.x - me.x) * (error > 0.8 ? 0.65 : 0.18);
      me.y += (m.me.y - me.y) * (error > 0.8 ? 0.65 : 0.18);
      const x = me.x,
        y = me.y;
      Object.assign(me, m.me, { x, y, round: m.round });
    }
    for (const e of m.events || [])
      if (!seenEvents.has(e.id)) {
        seenEvents.add(e.id);
        processEvent(e);
      }
    if (seenEvents.size > 1000) {
      const ids = [...seenEvents].slice(-300);
      seenEvents.clear();
      ids.forEach((x) => seenEvents.add(x));
    }
    if (m.meeting && dialogType !== "meeting") meetingDialog();
    if (m.phase === "match_end" && dialogType !== "results") resultsDialog();
    return;
  }
}
function renderLobby() {
  const r = lobbyData;
  if (!r) return;
  const link = new URL(location.href);
  link.search = "";
  link.searchParams.set("room", r.room);
  if (net.url !== location.origin.replace(/^http/, "ws") + "/ws")
    link.searchParams.set("server", net.url);
  modal(
    "XONA TAYYOR",
    "lobby",
    `<span class="kicker">${config.MODES[r.config.mode].name} / ${r.config.duration / 60} DAQIQA · ${r.config.rounds} RAUND</span><div class="room-code">${r.room}</div><div class="share"><input readonly id="inviteLink" aria-label="Taklif havolasi" value="${esc(link.href)}"><button id="copyInvite">NUSXALASH</button></div><div class="roster" id="roster"></div><div class="action-row"><button id="readyBtn">TAYYOR ✓</button>${localId === r.host ? '<button class="primary" id="startMatch">MATCHNI BOSHLASH ↗</button>' : '<span class="dialog-note">Host boshlashini kuting.</span>'}<button id="exitLobby">XONADAN CHIQISH</button></div><p class="dialog-note">${r.config.mode === "escape" ? "Solo yoki hamkorlikda chiqish." : r.config.mode === "impostor" || r.config.mode === "double" ? "Kamida 4 o‘yinchi." : "Kamida 2 o‘yinchi."} Ulanish uzilganda 2 daqiqa ichida qayta qo‘shilish mumkin.</p>`,
  );
  for (const p of r.players) {
    const d = document.createElement("div");
    if (p.team === 0) d.className = "red";
    const b = document.createElement("b");
    b.textContent = p.name;
    const s = document.createElement("small");
    s.textContent =
      (p.id === r.host ? "HOST / " : "") +
      (p.connected ? "ONLINE" : "OFFLINE") +
      (p.ready ? " / TAYYOR" : " / KUTILMOQDA");
    d.append(b, s);
    $("roster").append(d);
  }
  $("copyInvite").onclick = () =>
    navigator.clipboard
      .writeText(link.href)
      .then(() => toast("Havola nusxalandi."))
      .catch(() => {
        $("inviteLink").select();
      });
  $("readyBtn").onclick = () => net.send({ t: "ready" });
  if ($("startMatch")) $("startMatch").onclick = () => net.send({ t: "start" });
  $("exitLobby").onclick = leave;
}
function processEvent(e) {
  renderer.onEvent(e);
  if (e.kind === "puzzle_open") {
    modalQuestion = e;
    showPuzzle(e);
    return;
  }
  if (e.kind === "hint") toast(e.msg);
  if (["solved", "chest_open"].includes(e.kind)) {
    if (dialogType === "puzzle") {
      modalQuestion = null;
      closeModal();
    }
    toast(e.kind === "solved" ? "To‘g‘ri! Mukofot sandig‘i tayyor." : e.msg);
    tone("pickup");
  }
  if (e.kind === "shot" && e.player === localId) tone("shot");
  if (["hit", "monster_hit"].includes(e.kind) && e.target === localId)
    tone("hit");
  if (
    [
      "death",
      "monster_death",
      "purchase",
      "gate",
      "pickup",
      "bomb",
      "meeting_result",
    ].includes(e.kind)
  ) {
    const text =
      e.kind === "death"
        ? `${e.killer} → ${e.player}`
        : e.kind === "monster_death"
          ? "Maxluq zararsizlantirildi"
          : e.msg || e.item || (e.kind === "pickup" ? "Resurs olindi" : e.kind);
    const d = document.createElement("div");
    d.textContent = text;
    $("feed").prepend(d);
    setTimeout(() => d.remove(), 4500);
  }
}
function showPuzzle(e) {
  modal(
    "IT TERMINALI",
    "puzzle",
    '<p class="quiz" id="question"></p><div class="answers" id="answers"></div><p class="dialog-note">Noto‘g‘ri javobdan keyin boshqa savol beriladi. Jarima yo‘q. To‘g‘ri javob — tasodifiy mukofot sandig‘i.</p>',
  );
  $("question").textContent = e.question.q;
  e.question.a.forEach((a, i) => {
    const b = document.createElement("button"),
      n = document.createElement("b");
    n.textContent = String(i + 1).padStart(2, "0");
    b.append(n, document.createTextNode(a));
    b.onclick = () => {
      document
        .querySelectorAll("#answers button")
        .forEach((x) => (x.disabled = true));
      net.command("solve", { terminal: e.terminal, quiz: e.quiz, answer: i });
    };
    $("answers").append(b);
  });
}
function shop() {
  if (!view || !me.alive) return;
  modal(
    "ARSENAL / ◈ " + Math.floor(me.credits),
    "shop",
    '<div class="shop-grid" id="shopGrid"></div><p class="dialog-note">Xaridlar dastlabki 6 soniyada. Mashqda do‘kon doim ochiq. O‘q va qurol kreditga sotib olinadi.</p>',
  );
  for (const item of config.SHOP) {
    const d = document.createElement("div");
    d.className = "shop-item";
    const c = document.createElement("canvas");
    c.width = 210;
    c.height = 80;
    const ctx = c.getContext("2d");
    assets.sprite(
      ctx,
      config.WEAPONS[item.id]
        ? "weapons/" + (item.id === "smg" ? "rifle" : item.id)
        : LOOT_ID(item.id),
      105,
      72,
      65,
    );
    const b = document.createElement("b");
    b.textContent = item.name;
    const small = document.createElement("small");
    small.textContent = item.info || "";
    const btn = document.createElement("button");
    btn.textContent = "◈ " + item.cost;
    btn.disabled =
      me.credits < item.cost ||
      (!net.local && view.now > view.buyEndsAt) ||
      view.mode === "impostor";
    btn.onclick = () => {
      net.command("buy", { item: item.id });
      setTimeout(() => shop(), 140);
    };
    d.append(c, b, small, btn);
    $("shopGrid").append(d);
  }
}
function LOOT_ID(id) {
  return (
    {
      ammo: "loot/item-0-1",
      medkit: "loot/item-0-2",
      armor: "loot/item-0-3",
      energy: "loot/item-1-0",
      key: "loot/item-1-2",
      scanner: "loot/item-1-1",
      smoke: "weapons/smoke",
    }[id] || "loot/item-1-2"
  );
}
function scores() {
  if (!view) return;
  const root = document.createElement("div"),
    table = document.createElement("table");
  table.innerHTML =
    "<thead><tr><th>OPERATIV</th><th>K</th><th>D</th><th>IT</th><th>HISOB</th></tr></thead>";
  const body = document.createElement("tbody");
  for (const p of [...view.roster].sort((a, b) => b.score - a.score)) {
    const row = document.createElement("tr");
    for (const value of [p.name, p.kills, p.deaths, p.taskCount, p.score]) {
      const td = document.createElement("td");
      td.textContent = value;
      row.append(td);
    }
    body.append(row);
  }
  table.append(body);
  root.append(table);
  modal("JANG HISOBOTI", "scores", root);
}
function resultsDialog() {
  scores();
  dialogType = "results";
  $("dialogTitle").textContent = "MATCH YAKUNLANDI";
  const p = document.createElement("p");
  p.textContent = (view.roundWinner || "DURANG") + " / " + view.roundReason;
  $("dialogBody").prepend(p);
  if (localId === hostId || net.local) {
    const b = document.createElement("button");
    b.className = "primary";
    b.textContent = "LOBBYGA QAYTISH";
    b.onclick = () => {
      playing = false;
      view = null;
      $("play").hidden = true;
      $("menu").hidden = false;
      if (net.local) leave();
      else {
        net.send({ t: "rematch" });
      }
    };
    $("dialogBody").append(b);
  }
}
function meetingDialog() {
  modal(
    "FAVQULODDA YIG‘ILISH",
    "meeting",
    '<p class="dialog-note">Kimga ishonasiz? Tirik o‘yinchilar bir marta ovoz beradi.</p><div id="voters" class="action-row"></div><div class="message-list" id="messages"></div><div class="share"><input id="chat" maxlength="100" placeholder="Qisqa xabar"><button id="sendChat">YUBORISH</button></div>',
  );
  for (const p of view.roster.filter((p) => p.alive)) {
    const b = document.createElement("button");
    b.textContent = p.name;
    b.onclick = () => net.command("vote", { target: p.id });
    $("voters").append(b);
  }
  const skip = document.createElement("button");
  skip.textContent = "O‘TKAZIB YUBORISH";
  skip.onclick = () => net.command("vote", { target: "skip" });
  $("voters").append(skip);
  const sendChat = () => {
    net.command("chat", { text: $("chat").value });
    $("chat").value = "";
  };
  $("sendChat").onclick = sendChat;
  $("chat").onkeydown = (e) => {
    if (e.key === "Enter") sendChat();
  };
}
$("shopBtn").onclick = shop;
$("scoresBtn").onclick = scores;
$("pauseBtn").onclick = () => net.send({ t: "pause" });
function leave() {
  net.close();
  playing = false;
  view = null;
  map = null;
  me = null;
  keys.clear();
  $("play").hidden = true;
  $("menu").hidden = false;
  $("dialog").close();
  dialogType = "";
  sessionStorage.removeItem("maze-session");
}
$("leaveBtn").onclick = () => {
  modal(
    "XONADAN CHIQISH",
    "leave",
    '<p class="dialog-note">Joriy matchni tark etasiz. Boshqa o‘yinchilar serverda davom etadi.</p><div class="action-row"><button class="primary" id="confirmLeave">CHIQISH</button><button id="stay">QOLISH</button></div>',
  );
  $("confirmLeave").onclick = leave;
  $("stay").onclick = closeModal;
};
$("settingsBtn").onclick = () => {
  modal(
    "SOZLAMALAR",
    "settings",
    `<div class="setting-row"><span>GRAFIKA SIFATI</span><select id="quality">${["low", "medium", "high"].map((x) => `<option ${settings.quality === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="setting-row"><span>HARAKAT EFFEKTLARI</span><input type="checkbox" id="motion" ${settings.motion ? "checked" : ""}></div><div class="setting-row"><span>OVOZ</span><input type="checkbox" id="audio" ${settings.audio ? "checked" : ""}></div><div class="setting-row"><span>KAMERA MIQYOSI</span><input type="range" min="0.8" max="1.5" step="0.1" value="${settings.zoom}" id="zoom"></div><p class="dialog-note">Past sifat: yorug‘lik buferi va kubchalar soni kamayadi. Harakat o‘chirilsa yorug‘lik miltillamaydi. Mobil: chap joystick, o‘ng tomonda otish va E / R.</p>`,
  );
  for (const id of ["quality", "motion", "audio", "zoom"])
    $(id).onchange = () => {
      settings[id] = ["motion", "audio"].includes(id)
        ? $(id).checked
        : id === "zoom"
          ? +$(id).value
          : $(id).value;
      localStorage.setItem("maze-settings", JSON.stringify(settings));
    };
};
$("assetsBtn").onclick = async () => {
  try {
    await readyAssets();
    modal(
      "ASSET ARXIVI / 19 MANBA",
      "assets",
      '<p class="dialog-note">Yuklangan 19 ta original rasm · 324 sprite hududi · 8 yo‘nalishli operativ · 6 maxluq animatsiyasi. Muhit ob’ektlari holat, chiroq va zarracha animatsiyasi bilan ishlaydi.</p><div class="asset-grid" id="assetGrid"></div>',
    );
    for (const s of assets.manifest.sources) {
      const f = document.createElement("figure"),
        im = document.createElement("img"),
        caption = document.createElement("figcaption");
      im.src = new URL("../public/assets/" + s.board, import.meta.url).href;
      im.loading = "lazy";
      im.alt = s.group;
      caption.textContent =
        s.group.toUpperCase() + " / " + s.regions + " HUDUD";
      f.append(im, caption);
      $("assetGrid").append(f);
    }
  } catch (e) {
    toast(e.message);
  }
};
let audioCtx;
function tone(kind) {
  if (!settings.audio) return;
  try {
    audioCtx ??= new AudioContext();
    audioCtx.resume();
    const o = audioCtx.createOscillator(),
      g = audioCtx.createGain(),
      t = audioCtx.currentTime;
    o.type = kind === "shot" ? "triangle" : "sine";
    o.frequency.setValueAtTime(
      kind === "shot" ? 130 : kind === "hit" ? 80 : 550,
      t,
    );
    o.frequency.exponentialRampToValueAtTime(
      kind === "pickup" ? 900 : 40,
      t + 0.1,
    );
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + 0.13);
  } catch {}
}
function updateInput(dt) {
  if (!view || !me) return;
  const modalOpen = $("dialog").open;
  let dx =
      (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
      (keys.has("a") || keys.has("arrowleft") ? 1 : 0),
    dy =
      (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
      (keys.has("w") || keys.has("arrowup") ? 1 : 0);
  if (stick) {
    dx = stick.x;
    dy = stick.y;
  }
  // Inverse isometric basis: WASD follows screen-space directions.
  controls.dx = modalOpen ? 0 : dx + dy;
  controls.dy = modalOpen ? 0 : dy - dx;
  controls.run = keys.has("shift");
  controls.fire = !modalOpen && (pointerFire || touchFire);
  if (renderer.mouse.active) {
    const target = renderer.world(
      renderer.mouse.x,
      renderer.mouse.y + 30 * renderer.zoom,
    );
    controls.aim = Math.atan2(target.y - me.y, target.x - me.x);
  }
  if (touchFire) {
    const target = [
      ...(view.monsters || []),
      ...(view.players || []).filter(
        (p) => p.id !== me.id && (p.team !== me.team || p.team < 0),
      ),
    ].sort((a, b) => distance(me, a) - distance(me, b))[0];
    if (target) controls.aim = Math.atan2(target.y - me.y, target.x - me.x);
  }
  me.a = controls.aim;
  const mag = Math.hypot(controls.dx, controls.dy);
  me.moving = mag > 0.01 && !modalOpen;
  me.run = controls.run;
  const running = controls.run && me.stamina > 3;
  const speed = (running ? 4.8 : 3.25) * dt;
  if (
    me.alive &&
    !modalOpen &&
    view.phase === "playing" &&
    !view.paused &&
    view.now > view.buyEndsAt &&
    mag > 0.01
  ) {
    const x = (controls.dx / mag) * speed,
      y = (controls.dy / mag) * speed;
    if (valid(map, me.x + x, me.y, 0.26, view.gates, view.props)) me.x += x;
    if (valid(map, me.x, me.y + y, 0.26, view.gates, view.props)) me.y += y;
  }
  if (performance.now() - lastSend > 1000 / 30) {
    net.input(controls);
    lastSend = performance.now();
  }
}
window.addEventListener("keydown", (e) => {
  if (!playing) return;
  const k = e.key.toLowerCase();
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName))
    return;
  if (
    ["tab", " ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)
  )
    e.preventDefault();
  if (e.repeat) {
    keys.add(k);
    return;
  }
  if (k === "escape") {
    if ($("dialog").open) closeModal();
    return;
  }
  if ($("dialog").open) return;
  keys.add(k);
  if (k === "b") shop();
  if (k === "tab") scores();
  if (k === "r") net.command("reload");
  if (k === "e") net.command("interact");
  if (k === "q") net.command("special");
  if (k === "h") net.command("useMed");
  if (k === "m") net.command("meeting");
  if ("123456".includes(k)) {
    const weapon = Object.keys(config.WEAPONS)[+k - 1];
    if (weapon) net.command("equip", { weapon });
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", resetInput);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) resetInput();
});
const canvas = $("game");
canvas.addEventListener("pointermove", (e) => {
  if (!renderer || e.pointerType === "touch") return;
  const r = canvas.getBoundingClientRect();
  renderer.mouse = {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    active: true,
  };
});
canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || e.pointerType === "touch" || $("dialog").open) return;
  pointerFire = true;
  canvas.setPointerCapture(e.pointerId);
});
const release = () => {
  pointerFire = false;
  controls.fire = false;
};
canvas.addEventListener("pointerup", release);
canvas.addEventListener("pointercancel", release);
canvas.addEventListener("lostpointercapture", release);
window.addEventListener("pointerup", release);
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
$("touchFire").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  touchFire = true;
  $("touchFire").setPointerCapture(e.pointerId);
});
for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
  $("touchFire").addEventListener(name, () => (touchFire = false));
document
  .querySelectorAll("[data-action]")
  .forEach((b) => (b.onclick = () => net.command(b.dataset.action)));
const stickEl = $("stick");
function updateStick(e) {
  const r = stickEl.getBoundingClientRect(),
    dx = (e.clientX - r.left - r.width / 2) / (r.width * 0.4),
    dy = (e.clientY - r.top - r.height / 2) / (r.height * 0.4),
    len = Math.max(1, Math.hypot(dx, dy));
  stick = { x: dx / len, y: dy / len };
  stickEl.firstElementChild.style.transform = `translate(calc(-50% + ${stick.x * 30}px),calc(-50% + ${stick.y * 30}px))`;
}
stickEl.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  stickEl.setPointerCapture(e.pointerId);
  updateStick(e);
});
stickEl.addEventListener("pointermove", (e) => {
  if (stickEl.hasPointerCapture(e.pointerId)) updateStick(e);
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  stickEl.addEventListener(type, () => {
    stick = null;
    stickEl.firstElementChild.style.transform = "translate(-50%,-50%)";
  });
const time = (s) =>
  `${String(Math.max(0, Math.floor(s / 60))).padStart(2, "0")}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, "0")}`;
function hud() {
  if (!view?.me) return;
  const v = view,
    p = v.me,
    w = config.WEAPONS[p.weapon],
    gun = p.inventory[p.weapon];
  $("modeLabel").textContent = net.local
    ? "MASHQ / OFFLINE"
    : config.MODES[v.mode].name + " / " + net.room;
  $("clock").textContent = time(v.remaining);
  $("roundLabel").textContent =
    String(v.round).padStart(2, "0") +
    " / " +
    String(v.rounds).padStart(2, "0");
  $("phaseLabel").textContent =
    v.buyEndsAt > v.now
      ? "XARID " + Math.ceil((v.buyEndsAt - v.now) / 1000)
      : v.phase === "playing"
        ? "LIVE"
        : v.phase.toUpperCase();
  $("operatorName").textContent = p.name;
  $("lives").textContent = "◆ ".repeat(p.lives);
  $("hpValue").textContent = Math.round(p.hp);
  $("hpBar").style.width = p.hp + "%";
  $("armorValue").textContent = Math.round(p.armor);
  $("armorBar").style.width = p.armor + "%";
  $("staminaBar").style.width = p.stamina + "%";
  $("gunName").textContent = w.name;
  $("mag").textContent = gun.mag;
  $("reserve").textContent = gun.reserve;
  $("credits").textContent = "◈ " + Math.floor(p.credits);
  $("reloadLabel").textContent =
    p.reloadAt > v.now ? "QAYTA O‘QLANMOQDA..." : "R / QAYTA O‘QLASH";
  $("supplies").textContent =
    "H MEDKIT ×" + p.items.medkit + " · KALIT ×" + p.items.key;
  $("roleLabel").textContent =
    {
      crew: "AGENT",
      traitor: "YASHIRIN XOIN",
      double: "IKKI TOMONLAMA AGENT",
      operative: "OPERATIVE",
    }[p.role] || "OPERATIVE";
  $("taskBar").style.width =
    (v.taskSolved / Math.max(1, v.taskTotal)) * 100 + "%";
  const objectives = {
    team: ["DATA CORE", "Qizillar faollashtiradi. Ko‘klar zararsizlantiradi."],
    ffa: ["OMON QOLING", "Eng ko‘p raqibni yenging. O‘qni tejang."],
    impostor: [
      "VAZIFALARNI YAKUNLANG",
      "IT terminallari: " +
        v.taskSolved +
        "/" +
        v.taskTotal +
        ". M — yig‘ilish, Q — maxsus.",
    ],
    escape: [
      "CHIQISHNI TOPING",
      p.pieces + "/3 kod-parcha. Terminalga yaqinlashing va E bosing.",
    ],
    double: [
      "JAMOANGIZNI HIMOYA QILING",
      "Data core va yashirin agentlar. Q — maxsus.",
    ],
  };
  $("objectiveTitle").textContent = objectives[v.mode][0];
  $("objectiveText").textContent = objectives[v.mode][1];
  $("netStatus").textContent = net.local
    ? "LOCAL / 30 HZ"
    : net.rtt + " MS / 30 HZ";
  const c = $("gunIcon").getContext("2d");
  c.clearRect(0, 0, 130, 60);
  assets.sprite(
    c,
    "weapons/" + (p.weapon === "smg" ? "rifle" : p.weapon),
    65,
    55,
    48,
  );
  const slots = $("weaponSlots");
  if (slots.dataset.key !== p.weapon + Object.keys(p.inventory).join()) {
    slots.dataset.key = p.weapon + Object.keys(p.inventory).join();
    slots.replaceChildren();
    Object.keys(config.WEAPONS).forEach((id, i) => {
      if (!p.inventory[id]) return;
      const b = document.createElement("button");
      b.textContent = i + 1 + " " + config.WEAPONS[id].class;
      b.classList.toggle("selected", p.weapon === id);
      b.onclick = () => net.command("equip", { weapon: id });
      slots.append(b);
    });
  }
  let hint = "";
  if (p.alive) {
    if (v.drops.some((d) => distance(p, d) < 1.35))
      hint = "[E] RESURS / SANDIQNI OLISH";
    else if (v.terminals.some((t) => !t.solved && distance(p, t) < 1.6))
      hint = "[E] IT JUMBOG‘INI YECHISH";
    else if (v.gates.some((g) => g.locked && distance(p, g) < 1.65))
      hint = "[E] ESHIK / KALIT KERAK";
    else if (v.mode === "escape" && distance(p, v.exit) < 1.7)
      hint = "[E] CHIQISH · " + p.pieces + "/3 KOD";
    else if (
      ["team", "double"].includes(v.mode) &&
      distance(p, v.bomb.site) < 1.9
    )
      hint = "[E] DATA CORE";
  }
  $("interaction").hidden = !hint || $("dialog").open;
  $("interaction").textContent = hint;
  const overlay = $("phaseOverlay");
  let text = "",
    detail = "";
  if (v.paused) {
    text = "PAUZA";
    detail = "Host davom ettiradi.";
  } else if (!p.alive) {
    text = p.lives ? "QAYTA TIKLANISH" : "KUZATUV REJIMI";
    detail = p.lives ? "3 soniya ichida qaytasiz." : "Jamoangizni kuzating.";
  } else if (v.phase === "round_end") {
    text = v.roundWinner || "DURANG";
    detail = v.roundReason;
  } else if (v.buyEndsAt > v.now) {
    text = "TAYYORLANING";
    detail = "B / Arsenal · " + Math.ceil((v.buyEndsAt - v.now) / 1000) + " s";
  }
  overlay.hidden = !text;
  overlay.replaceChildren();
  if (text) {
    const b = document.createElement("b"),
      s = document.createElement("small");
    b.textContent = text;
    s.textContent = detail;
    overlay.append(b, s);
  }
  if (dialogType === "meeting") {
    if (!v.meeting) closeModal();
    else {
      $("messages").replaceChildren();
      for (const m of v.meeting.messages) {
        const line = document.createElement("p");
        line.textContent = m.name + ": " + m.text;
        $("messages").append(line);
      }
      document
        .querySelectorAll("#voters button")
        .forEach(
          (b) => (b.disabled = v.meeting.voted.includes(localId) || !p.alive),
        );
    }
  }
}
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.04, Math.max(0.001, (ts - last) / 1000));
  last = ts;
  if (!playing || !view || !renderer) return;
  frame++;
  sampleFrames++;
  updateInput(dt);
  const remote = (view.players || []).map((p) => {
    if (p.id === me.id) return me;
    const old = remoteOld.get(p.id),
      k = clamp((ts - remoteAt) / 67, 0, 1);
    return old
      ? { ...p, x: old.x + (p.x - old.x) * k, y: old.y + (p.y - old.y) * k }
      : p;
  });
  renderer.draw({ ...view, players: remote }, me, dt, ts);
  if (ts - lastHud > 100) {
    hud();
    lastHud = ts;
  }
  if (ts - sampleAt > 1000) {
    renderer.metrics.fps = Math.round((sampleFrames * 1000) / (ts - sampleAt));
    if (!document.hidden) {
      const fps = renderer.metrics.fps;
      renderer.slowSamples = fps < 46 ? (renderer.slowSamples || 0) + 1 : 0;
      renderer.fastSamples = fps > 57 ? (renderer.fastSamples || 0) + 1 : 0;
      if (renderer.slowSamples >= 2) {
        renderer.autoScale = Math.max(0.65, (renderer.autoScale || 1) - 0.1);
        renderer.slowSamples = 0;
      }
      if (renderer.fastSamples >= 6) {
        renderer.autoScale = Math.min(1, (renderer.autoScale || 1) + 0.1);
        renderer.fastSamples = 0;
      }
    }
    $("perf").textContent = renderer.metrics.fps + " FPS";
    sampleFrames = 0;
    sampleAt = ts;
  }
}
requestAnimationFrame(loop);
window.mazeDebug = {
  get snapshot() {
    return view;
  },
  get metrics() {
    return renderer?.metrics;
  },
  get local() {
    return me;
  },
  get assetCount() {
    return assets ? Object.keys(assets.manifest.frames).length : 0;
  },
};
const query = new URLSearchParams(location.search);
if (query.get("server")) {
  try {
    serverUrl(query.get("server"));
  } catch (e) {
    toast(e.message);
  }
}
if (query.get("room"))
  joinDialog(
    query
      .get("room")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 6),
  );
