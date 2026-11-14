# MAZE CLASH / Shadow Protocol 3.0

SysOne Academy uchun ishlaydigan **izometrik 2.5D tactical shooter**. X/Y o‘yin fizikasi, 2:1 izometrik pol, baland devorlar, oyoq nuqtasi bo‘yicha depth sorting va devor oldida cutaway. Grafik manba — foydalanuvchi bergan 19 ta original atlas va ulardan ishlab chiqilgan animatsiyalar.

**Jonli o‘yin:** https://maze-clash-shadow-protocol.onrender.com/

**Pull Request:** https://github.com/QobilbekOdilov21/minigame/pull/1

## Ishga tushirish

Node.js 22 yoki yangiroq:

```sh
npm ci
npm run build
npm start
```

`http://localhost:3000` ni oching. Boshqa qurilma shu serverning LAN manziliga kiradi. Internetda HTTPS/WSS ishlating. `PORT` (default 3000) va ixtiyoriy `ALLOWED_ORIGIN` environment qiymatlari mavjud.

**Mashqni boshlash** bir kishilik lokal o‘yinni Web Worker’da ochadi. Mashqda 1 800 kredit, rifle, yaqin terminal va sandiq bor. **Xona yaratish** va **Xonaga kirish** haqiqiy authoritative Node/WebSocket serveridan foydalanadi. Static/GitHub Pages clientida multiplayer uchun server manzilini kiriting; sahifa o‘zi backend host qilmaydi.

## Boshqaruv

| Tugma | Amal |
|---|---|
| WASD / strelkalar | Ekran yo‘nalishida yurish |
| Mouse + chap tugma | Nishon / ushlab otish |
| Shift | Sprint, stamina cheklangan |
| R / E | Reload / terminal, loot, eshik yoki maqsad |
| B / 1–6 | Arsenal / qurol tanlash |
| H / Q | Medkit / rejimning maxsus harakati |
| Tab / M | Reyting / Secret Agent yig‘ilishi |
| Esc | Oynani yopish |

Telefon: chap joystick; o‘ng E, R, otish. Mobil otish faqat server ochgan eng yaqin ko‘rinadigan raqibni nishonga oladi.

## Beshta rejim

| Rejim | Qoidalar |
|---|---|
| Team Clash | Qizil/ko‘k, data core faollashtirish/zararsizlantirish, 6 soniya buy phase |
| Free For All | Individual jang, jonlar yoki vaqt bo‘yicha g‘alaba |
| Secret Agent | Crew/traitor, IT vazifalar, yashirin hujum, yig‘ilish va ovoz |
| Maze Escape | 3 kod-parcha, terminallar, maxluqlar va chiqish |
| Double Agent | Jamoaviy jang, har jamoada yashirin agent va sabotaj |

Team/FFA kamida 2; Secret/Double kamida 4; Escape 1–30 qatnashchi. 20 qatnashchi 10v10, 21 qatnashchi 11v10. O‘yin vaqtida yangi odam kiritilmaydi; uzilgan qatnashchi o‘z tokeni bilan qayta ulanadi. Host uzilsa boshqaruv online qatnashchiga o‘tadi. Client faqat input/command beradi; HP, economy, hit, loot, quiz va visibility serverda tekshiriladi.

## Assetlar va animatsiya

- `art/source/` — yuklangan 19 ta JPEG manba; `art/generated/` — yangi operativ va maxluq yurish kadrlarining shaffof PNG manbalari.
- `npm run build:assets` — 324 hududni ajratadi, chetdan ulangan JPEG fonini alpha qiladi, 5 WebP atlasga joylaydi; `manifest.json` pivot, manba SHA-256, kadrlar va FPS ma’lumotlarini saqlaydi.
- Operativ: 8 yo‘nalish × 8 yurish kadri; idle, sprint, recoil/muzzle, reload progress va hit/death effektlari.
- 6 maxluq: 8 yurish kadri; hozir diagonal SE va oynalangan SW ko‘rinishlari. To‘liq 8 tomonli maxluq animatsiyasi hali yo‘q.
- Muhit: lampalar, terminal holatlari, generator bug‘i, ekran/indikatorlar, sandiq, pickup suzishi, VFX source-sequences. Statik devor/polga anatomik yurish animatsiyasi qo‘llanmaydi.
- Barcha manba rasmlar Asset arxivida ko‘rinadi. Har bir import qilingan region har matchda chizilmaydi: UI variantlari va alternativlar manifestda saqlanadi.

## Tekshiruv

```sh
npm run check       # syntax, 1000 quiz va atlaslar
npm test           # fizika, rejimlar, xavfsizlik, economy, ikki WS client
npm run test:e2e    # real Chromium: boshqaruv, quiz, reload, 2 browser, mobile
npm run test:load   # 20 client + 15 monster, 6 soniya
```

Natijalar: [docs/TEST_REPORT_UZ.md](docs/TEST_REPORT_UZ.md), [browser-results.json](docs/browser-results.json), [load-results.json](docs/load-results.json). Skrinshotlar `docs/screenshots/`da. 60 FPS tanlangan lokal test sahnasida o‘lchandi; barcha qurilma va internet ulanishi uchun kafolat emas.

## Arxitektura va joylash

`client/` — renderer, input, UI, network; `server/` — authoritative simulation, rooms, private savollar; `shared/` — ommaviy qurol/rejim konfiguratsiyasi; `tools/` — import/build/check; `legacy/` — avvalgi 2D versiyaning saqlangan nusxasi. Server HTTP allowlist orqali `server/`, legacy va savol javoblarini to‘g‘ridan-to‘g‘ri bermaydi. Lokal practice-worker savollarni o‘zida saqlaydi; u offline mashq bo‘lgani sababli uning javoblarini sir saqlash kafolati yo‘q. Multiplayer client savolning faqat matni va variantlarini oladi.

Server 30 Hz, snapshot 15 Hz, client local prediction + yumshoq reconciliation, remote interpolation. Rooms RAM’da: restart/deploy barcha matchlarni tugatadi. Render Free demo tarifi 15 daqiqa trafik bo‘lmasa uxlaydi; bu 24/7 production SLA emas. O‘yin kreditlari haqiqiy pul emas.

`main` yangilanmagan. Qabul qilinmaguncha rebuild branch va PR orqali ko‘rib chiqing. Master-briefning hali yopilmagan talablari [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)da ochiq ko‘rsatilgan.
