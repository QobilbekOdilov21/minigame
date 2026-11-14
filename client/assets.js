export class Assets {
  async load() {
    this.manifest = await fetch(
      new URL("../public/assets/manifest.json", import.meta.url),
    ).then((r) => r.json());
    this.pages = await Promise.all(
      this.manifest.pages.map((p) => this.image(p)),
    );
    [this.player, this.monster] = await Promise.all([
      this.image("player-walk.webp"),
      this.image("monster-walk.webp"),
    ]);
    return this;
  }
  image(file) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("Asset yuklanmadi: " + file));
      im.src = new URL("../public/assets/" + file, import.meta.url).href;
    });
  }
  sprite(ctx, id, x, y, height, alpha = 1, flip = false, rotation = 0) {
    const f = this.manifest.frames[id];
    if (!f) return false;
    const width = (height * f.w) / f.h;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(
      this.pages[f.page],
      f.x,
      f.y,
      f.w,
      f.h,
      -width / 2,
      -height,
      width,
      height,
    );
    ctx.restore();
    return true;
  }
  actor(ctx, type, row, frame, x, y, size, flip = false) {
    const img = type === "player" ? this.player : this.monster;
    const cols = 8,
      rows = type === "player" ? 8 : 6,
      w = img.width / cols,
      h = img.height / rows;
    const width = (size * w) / h;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      Math.floor(frame % 8) * w,
      row * h,
      w,
      h,
      -width / 2,
      -size * 0.94,
      width,
      size,
    );
    ctx.restore();
  }
  texture(id) {
    const f = this.manifest.frames[id];
    const c = document.createElement("canvas");
    c.width = f.w;
    c.height = f.h;
    c.getContext("2d").drawImage(
      this.pages[f.page],
      f.x,
      f.y,
      f.w,
      f.h,
      0,
      0,
      f.w,
      f.h,
    );
    return c;
  }
}
