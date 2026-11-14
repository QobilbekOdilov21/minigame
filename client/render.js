import {
  iso,
  uniso,
  clamp,
  distance,
  clear,
  wall,
  hash,
  screenDirection,
} from "./math.js";
const TAU = Math.PI * 2,
  MONSTERS = ["walker", "brute", "stalker", "toxic", "runner", "boss"];
const LOOT = {
  cash: "loot/item-0-0",
  ammo: "loot/item-0-1",
  medkit: "loot/item-0-2",
  armor: "loot/item-0-3",
  energy: "loot/item-1-0",
  scanner: "loot/item-1-1",
  key: "loot/item-1-2",
  weapon: "weapons/rifle",
  corpse: "loot/item-1-3",
  chest: "interactions/chest-rare",
};
export class Renderer {
  constructor(canvas, assets, settings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.assets = assets;
    this.settings = settings;
    this.discovered = new Set();
    this.particles = [];
    this.anim = new Map();
    this.metrics = { frames: 0, ms: [], fps: 0 };
    this.light = document.createElement("canvas");
    this.camera = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };
    this.floorTextures = Array.from({ length: 16 }, (_, i) =>
      assets.texture("tiles/floor-" + Math.floor(i / 4) + "-" + (i % 4)),
    );
    this.wallTexture = assets.texture("tiles/floor-4-0");
  }
  setMap(map) {
    this.map = map;
    this.discovered.clear();
    this.vis = null;
    this.particles = [];
    this.anim.clear();
    const n = map.length;
    this.floor = document.createElement("canvas");
    this.floor.width = n * 96 + 192;
    this.floor.height = n * 48 + 160;
    this.floorOffset = { x: n * 48 + 96, y: 80 };
    const c = this.floor.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.translate(this.floorOffset.x, this.floorOffset.y);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if (map[y][x]) continue;
        const p = iso(x, y),
          h = hash(x, y),
          biome = (x < n / 2 ? 0 : 1) + (y > n / 2 ? 2 : 0);
        const image = this.floorTextures[(biome * 3 + (h % 3)) % 16];
        c.save();
        c.transform(
          48 / image.width,
          24 / image.width,
          -48 / image.height,
          24 / image.height,
          p.x,
          p.y,
        );
        c.drawImage(image, 0, 0);
        c.fillStyle = "#1a2c3755";
        c.fillRect(0, 0, image.width, image.height);
        c.restore();
        this.polygon(
          c,
          [
            p,
            { x: p.x + 48, y: p.y + 24 },
            { x: p.x, y: p.y + 48 },
            { x: p.x - 48, y: p.y + 24 },
          ],
          null,
          "#8ca3ad16",
        );
        if (wall(map, x, y - 1) || wall(map, x - 1, y)) {
          c.fillStyle = "#020d164d";
          c.beginPath();
          c.moveTo(p.x - 48, p.y + 24);
          c.lineTo(p.x, p.y);
          c.lineTo(p.x + 48, p.y + 24);
          c.lineTo(p.x + 30, p.y + 38);
          c.lineTo(p.x - 8, p.y + 12);
          c.lineTo(p.x - 48, p.y + 32);
          c.fill();
        }
      }
  }
  polygon(c, points, fill, stroke) {
    c.beginPath();
    points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.stroke();
    }
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.width = r.width;
    this.height = r.height;
    const dpr =
      Math.min(
        devicePixelRatio || 1,
        this.settings.quality === "high" ? 1.5 : 1,
      ) *
      (this.settings.quality === "low" ? 0.8 : 1) *
      (this.autoScale || 1);
    if (
      this.canvas.width !== Math.round(r.width * dpr) ||
      this.canvas.height !== Math.round(r.height * dpr)
    ) {
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
    }
    this.dpr = dpr;
    this.zoom =
      clamp(Math.min(this.width / 1300, this.height / 850), 0.57, 1.18) *
      (this.settings.zoom || 1);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  screen(p, z = 0) {
    const v = iso(p.x, p.y, z);
    return {
      x: this.width / 2 + (v.x - this.camera.x) * this.zoom,
      y: this.height * 0.51 + (v.y - this.camera.y) * this.zoom,
    };
  }
  world(x, y) {
    return uniso(
      (x - this.width / 2) / this.zoom + this.camera.x,
      (y - this.height * 0.51) / this.zoom + this.camera.y,
    );
  }
  collectVisibility(me, v, ts) {
    if (ts - (this.visAt || 0) < 130) return;
    this.visAt = ts;
    this.vis = new Set();
    const n = this.map.length,
      gates = v.gates || [];
    for (
      let y = Math.max(0, Math.floor(me.y) - 10);
      y < Math.min(n, me.y + 11);
      y++
    )
      for (
        let x = Math.max(0, Math.floor(me.x) - 10);
        x < Math.min(n, me.x + 11);
        x++
      ) {
        const p = { x: x + 0.5, y: y + 0.5 };
        if (distance(p, me) < 10 && clear(this.map, me, p, gates)) {
          this.vis.add(y * n + x);
          this.discovered.add(y * n + x);
        }
      }
  }
  onEvent(e) {
    if (["death", "monster_death"].includes(e.kind)) {
      for (let i = 0; i < (this.settings.quality === "low" ? 12 : 24); i++) {
        const a = Math.random() * TAU,
          s = 1 + Math.random() * 4;
        this.particles.push({
          x: e.x,
          y: e.y,
          z: 15 + Math.random() * 35,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          vz: 25 + Math.random() * 50,
          life: 1.15,
          max: 1.15,
          color: ["#b5cfce", "#415866", "#b28a4d", "#6d9194"][i % 4],
        });
      }
    }
    if (this.particles.length > 500)
      this.particles.splice(0, this.particles.length - 500);
  }
  draw(v, me, dt, ts) {
    const start = performance.now();
    if (!this.map || !me) return;
    this.resize();
    const ctx = this.ctx,
      w = this.width,
      h = this.height;
    const cp = iso((v.eye || me).x, (v.eye || me).y);
    if (!this.cameraReady) {
      this.camera = cp;
      this.cameraReady = true;
    }
    const ease = 1 - Math.exp(-16 * dt);
    this.camera.x += (cp.x - this.camera.x) * ease;
    this.camera.y += (cp.y - this.camera.y) * ease;
    ctx.fillStyle = "#0d171e";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(
      w / 2 - this.camera.x * this.zoom,
      h * 0.51 - this.camera.y * this.zoom,
    );
    ctx.scale(this.zoom, this.zoom);
    ctx.drawImage(this.floor, -this.floorOffset.x, -this.floorOffset.y);
    ctx.restore();
    this.collectVisibility(v.eye || me, v, ts);
    const n = this.map.length,
      q = this.zoom,
      objects = [];
    const inView = (p) => {
      const s = this.screen(p);
      return s.x > -160 && s.x < w + 160 && s.y > -20 && s.y < h + 200;
    };
    // Static tiles and dynamic entities share a foot-depth painter order.
    for (
      let y = Math.max(0, Math.floor(me.y) - 17);
      y < Math.min(n, me.y + 18);
      y++
    )
      for (
        let x = Math.max(0, Math.floor(me.x) - 17);
        x < Math.min(n, me.x + 18);
        x++
      )
        if (
          this.map[y][x] &&
          inView({ x, y }) &&
          (!wall(this.map, x - 1, y) ||
            !wall(this.map, x + 1, y) ||
            !wall(this.map, x, y - 1) ||
            !wall(this.map, x, y + 1))
        ) {
          objects.push({
            x: x + 0.5,
            y: y + 0.5,
            depth: x + y + 1,
            type: "wall",
            tx: x,
            ty: y,
          });
        }
    for (const p of v.props || [])
      if (inView(p))
        objects.push({ ...p, type: "prop", prop: p.type, depth: p.x + p.y });
    for (const p of v.lamps || [])
      if (inView(p)) objects.push({ ...p, type: "lamp", depth: p.x + p.y });
    for (const p of v.terminals || [])
      objects.push({ ...p, type: "terminal", depth: p.x + p.y });
    for (const p of v.drops || [])
      objects.push({ ...p, type: "loot", depth: p.x + p.y });
    for (const p of v.gates || [])
      if (inView(p) && p.locked)
        objects.push({ ...p, type: "gate", depth: p.x + p.y });
    if (v.mode === "escape")
      objects.push({ ...v.exit, type: "exit", depth: v.exit.x + v.exit.y });
    if (["team", "double"].includes(v.mode))
      objects.push({
        ...v.bomb.site,
        type: "core",
        depth: v.bomb.site.x + v.bomb.site.y,
      });
    for (const p of v.players || [])
      if (p.alive) {
        const actor = p.id === me.id ? me : p;
        objects.push({ ...actor, type: "player", depth: actor.x + actor.y });
      }
    for (const m of v.monsters || [])
      objects.push({ ...m, type: "monster", depth: m.x + m.y });
    objects.sort((a, b) => a.depth - b.depth || (a.type === "wall" ? 1 : -1));
    for (const o of objects) {
      const p = this.screen(o);
      if (o.type === "wall") {
        this.drawWall(o, p, me);
        continue;
      }
      ctx.save();
      if (o.type === "player" || o.type === "monster") {
        const moving =
          o.type === "monster"
            ? o.state !== "attack" && o.state !== "idle"
            : o.moving;
        let a = this.anim.get(o.id);
        if (!a) {
          a = { clock: 0, x: o.x, y: o.y };
          this.anim.set(o.id, a);
        }
        const moved = distance(o, a) > 0.008;
        a.clock += moving || moved ? dt * (o.run ? 18 : 12) : dt * 2;
        a.x = o.x;
        a.y = o.y;
        const frame = moving || moved ? Math.floor(a.clock) % 8 : 0;
        this.shadow(p, o.type === "monster" && o.kind === "boss" ? 26 : 15);
        if (o.type === "player") {
          const row = screenDirection(o.a),
            size = 90 * q;
          this.assets.actor(ctx, "player", row, frame, p.x, p.y, size);
          ctx.strokeStyle =
            o.id === me.id ? "#dba654" : o.team === 0 ? "#d97871" : "#7abecb";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 1, 14 * q, 6 * q, 0, 0, TAU);
          ctx.stroke();
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#c9d9d9";
          ctx.fillText(o.name, p.x, p.y - 88 * q);
          const elapsed = v.now - o.lastFire;
          if (elapsed >= 0 && elapsed < 135) {
            const a = iso(Math.cos(o.a), Math.sin(o.a));
            const len = Math.hypot(a.x, a.y);
            this.assets.sprite(
              ctx,
              "weapons/muzzle-" + (Math.floor(elapsed / 28) % 5),
              p.x + (a.x / len) * 28 * q,
              p.y - 32 * q + (a.y / len) * 18 * q,
              23 * q,
              1,
              false,
              Math.atan2(a.y, a.x),
            );
          }
          if (o.reloadAt > v.now) {
            ctx.fillStyle = "#1b2b32";
            ctx.fillRect(p.x - 20 * q, p.y - 80 * q, 40 * q, 3);
            ctx.fillStyle = "#dfa653";
            ctx.fillRect(
              p.x - 20 * q,
              p.y - 80 * q,
              40 * q * (1 - (o.reloadAt - v.now) / 3600),
              3,
            );
          }
        } else {
          const row = Math.max(0, MONSTERS.indexOf(o.kind)),
            sz = (o.kind === "boss" ? 132 : o.kind === "brute" ? 110 : 90) * q;
          const dir = iso(Math.cos(o.a), Math.sin(o.a));
          this.assets.actor(
            ctx,
            "monster",
            row,
            frame,
            p.x,
            p.y,
            sz,
            dir.x < 0,
          );
          ctx.fillStyle = "#182a32";
          ctx.fillRect(p.x - 18 * q, p.y - sz * 0.95, 36 * q, 3);
          ctx.fillStyle = "#a1b8a5";
          ctx.fillRect(
            p.x - 18 * q,
            p.y - sz * 0.95,
            (36 * q * o.hp) / o.maxHp,
            3,
          );
        }
      } else if (o.type === "prop") {
        const prop = o.prop;
        const map = {
          crate: "props/crate",
          barrel: "props/barrel",
          sandbags: "props/sandbags",
          generator: "props/generator",
          server: "furniture/server",
          classroom: "furniture/classroom",
          medical: "furniture/medical",
          armory: "furniture/armory",
          storage: "furniture/storage",
          workbench: "furniture/workbench",
          camera: "props/camera",
          power: "props/power",
        };
        const size = ["classroom", "medical", "storage", "armory"].includes(
          prop,
        )
          ? 105
          : prop === "server"
            ? 125
            : prop === "crate"
              ? 65
              : 80;
        this.shadow(p, 22);
        this.assets.sprite(ctx, map[prop], p.x, p.y, size * q);
        if (
          ["generator", "server", "power", "camera", "classroom"].includes(prop)
        ) {
          const alpha = this.settings.motion
            ? 0.55 + 0.25 * Math.sin(ts / 900 + o.x)
            : 0.7;
          ctx.fillStyle = "rgba(107,208,215," + alpha + ")";
          ctx.fillRect(p.x - 2, p.y - 32 * q, 4 * q, 2 * q);
          if (prop === "generator" && this.settings.motion) {
            ctx.fillStyle = "#b5ccca22";
            ctx.beginPath();
            ctx.ellipse(
              p.x,
              p.y - (80 + ((ts / 70) % 12)) * q,
              7 * q,
              3 * q,
              0,
              0,
              TAU,
            );
            ctx.fill();
          }
        }
      } else if (o.type === "lamp") {
        this.shadow(p, 12);
        this.assets.sprite(ctx, "props/lamp", p.x, p.y, 145 * q);
        const glow = ctx.createRadialGradient(
          p.x + 13 * q,
          p.y - 112 * q,
          0,
          p.x + 13 * q,
          p.y - 112 * q,
          20 * q,
        );
        glow.addColorStop(0, o.color === "amber" ? "#ffd198cc" : "#91e6ebaa");
        glow.addColorStop(1, "#91d5db00");
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 10 * q, p.y - 135 * q, 45 * q, 45 * q);
      } else if (o.type === "terminal") {
        this.shadow(p, 19);
        this.assets.sprite(
          ctx,
          "interactions/terminal" + (o.solved ? "-active" : ""),
          p.x,
          p.y,
          82 * q,
        );
        if (!o.solved) {
          ctx.font = "11px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#a6e5e9";
          ctx.fillText("IT", p.x, p.y - 85 * q);
        } else if (this.settings.motion) {
          ctx.strokeStyle = "#80d8b04d";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 25 * q, 12 * q, 0, 0, TAU);
          ctx.stroke();
        }
      } else if (o.type === "loot") {
        this.shadow(p, 12);
        const lift = this.settings.motion
          ? Math.sin(ts / 550 + o.x) * 2 * q
          : 0;
        this.assets.sprite(
          ctx,
          LOOT[o.kind] || LOOT.cash,
          p.x,
          p.y + lift,
          (o.kind === "chest" ? 51 : o.kind === "corpse" ? 35 : 25) * q,
        );
        if (o.kind === "chest") {
          ctx.strokeStyle = "#d5a94d66";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 1, 26 * q, 12 * q, 0, 0, TAU);
          ctx.stroke();
        }
      } else if (o.type === "gate") {
        this.assets.sprite(ctx, "props/vault", p.x, p.y, 86 * q);
      } else if (o.type === "exit") {
        ctx.strokeStyle = "#83d6a3";
        ctx.lineWidth = 2;
        const r = 22 * q;
        this.polygon(
          ctx,
          [
            { x: p.x, y: p.y - r / 2 },
            { x: p.x + r, y: p.y },
            { x: p.x, y: p.y + r / 2 },
            { x: p.x - r, y: p.y },
          ],
          "#46946b22",
          "#74ce9d",
        );
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#acd9b6";
        ctx.fillText("EXIT", p.x, p.y - 20 * q);
      } else if (o.type === "core") {
        this.assets.sprite(ctx, "loot/item-1-2", p.x, p.y, 40 * q);
        ctx.fillStyle = v.bomb.planted ? "#e16f60" : "#d5ae65";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          v.bomb.planted ? "DATA CORE / ACTIVE" : "DATA CORE",
          p.x,
          p.y - 50 * q,
        );
      }
      ctx.restore();
    }
    // Tracers use the same isometric projection as physics, not screen-space aim.
    for (const b of v.bullets || []) {
      const a = this.screen({ x: b.x - b.dx * 0.35, y: b.y - b.dy * 0.35 }, 27),
        p = this.screen(b, 27);
      ctx.strokeStyle = "#ffe5aa";
      ctx.lineWidth = 2 * q;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    for (const e of v.events || [])
      if (e.kind === "impact" && v.now - e.time < 180) {
        const p = this.screen(e, 20),
          frame = clamp(Math.floor((v.now - e.time) / 25), 0, 7);
        this.assets.sprite(ctx, "effects/fx-0-" + frame, p.x, p.y, 30 * q);
      }
    for (const s of v.smokes || []) {
      const p = this.screen(s);
      const r = 80 * q;
      const g = ctx.createRadialGradient(
        p.x,
        p.y - 15 * q,
        0,
        p.x,
        p.y - 15 * q,
        r,
      );
      g.addColorStop(0, "#9bb9be9a");
      g.addColorStop(1, "#678c9700");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vz -= 150 * dt;
      p.z += p.vz * dt;
      if (p.z < 0) {
        p.z = 0;
        p.vz *= -0.3;
        p.vx *= 0.8;
        p.vy *= 0.8;
      }
      const s = this.screen(p, p.z);
      ctx.globalAlpha = p.life / p.max;
      const r = 4 * q;
      ctx.fillStyle = p.color;
      ctx.fillRect(s.x - r / 2, s.y - r / 2, r, r);
      ctx.fillStyle = "#ffffff66";
      ctx.fillRect(s.x - r / 2, s.y - r / 2, r, 1);
      ctx.globalAlpha = 1;
    }
    this.lighting(v, v.eye || me);
    if (this.mouse.active) {
      ctx.strokeStyle = "#c9e7e6";
      ctx.lineWidth = 1;
      const { x, y } = this.mouse;
      ctx.beginPath();
      ctx.moveTo(x - 11, y);
      ctx.lineTo(x - 4, y);
      ctx.moveTo(x + 4, y);
      ctx.lineTo(x + 11, y);
      ctx.moveTo(x, y - 11);
      ctx.lineTo(x, y - 4);
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, y + 11);
      ctx.stroke();
      ctx.fillStyle = "#dfa653";
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    if (ts - (this.minimapAt || 0) > 180) {
      this.minimap(v, me);
      this.minimapAt = ts;
    }
    this.metrics.frames++;
    this.metrics.ms.push(performance.now() - start);
    if (this.metrics.ms.length > 600) this.metrics.ms.shift();
  }
  shadow(p, size) {
    const c = this.ctx;
    c.fillStyle = "#02080c80";
    c.beginPath();
    c.ellipse(
      p.x + 4 * this.zoom,
      p.y + 2 * this.zoom,
      size * this.zoom,
      size * 0.4 * this.zoom,
      0,
      0,
      TAU,
    );
    c.fill();
  }
  drawWall(o, p, me) {
    const c = this.ctx,
      q = this.zoom,
      sx = this.screen({ x: o.tx, y: o.ty }),
      height = 58 * q,
      hw = 48 * q,
      hh = 24 * q;
    const dx = o.x - me.x,
      dy = o.y - me.y;
    const fade =
      dx + dy > -0.4 && Math.abs(dx - dy) < 2 && distance(o, me) < 3.6;
    const A = { x: sx.x, y: sx.y - height },
      B = { x: sx.x + hw, y: sx.y + hh - height },
      C = { x: sx.x, y: sx.y + 2 * hh - height },
      D = { x: sx.x - hw, y: sx.y + hh - height };
    c.save();
    c.globalAlpha = fade ? 0.26 : 1;
    this.polygon(
      c,
      [D, C, { x: C.x, y: C.y + height }, { x: D.x, y: D.y + height }],
      "#293944",
      "#13202a",
    );
    this.polygon(
      c,
      [C, B, { x: B.x, y: B.y + height }, { x: C.x, y: C.y + height }],
      "#1c2a36",
      "#111d27",
    );
    c.save();
    c.beginPath();
    c.moveTo(D.x, D.y);
    c.lineTo(C.x, C.y);
    c.lineTo(C.x, C.y + height);
    c.lineTo(D.x, D.y + height);
    c.clip();
    c.globalAlpha *= 0.42;
    c.transform(hw / 256, hh / 256, 0, height / 256, D.x, D.y);
    c.drawImage(this.wallTexture, 0, 0, 256, 256);
    c.restore();
    this.polygon(c, [A, B, C, D], "#52616a", "#6c7b82");
    this.polygon(
      c,
      [
        { x: A.x, y: A.y + 4 * q },
        { x: D.x, y: D.y + 4 * q },
        { x: D.x, y: D.y + 8 * q },
        { x: A.x, y: A.y + 8 * q },
      ],
      "#6c7d8344",
    );
    for (let i = 1; i < 4; i++) {
      const z = (height * i) / 4;
      c.strokeStyle = "#10222fbb";
      c.beginPath();
      c.moveTo(D.x, D.y + z);
      c.lineTo(C.x, C.y + z);
      c.lineTo(B.x, B.y + z);
      c.stroke();
    }
    if (hash(o.tx, o.ty) % 9 === 0) {
      c.strokeStyle = "#71bbc0aa";
      c.lineWidth = 2 * q;
      c.beginPath();
      c.moveTo(D.x + 6 * q, D.y + 10 * q);
      c.lineTo(C.x - 6 * q, C.y + 10 * q);
      c.stroke();
    }
    c.restore();
  }
  lighting(v, me) {
    const scale = this.settings.quality === "low" ? 0.25 : 0.4,
      w = this.width,
      h = this.height;
    const lw = Math.ceil(w * scale),
      lh = Math.ceil(h * scale);
    if (this.light.width !== lw || this.light.height !== lh) {
      this.light.width = lw;
      this.light.height = lh;
    }
    const c = this.light.getContext("2d");
    c.setTransform(scale, 0, 0, scale, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.clearRect(0, 0, w, h);
    c.fillStyle = "#020a11b8";
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "destination-out";
    const fan = (origin, angle, spread, radius, strength) => {
      const p = this.screen(origin);
      c.save();
      c.beginPath();
      c.moveTo(p.x, p.y);
      const rays = this.settings.quality === "low" ? 28 : 60;
      for (let i = 0; i <= rays; i++) {
        const a = angle - spread + (spread * 2 * i) / rays;
        let r = 0.1;
        for (; r < radius; r += 0.12) {
          const target = {
            x: origin.x + Math.cos(a) * r,
            y: origin.y + Math.sin(a) * r,
          };
          if (
            wall(this.map, target.x, target.y) ||
            (v.gates || []).some(
              (g) =>
                g.locked &&
                Math.abs(g.x - target.x) < 0.42 &&
                Math.abs(g.y - target.y) < 0.42,
            )
          )
            break;
        }
        const end = this.screen({
          x: origin.x + Math.cos(a) * r,
          y: origin.y + Math.sin(a) * r,
        });
        c.lineTo(end.x, end.y);
      }
      c.closePath();
      c.clip();
      const g = c.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        radius * 45 * this.zoom,
      );
      g.addColorStop(0, "rgba(0,0,0," + strength + ")");
      g.addColorStop(0.6, "rgba(0,0,0," + strength * 0.8 + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.restore();
    };
    fan(me, me.a, Math.PI, 1.75, 0.94);
    fan(me, me.a, 0.88, v.sabotageEndsAt > v.now ? 3 : 7.4, 0.96);
    for (const l of v.lamps || [])
      if (distance(l, me) < 11 && clear(this.map, me, l, v.gates))
        fan(l, 0, Math.PI, l.r, 0.8);
    c.globalCompositeOperation = "source-over";
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(this.light, 0, 0, w, h);
    this.ctx.restore();
  }
  minimap(v, me) {
    const canvas = document.getElementById("minimap"),
      c = canvas.getContext("2d"),
      n = this.map.length,
      s = Math.min(180 / n, 150 / n),
      ox = (180 - s * n) / 2,
      oy = (150 - s * n) / 2;
    c.fillStyle = "#0d1a22";
    c.fillRect(0, 0, 180, 150);
    for (const key of this.discovered) {
      const x = key % n,
        y = Math.floor(key / n);
      c.fillStyle = this.map[y][x] ? "#536b74" : "#263f4b";
      c.fillRect(ox + x * s, oy + y * s, s + 0.5, s + 0.5);
    }
    for (const p of v.terminals || []) {
      c.fillStyle = p.solved ? "#67aa8c" : "#c7a964";
      c.fillRect(ox + p.x * s - 1, oy + p.y * s - 1, 3, 3);
    }
    c.fillStyle = "#e0b369";
    c.beginPath();
    c.arc(ox + me.x * s, oy + me.y * s, 2.5, 0, TAU);
    c.fill();
    for (const p of v.players || [])
      if (p.id !== me.id) {
        c.fillStyle = p.team === 0 ? "#c67571" : "#7ab6d0";
        c.fillRect(ox + p.x * s - 1, oy + p.y * s - 1, 2, 2);
      }
  }
}
