/** Reproducible import pipeline: slice supplied JPEG boards, key only border-connected matte,
 * preserve opaque interior pixels, pack sprites and record provenance/pivots. */
const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  sharp = require("sharp");
const INPUT =
  process.env.MAZE_ASSET_INPUT || path.resolve(__dirname, "../art/source");
const OUT = path.resolve(__dirname, "../public/assets");
const sources = [
  ["logo", "8ndpnd8ndpnd8ndp (1)", [[60, 280, 1920, 590, "logo"]]],
  [
    "interface",
    "8ndpnd8ndpnd8ndp (2)",
    [
      [70, 75, 930, 275, "button"],
      [70, 370, 930, 280, "button-active"],
      [1090, 75, 900, 275, "button-gold"],
      [1080, 400, 910, 270, "button-red"],
      [1080, 1550, 210, 220, "settings"],
      [1300, 1550, 220, 220, "sound"],
      [1550, 1550, 220, 220, "back"],
      [1780, 1550, 220, 220, "close"],
    ],
  ],
  [
    "panels",
    "8ndpnd8ndpnd8ndp (3)",
    [
      [35, 35, 1150, 960, "panel"],
      [1200, 70, 820, 990, "inventory-panel"],
      [60, 1050, 1100, 320, "status-panel"],
      [1220, 1190, 770, 790, "scan-panel"],
    ],
  ],
  [
    "hud",
    "8ndpnd8ndpnd8ndp (4)",
    [
      [95, 105, 1090, 210, "health"],
      [95, 330, 1090, 210, "armor"],
      [95, 605, 515, 155, "ammo"],
      [820, 840, 640, 690, "radar"],
      [95, 1620, 1230, 340, "hotbar"],
    ],
  ],
  [
    "cursors",
    "8ndpnd8ndpnd8ndp (5)",
    [
      [80, 65, 430, 550, "pointer"],
      [610, 50, 370, 560, "hand"],
      [1090, 180, 330, 370, "reticle"],
      [1520, 120, 480, 460, "reticle-wide"],
      [55, 710, 640, 640, "reticle-ring"],
      [790, 710, 635, 640, "scope"],
      [1540, 800, 450, 460, "reject"],
    ],
  ],
  ["alley", "8ndpnd8ndpnd8ndp", [[0, 0, 2048, 1143, "alley"]]],
  ["classes", "y4l1aey4l1aey4l1 (1)", []],
  [
    "furniture",
    "y4l1aey4l1aey4l1 (2)",
    [
      [25, 25, 990, 700, "armory"],
      [1080, 25, 950, 700, "medical"],
      [25, 750, 990, 650, "server"],
      [1070, 730, 950, 730, "storage"],
      [80, 1450, 1250, 575, "classroom"],
      [1360, 1550, 600, 460, "workbench"],
    ],
  ],
  [
    "creatures",
    "y4l1aey4l1aey4l1 (3)",
    [
      [35, 750, 300, 550, "walker"],
      [340, 700, 370, 600, "brute"],
      [710, 700, 350, 600, "stalker"],
      [1050, 680, 270, 620, "toxic"],
      [1320, 750, 270, 550, "runner"],
      [1580, 570, 440, 730, "boss"],
    ],
  ],
  [
    "props",
    "y4l1aey4l1aey4l1 (4)",
    [
      [70, 60, 365, 1000, "lamp"],
      [490, 80, 420, 470, "crate"],
      [950, 80, 285, 460, "barrel"],
      [1280, 100, 700, 450, "sandbags"],
      [420, 580, 470, 530, "barrier"],
      [950, 560, 355, 605, "power"],
      [1380, 600, 600, 550, "generator"],
      [40, 1270, 360, 360, "camera"],
      [450, 1150, 720, 850, "door"],
      [1260, 1300, 730, 680, "vault"],
    ],
  ],
  [
    "lights",
    "y4l1aey4l1aey4l1 (5)",
    [
      [0, 40, 710, 800, "warm-light"],
      [735, 50, 295, 900, "beam"],
      [1100, 50, 480, 900, "beam-dust"],
      [1580, 40, 460, 900, "beam-broken"],
      [15, 1120, 700, 900, "alarm-light"],
      [710, 1130, 630, 870, "flood-light"],
      [1350, 1120, 690, 900, "toxic-light"],
    ],
  ],
  ["loot", "y4l1aey4l1aey4l1 (6)", []],
  ["teams", "y4l1aey4l1aey4l1 (7)", []],
  ["zombie-ui", "y4l1aey4l1aey4l1 (8)", []],
  [
    "interactions",
    "y4l1aey4l1aey4l1 (9)",
    [
      [130, 100, 750, 520, "chest"],
      [1160, 10, 720, 620, "chest-open"],
      [145, 650, 735, 525, "chest-rare"],
      [1170, 650, 730, 525, "chest-epic"],
      [145, 1210, 720, 760, "terminal"],
      [1150, 1210, 740, 760, "terminal-active"],
    ],
  ],
  ["tiles", "y4l1aey4l1aey4l1 (10)", []],
  [
    "weapons",
    "y4l1aey4l1aey4l1 (11)",
    [
      [80, 60, 570, 205, "knife"],
      [800, 65, 350, 250, "pistol"],
      [1320, 65, 650, 250, "silenced"],
      [75, 335, 825, 350, "rifle"],
      [1010, 400, 950, 220, "shotgun"],
      [50, 750, 980, 280, "sniper"],
      [1060, 710, 960, 405, "lmg"],
      [550, 1190, 280, 370, "grenade"],
      [980, 1190, 230, 370, "flash"],
      [1300, 1200, 220, 365, "smoke"],
      [110, 1660, 240, 340, "muzzle-0"],
      [480, 1650, 290, 350, "muzzle-1"],
      [820, 1690, 390, 290, "muzzle-2"],
      [1230, 1650, 385, 350, "muzzle-3"],
      [1630, 1640, 395, 360, "muzzle-4"],
    ],
  ],
  ["operative", "y4l1aey4l1aey4l1 (12)", []],
  ["effects", "y4l1aey4l1aey4l1", []],
];
const addGrid = (entry, cols, rows, rect, prefix) => {
  const [x, y, w, h] = rect;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      entry[2].push([
        Math.round(x + (c * w) / cols),
        Math.round(y + (r * h) / rows),
        Math.floor(w / cols),
        Math.floor(h / rows),
        prefix + "-" + r + "-" + c,
      ]);
};
addGrid(sources[6], 4, 3, [80, 50, 1900, 1490], "class");
addGrid(sources[6], 7, 1, [65, 1710, 1950, 300], "mode");
addGrid(sources[11], 4, 2, [40, 320, 1970, 1260], "item");
addGrid(sources[12], 6, 4, [40, 45, 1980, 1930], "team");
addGrid(sources[13], 5, 1, [40, 370, 1960, 560], "walker-motion");
addGrid(sources[13], 4, 3, [40, 1025, 1970, 1000], "symbol");
addGrid(sources[15], 4, 7, [0, 0, 1024, 1792], "floor");
addGrid(sources[15], 4, 4, [1024, 0, 1024, 2048], "architecture");
addGrid(sources[17], 12, 6, [5, 15, 2030, 1115], "original-motion");
addGrid(sources[18], 8, 8, [0, 200, 2048, 1848], "fx");
function matte(data, w, h) {
  const sample = [data[0], data[1], data[2]],
    seen = new Uint8Array(w * h),
    queue = new Uint32Array(w * h);
  let head = 0,
    tail = 0;
  const visit = (i) => {
    if (seen[i]) return;
    seen[i] = 1;
    const j = i * 4;
    if (
      Math.max(
        Math.abs(data[j] - sample[0]),
        Math.abs(data[j + 1] - sample[1]),
        Math.abs(data[j + 2] - sample[2]),
      ) < 24
    ) {
      queue[tail++] = i;
      data[j + 3] = 0;
    }
  };
  for (let x = 0; x < w; x++) {
    visit(x);
    visit((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    visit(y * w);
    visit(y * w + w - 1);
  }
  while (head < tail) {
    const i = queue[head++],
      x = i % w,
      y = Math.floor(i / w);
    if (x) visit(i - 1);
    if (x < w - 1) visit(i + 1);
    if (y) visit(i - w);
    if (y < h - 1) visit(i + w);
  }
  return data;
}
(async () => {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(path.join(OUT, "boards"), { recursive: true });
  const sprites = [],
    provenance = [];
  for (const [group, stem, rects] of sources) {
    const file = path.join(INPUT, "Gemini_Generated_Image_" + stem + ".jpeg"),
      buf = await fs.readFile(file);
    const board = "boards/" + group + ".webp";
    await sharp(buf)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(OUT, board));
    provenance.push({
      group,
      source: path.basename(file),
      sha256: crypto.createHash("sha256").update(buf).digest("hex"),
      board,
      regions: rects.length,
    });
    for (const [x, y, w, h, name] of rects) {
      const opaque = ["tiles", "alley", "lights", "effects"].includes(group);
      const { data, info } = await sharp(buf)
        .extract({ left: x, top: y, width: w, height: h })
        .resize({
          width: group === "alley" ? 1024 : 256,
          height: group === "alley" ? 572 : 256,
          fit: "inside",
        })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      if (!opaque) matte(data, info.width, info.height);
      let image = sharp(data, { raw: info });
      if (!opaque) image = image.trim({ threshold: 8 });
      const trimmed = await image.png().toBuffer();
      const meta = await sharp(trimmed).metadata();
      sprites.push({
        id: group + "/" + name,
        data: trimmed,
        w: meta.width,
        h: meta.height,
        opaque,
      });
    }
  }
  const frames = {},
    pages = [];
  let x = 2,
    y = 2,
    rowHeight = 0,
    page = 0,
    composites = [];
  async function flush() {
    const file = "atlas-" + page + ".webp";
    await sharp({
      create: {
        width: 2048,
        height: 2048,
        channels: 4,
        background: "#00000000",
      },
    })
      .composite(composites)
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(OUT, file));
    pages.push(file);
    composites = [];
    page++;
    x = 2;
    y = 2;
    rowHeight = 0;
  }
  for (const sp of sprites) {
    if (x + sp.w + 2 > 2048) {
      x = 2;
      y += rowHeight + 4;
      rowHeight = 0;
    }
    if (y + sp.h + 2 > 2048) await flush();
    composites.push({ input: sp.data, left: x, top: y });
    frames[sp.id] = {
      page,
      x,
      y,
      w: sp.w,
      h: sp.h,
      origin: [0.5, 1],
      collision: "world-grid",
      animation: sp.id.startsWith("effects/")
        ? "source-sequence"
        : sp.id.startsWith("operative/")
          ? "source-sequence"
          : "stateful",
    };
    x += sp.w + 4;
    rowHeight = Math.max(rowHeight, sp.h);
  }
  if (composites.length) await flush();
  for (const name of ["player", "monster"]) {
    const input = path.resolve(
      __dirname,
      "../art/generated",
      name + "-walk.png",
    );
    await sharp(input)
      .resize({ width: name === "player" ? 1536 : 1536 })
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(OUT, name + "-walk.webp"));
  }
  const manifest = {
    version: 1,
    pages,
    frames,
    sources: provenance,
    actors: {
      player: {
        file: "player-walk.webp",
        columns: 8,
        rows: 8,
        directions: ["E", "SE", "S", "SW", "W", "NW", "N", "NE"],
        fps: 12,
        origin: [0.5, 0.94],
      },
      monsters: {
        file: "monster-walk.webp",
        columns: 8,
        rows: 6,
        kinds: ["walker", "brute", "stalker", "toxic", "runner", "boss"],
        directions: ["SE", "SW-mirror"],
        fps: 10,
        origin: [0.5, 0.96],
      },
    },
    animations: {
      idle: { fps: 3, frames: [0, 1, 0, 2] },
      walk: { fps: 12, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
      sprint: { fps: 18, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
      shoot: { fps: 20, frames: [0, 1, 2], layer: "weapons/muzzle" },
      reload: { fps: 8, frames: [0, 1, 2, 3, 4, 5], method: "weapon-layer" },
      interact: { fps: 8, frames: [0, 1, 2, 3, 4, 5], method: "arm-layer" },
      hit: { fps: 15, frames: [0, 1], method: "tint" },
      death: { fps: 20, frames: 12, method: "24-cubes-physics" },
      props: { method: "state-machine + light/scan/steam animators" },
    },
  };
  await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
  console.log(
    "Imported",
    provenance.length,
    "boards;",
    sprites.length,
    "regions;",
    pages.length,
    "atlas pages",
  );
})();
