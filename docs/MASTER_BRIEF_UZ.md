# MAZE CLASH: SHADOW PROTOCOL — 2.5D REBUILD
## WORK MASTER BRIEF · Game Design Document + Technical Design + Asset Production Plan
**Versiya:** konsept v3.0 · **Sana:** 2026-11-14 · **Til:** O‘zbekcha (lotin)
**Egasi / ta’lim konteksti:** SysOne Academy · 5-sinf o‘quvchilari · maktabga mos, qonsiz va haddan tashqari vahimali bo‘lmagan stilizatsiya.
**Repository:** https://github.com/QobilbekOdilov21/minigame
**GitHub Pages (mavjud versiya):** https://qobilbekodilov21.github.io/minigame/
**Clone:** `git clone https://github.com/QobilbekOdilov21/minigame.git`
**Asosiy branch:** `main`; tavsiya etiladigan ishchi branch: `feat/maze-clash-2-5d-rebuild`.

> **Dastlabki muhim qoida:** Ushbu hujjat bajarilgan ishlar haqida hisobot emas. Bu — keyingi Work sessiyasiga beriladigan talablar va texnik topshiriq. GitHub’dagi hozirgi versiya 2D Canvas/P2P asosida; yangi 2.5D grafika, haqiqiy serverli multiplayer, to‘liq sprite pack va barqaror 60 FPS hali ishlab chiqilishi va sinovdan o‘tishi kerak.

---

## 1. Loyihaning maqsadi
MAZE CLASH — havola orqali ism bilan kiriladigan, do‘stlar/sinf bo‘lib o‘ynaladigan, **Alien Shooter ruhidagi izometrik 2.5D tactical maze-shooter**. Unda 2 jamoaga bo‘linib jang qilish, har kim har kimga qarshi o‘ynashi, yashirin rollar (Among Us tipidagi social deduction), maxluqlardan omon qolish, labirintdan chiqish va 5-sinfga mos IT jumboqlarini yechish birlashtiriladi. Maqsad — kuchli atmosferali, aniq o‘qilishi oson interfeysga ega, silliq ishlaydigan, **o‘ziga xos** o‘yin; mavjud tijoriy o‘yinlar aktivlari, personajlari, UI yoki kodlarini ko‘chirib bo‘lmaydi.

### Asosiy dizayn ustunlari
1. **Aniq va yoqimli shooter boshqaruvi:** WASD + mouse aim, chap tugma bilan otish, `R` reload, `E` interaction. Yurishda mouse qotib qolmasligi shart.
2. **2.5D chuqurlik:** 2D fizikada ishlaydigan 3D hissiyotli xona, devor, bino va sprite’lar; perspektiva yagona va barqaror.
3. **Qorong‘ilik — taktika:** atrof tabiiy qorong‘i; faqat fonar oldinga yoritadi; lampalar maydoni raqibni ochadi; devor ortidagi raqib ko‘rinmaydi.
4. **Har safar boshqacha match:** procedural labirint, turlicha spawn/loot/terminal/xavfli hududlar.
5. **Ta’lim va mukofot:** 1000 ta IT savolidan tasodifiy, takrorlanmasdan chiqarish, avtomatik javob tekshirish va tasodifiy sandiq mukofoti.
6. **Jamoa va ishonch o‘yini:** Team Clash, FFA, Secret Agent, Maze Escape, Double Agent.
7. **Foydalanuvchiga hurmat:** qonsiz kubchalar effekti, ortiqcha flicker/shake yo‘q, tushunarli o‘qilishi oson UI, mobil/zaif PC uchun sifat moslashuvi.

## 2. Hozirgi repository holati (2026-11-14 tekshirilgan)
| Fayl | Vazifasi | Hozirgi holat |
|---|---|---|
| `index.html` | Menyu, lobby, o‘yin HUD va boshqa ekranlar | Mavjud |
| `styles.css` | Responsive ko‘rinish | Mavjud |
| `game.js` | Canvas render, host-game simulation, otishma, yoritish, maxluqlar, PeerJS | Mavjud |
| `quiz-bank.js` | 5-sinf IT savollari ro‘yxati (1000 ta) | Mavjud |
| `build_questions.py` | Savollar bazasini yaratish skripti | Mavjud |
| `README.md` | Qo‘llanma va cheklovlar | Mavjud |

**Mavjud tizimga oid muhim cheklovlar:** host brauzeri o‘yin holatini boshqaradi; PeerJS orqali to‘g‘ridan-to‘g‘ri ulanish barcha tarmoqlarda ishonchli ishlamasligi mumkin; 60 FPS maqsadli, sertifikatlangan natija emas. Keyingi ish: eng avval kod va browser profiling, so‘ng bosqichma-bosqich migratsiya. `main` ustiga katta xom o‘zgarishni yozib yubormaslik.

## 3. Aniq 2.5D vizual arxitektura
### 3.1 Kamera va proyeksiya
- Maqsad: **izometrik / high-angle 3/4 view**, Alien Shooter’ga yaqin o‘qilishi oson tepachadan qarash.
- Gameplay **X/Y tekislik**da; chizishdagi ekranga proyeksiya `screenX=(x-y)*tileHalfWidth`, `screenY=(x+y)*tileHalfHeight - elevation` kabi izometrik transform orqali bo‘lishi mumkin. Buning teskari formulasi `mouse screen -> world` aim/hit target uchun kerak.
- Baza asset: **2:1 izometrik pol rombi**, tavsiya 128×64 px; devor/ob’ekt alohida vertikal balandlikka ega. Prototipda izometrik proyeksiya texnikoti tanlanadi va barcha assetlar SHU burchakka mos bo‘ladi.
- 3D chuqurlik illyuziyasi: personaj oyoq nuqtasiga qarab depth-sort, poydevor + baland devor, ob’ekt tashlagan yumshoq soya, devor orqasida fade/cutaway, polda refleksiya va normal-map yorug‘lik.
- Original screenshot 1:1 nusxalanmaydi. O‘yin art-direksiyasi mustaqil bo‘lishi kerak.

### 3.2 Environment / level design
**Besh joy moduli:**
1. **Industrial compound:** temir koridorlar, generator, konteyner, grating, kabellar, beton.
2. **Nocturnal streets:** asfalt, nam yo‘lak, fonar, yonib-o‘chuvchi kiosk chiroqlari, panjara, alley.
3. **Research laboratory:** server rack, ilmiy terminal, sovuq ko‘k yorug‘lik, xavf belgilar.
4. **Underground sewer / service tunnel:** tor yo‘lak, vent, ko‘prik, nam pol.
5. **Abandoned IT classroom:** kompyuter xonasi, monitorlar, axborot stendlari, IT jumboq terminallari.

Har bir modulda `floor`, `wall/back`, `wall/front`, `roof-cutaway`, `props low`, `props tall`, `collision`, `shadow/normal map`, `light source`, `interactables` qatlamlari bo‘lsin. Xonalar orasidagi eshiklar kamida ikki tomonga ochilish yoki ochiq/yopiq holatga ega bo‘lsin.

### 3.3 Chiroqlar, fonar va ko‘rinish
- **Barcha o‘yinchilarda fonar bor**; fonar atrofni butun doira qilib emas, faqat qahramon qaragan **oldingi konusni** yoritadi.
- Fonar mouse aim tomon buriladi; devorlarda fizik to‘xtaydi (line-of-sight raycast/shadow geometry).
- Ko‘cha lampalari, favqulodda qizil chiroqlar, terminal ko‘k-yashil nurlari va maxluq ko‘z nuri lokal shaffof yoritish yaratadi.
- Raqib faqat quyidagi shartlarda ko‘rsatiladi: jismoniy line-of-sight mavjud **VA** raqib yoritilgan hududda yoki juda yaqin masofada (sozlanadigan minimal xavfsiz visibility) bo‘lsa. FFA/Secret Agent’da ma’lumot oshkor qilmaslik rejimga bog‘liq.
- Devorda turgan/ortidagi raqib lampaga yaqin bo‘lsa ham avtomatik ochilmasin — devor har doim LOS to‘siq.
- Maxsus effekt: fonar batareyasi (host toggle), yengil flicker; fotosensitivlikni hisobga olib `reduced motion` va flickersiz rejim.
- Qorong‘ulik chiroyli bo‘lsin, lekin kichik yoshdagi o‘yinchi yo‘lini umuman yo‘qotmaydigan minimal kontrast, marker va navigation signallarini saqlasin.

## 4. Personajlar va animatsiya
- **3/4 top-down human silhouette**, blok emas: alohida bosh, tana, ikki qo‘l, ikki oyoq, jihozlar, ko‘krakdagi tactical detal, qo‘ldagi qurol.
- Baza ranglari o‘ta to‘yingan emas. Team Clash: ko‘k va qizil armband/yoritilgan marker; FFA: har xil rang + har birini farqlaydigan belgi; yashirin rol rangni oshkor qilmasin.
- Animatsiyalar: idle(4–6), walk(8), sprint(8), aim(4 yoki qatlamli skeletal), shoot(3–5), reload(6–8), hit(2–3), interact(6), death-cubeshatter(8–12) frame. **8 yo‘nalish** uchun (N/NE/E/SE/S/SW/W/NW) atlas yoki qurol/tana qatlamlarini ajratadigan tizim.
- Player `feet anchor`, qurol `hand anchor` va mos shadow sprite bo‘lsin. O‘q chiqish nuqtasi (muzzle socket) to‘g‘ri topilishi shart.
- **O‘lim effekti:** tanadan 10–30 ta pixel-kubcha sochiladi, yengil fizik gravitatsiya/air drag, qisqa fade; qonsiz, yoshga mos. Keraksiz kamera titrash yo‘q.
- Harakat/siluet o‘zgarishi FPS va tarmoq paketlariga bog‘lanmasin: state interpolation + animation clock.

## 5. Qurol, jang va economy
### Shooter
- Mouse aim + hold-to-fire, optional single fire; `WASD`/arrow movement; `Shift` sprint, `R` reload, `E` interaction, `B` shop, `1–5` weapon select, `H` medkit, `Q` skill, `Tab` scoreboard.
- Ishlab chiqish uchun **qurol sinflari**: pistol, SMG, rifle, shotgun, sniper, LMG; melee/knife, suppressor variant, throwable smoke/flash (yoshga mos vizual).
- Qurol atributlari: damage, fire rate, ammo mag/reserve, reload duration, spread/recoil, movement penalty, effective range, buy price, attachment slots. Ikki qurol bir-biridan faqat rang bilan emas, tashqi ko‘rinish va harakat bilan farqlansin.
- O‘q cheklangan: masalan rifle `30/90`. O‘q harakatlanish, zarba va qurol turi bo‘yicha serverda tekshiriladi.
- Zarba animatsiyasi: muzzle flash, tracer, shell casing, spark, impact decal, boshqariladigan recoil, qurol sadosi va ekran minimali feedback.

### Pul / do‘kon / loot
- Match ichidagi **faqat o‘yin valyutasi**; haqiqiy pul, real-money purchase va gambling yo‘q.
- Kredit manbai: raqibni yengish, maxluqni yo‘qotish, jumboq, match maqsadi, topilgan kasseta/terminal.
- Sotib olish: qurol, o‘q, zirh, medkit, qurol attachment, batareya, detector, maxsus kalit, jammer. Faqat rejim ruxsat etgan paytda yoki buy-zone’da.
- Mag‘lub raqib **loot bag** qoldiradi: qolgan o‘q, qurol, medkit va kreditning balanslangan qismi. Narx, og‘irlik va bo‘sh slotlar hisobga olinadi.
- Rarity: Common/Uncommon/Rare/Epic; qimmat predmetlar match natijasini nohaq buzmasin. G‘alaba uchun faqat qurol emas, puzzle va taktika ham ishlasin.
- Pulni xohlagancha “farm” qilishni cheklash (monster kill reward cap, spawn-camping jazosi, anti-duplication).

## 6. Jumboqlar / 1000 ta IT savoli
- Hozirgi `quiz-bank.js` saqlab audit qilinadi: **1000 savol**, barchasi o‘zbek lotinida, 4 ta variantli, 5-sinfga mos. Bir xil ma’no/javobli generatsiyalar ta’lim nuqtai nazaridan takror bo‘lmasligi uchun tekshiriladi.
- Yo‘nalishlar: qurilmalar (CPU, RAM, SSD, input/output), kompyuter xavfsizligi, brauzer/internet, fayllar/papkalar, Word/PowerPoint, Scratch, algoritm, klaviatura, mantiq, ikkilik sonlar.
- **Host savolni tekshirmaydi**: faqat serverdagi game logic `correct` indeksini tekshiradi. Client’ga to‘g‘ri javob oldindan yuborilmasin.
- O‘yinchi terminalga yaqinlashib `E` bosadi; bitta random savol va 4 variant ko‘rinadi.
- Noto‘g‘ri javob: o‘sha savol darhol yopiladi, darhol **boshqa random savol** chiqadi; shu matchda avval berilgan ID qaytmaydi; jarima bo‘lsa host sozlaydi (sinf uchun default jarimasiz tavsiya).
- To‘g‘ri javob: terminal faollashadi, sandiq ochish imkoniyati paydo bo‘ladi, ichidan RNG asosida pul, o‘q, zirh, medkit, qurol, kalit yoki ability chiqadi. RNG **server tomonidan** bajariladi, seed audit bo‘lishi mumkin.
- Bitta terminalda bir o‘yinchi boshlab turgan savol boshqasiga noto‘g‘ri ko‘rinmasin; rezervatsiya/cooldown mexanikasi; “terminal occupied” ko‘rsatiladi.
- 1000 savol tugasa qayta aylanish mexanikasi, avvalgi match takrorlariga qarshi seed. UI timer (masalan 30s) toggle, accessibility va yoshni hisobga oluvchi matn o‘lchami.

## 7. Maxluqlar / Zombie AI
- Host toggle: 0, 4, 8, 15 maxluq (keyinchalik turli miqdor va difficulty).
- Boshlang‘ich turlar: **Walker** (sekin), **Runner** (tez), **Brute** (ko‘p HP), **Shadow Stalker** (soyada ko‘proq), **Toxic** (zonali ta’sir), **Boss** (maxsus rejim).
- Behavior tree / FSM: patrol → hearing stimulus → investigate → chase → attack → search → return; tanlangan targetga `A*` + nav-grid; path recalculation interval va stuck detection.
- Monsterlar normal o‘yinchilardek oldindan barcha xonani bilmaydigan bo‘lsa yaxshiroq; devor, eshik, narvonsiz chiqishdan o‘ta olmasin.
- Monster yengilsa zararsiz particle death va reward bag; maxluqlar ko‘p bo‘lsa pathfinding va chizish o‘yin FPS’ini tushirmasligi shart.
- 5-sinf uchun ko‘rinish: sirli va qiziqarli, **gore yo‘q**, bezovta qiluvchi keskin ekran chaqnashi yo‘q.

## 8. O‘yin rejimlari
| Mode | Taqsimot | Match maqsadi | Maxsus qoidalar |
|---|---|---|---|
| Team Clash | Qizil vs Ko‘k, teng | Raund/match g‘alabasi, raqibni yo‘qotish yoki bomba maqsadi | buy-phase, qurol economy, defuse/plant, spectator |
| Free For All | Har kim alohida rang/belgi | Oxirigacha tirik qolish yoki kill limit | o‘zaro hujum, individual score |
| Secret Agent | Crew + yashirin traitor | Crew terminal vazifalari / traitor sabotaj | emergency meeting, ovoz berish, chat, yashirin role; to‘g‘ridan-to‘g‘ri doimiy shooter emas |
| Maze Escape | Solo/yoki kooperativ (host tanlovi) | Kalitlar va jumboqlardan keyin exit topish | maxluq xavfi, puzzle, vaqt limiti |
| Double Agent | Ikki jamoa ichida yashirin agent | Jang + aloqani buzish + ishonch | agent o‘z rolini yashiradi, buy-phase va sabotaj |

**Jamoa balansi:** 20 player = 10v10; 21 player kelsa host “10v10+spectator navbati” yoki “11v10 vaqtincha” tanlaydi. Avtomatik balans: hisob bo‘yicha emas, mavjud real qatnashuvchi bo‘yicha. Reconnect paytida jamoa ID saqlanadi.
**Raund:** `LOBBY → BUY PHASE → COUNTDOWN → ACTIVE → ROUND END → SCORE / MVP → NEXT ROUND → MATCH END`.
**Dead spectator:** o‘z jamoasi uchun kuzatuv rejimi; Secret Agent’da yashirin rolni yoki dushmanni oshkor qilmasin.

## 9. Host paneli va Lobby
- Room code + share link; nick kiritish, akkaunt shart emas; duplicate nickga `#2` suffix yoki unique player-id; bolalarning email/telefon ma’lumoti so‘ralmasin.
- Host sozlamalari: mode, match minutes, rounds, lives, map size/seed, monsters/difficulty, starting money, ammo mode, auto team balance, friendly fire, puzzle ON/OFF, flashlight battery ON/OFF, lamp density, spectator, invite-only/kick, reconnect limit.
- O‘yin boshlanganidan keyin muhim sozlamalar lock; sessiya yakunida qayta sozlash.
- UX: juda katta tab/qo‘pol neon emas; maktab kompyuteri va telefon uchun qisqa, ko‘rinarli, matnlari tushunarli. O‘zbek lotin asosiy til. UI ovoz va animatsiya o‘chirish opsiyasi.

## 10. UI / UX art-direction (AI-generated shablondek chiqmasin)
**Tactical industrial interface**: tekis mato/metal panellar, real grid chiziqlar, micro-labels, minimal tugmalar, sokin ranglar; tasodifiy gradient, ortiqcha glow, katta yumaloq “AI cards” yo‘q.
- Palette: deep petrol `#0D1416`, gunmetal `#192427`, concrete `#394549`, off-white `#DBE0D6`, burnt amber `#DFA653`, hazard red `#BD5650`, tactical cyan `#5CA6AE`.
- Typography: bir o‘qilishi yaxshi condensed display shrift + matn uchun normal sans + koordinata/o‘q uchun monospace. Matnlar haqiqiy ekran miqyosida 12–16pxdan past bo‘lmasin.
- **Main menu:** o‘yin logotipi, “Xona yaratish / Xonaga kirish”, rejim tanlash, settings, controls, changelog.
- **Lobby:** room code, players, red/blue team roster, ready-status, rules, host start, connection warning.
- **In-game HUD:** chap past HP/armor, o‘ng past weapon silhouette + ammo `30/90`, yuqorida timer/scores, minimap faqat ochilgan joy, kichik status/toast; FPS ko‘rsatkich developer mode’da.
- **Inventory/Shop:** barcha qurollar sprite ikonkalarda, narx/balans/mag ammo, keyboard bilan tez boshqarish, resurs kategoriyalari; looting view aniq.
- **Secret Agent:** rol intro karta qisqa, task progress, meeting/vote UI o‘qilishi aniq; ko‘rish mumkin bo‘lmagan ma’lumot backenddan yuborilmaydi.
- **Match end:** MVP, scoreboard, kill/death/assist, puzzle solved, monster eliminated, winner, rematch.
- **Accessibility:** motion/flicker reduction, contrast, scalable fonts, color+shape redundancy, mouse sensitivity, audio volume.

## 11. Asset production — bir xil uslub va geometriya
**Master art brief:** handcrafted-style high-fidelity pixel/sprite art; 3/4 isometric 2.5D tactical night-city, human proportions, detailed props, rough metal, wet concrete, lamps, stylized but grounded shadows; no watermark/text/painterly blur; transparent sprite background; no gore; **original IP**; all assets obey same camera and light angle.

| Asset guruhi | Talab etiladigan assetlar | Tavsiya qilingan ishlab chiqarish formati |
|---|---|---|
| Player base | 2 body types, red/blue/neutral, head/torso/arms/legs, backpack, flashlight | 96×128 source sprites; 8-dir atlases; feet pivot |
| Player animation | idle/walk/run/aim/shoot/reload/interact/die | 6–12 frame per motion, directional atlas + frame metadata |
| Monsters | walker, runner, brute, stalker, toxic, boss | 96×128 / boss 192×192; idle/chase/attack/hurt/death |
| Weapons | knife, pistol, suppressed pistol, SMG, rifle, shotgun, sniper, LMG, grenade | inventory icons 128×64, hand sprites with weapon pivot, ground pickups |
| World tiles | floor variants, wall/corners, door, road, grates, tile transition | 128×64 isometric base diamond; 3D-like wall cap/height |
| Architecture | corridors, lamps, vents, stair/elevation, storage, laboratory, sewer, ICT classroom | Tilemap atlases with foreground occlusion layers |
| Props | crates, barrels, shelves, server racks, monitors, desks, sandbags, generator, traffic barriers | Transparent 128×128 or multi-tile; collision outline |
| Loot | chest states, ammo types, medkit, armor, credit chip, keycard, battery, loot bag | 48–96px icons/sprites; closed/open states |
| Interaction | terminals, keypad, alarm, switch, security camera, power unit, bomb site markers | Idle/active/broken/success atlas |
| VFX | muzzle flash, tracers, hit sparks, smoke, flashlight dust, cubes, chest burst, explosion | 32–128px sprite atlas or GPU particle emitters |
| Lighting | warm street lamp, cool screen, red alarm, flashlight cone, soft shadows | shader data / normal maps / light masks; NOT fixed glow PNG only |
| UI | weapon silhouettes, health, armor, ammo, minimap symbols, ranks, chat/vote symbols | crisp SVG/PNG atlases, consistent stroke/scale |
| Sound | footsteps (surface-specific), gunshots, reload, monster, terminal, chest, ambient | short compressed audio; loudness normalized |

**Asset qoidalari:** devor/ray cast alohida collision; shaffof PNG yoki WebP; bir xil sprite pivot; atlas metadata (`frame`, `origin`, `hitbox`, `direction`, `animation`, `fps`); fon rasmlari alohida; har animatsiya orasida personaj anatomiyasi o‘zgarmasin. Sprite sheet va API kodning mos kelishini haqiqiy brauzer testida tekshirish shart.

**Asset yaratish ketma-ketligi**: 1) izometrik ground/wall test, 2) player 8-dir walk + mouse aim, 3) pistol/rifle atlas, 4) fonar/lamp shader, 5) walker monster, 6) loot/puzzle terminal, 7) qolgan 5 monster va to‘liq biomes, 8) polish.

## 12. Tavsiya etiladigan texnik yechim
### Frontend / rendering
- GitHub Pages’da deploy bo‘ladigan web client. **Phaser 4 + TypeScript** (o‘rganish/migratsiya testi bilan) yoki maxsus WebGL renderer. Phaser 4’da normal-map/dynamic lighting qo‘llanadi: https://phaser.io/news/2026/05/phaser-4-dynamic-lighting .
- Tilemapning izometrik qatlamlari (Tiled JSON), sprite atlas animation, Y-depth, lighting; sahna o‘yin fizikasi renderingdan ajratilgan.
- CSS/HTML: menyu, lobby, shop, responsive overlay. Gameplay Canvas/WebGL.
- Original JS kodi katta fayldan modulga bo‘linsin; hozirgi o‘yin mexanikalari audit qilinib migratsiya qilinsin.

### Multiplayer
- **Production: Node.js + WebSocket (`ws`)** authoritative match server, room-lobby-match lifecycle. Server harakat/collision, HP, ammo, loot, monster AI, puzzle answer, timer, visibility/LOS va reward’ni tekshiradi.
- **Client:** faqat input yuboradi; local player prediction + server reconciliation, remote interpolation/extrapolation limit.
- Simulatsiya: boshlang‘ich maqsad 30 tick/s; client renderer target 60 fps; snapshot: 10–20/s (profiling bilan). RTT/jitter/ping ko‘rsatkichlari; `interest management` faqat ko‘rinadigan hududni yuboradi.
- 20–30 player + 15 monster uchun profiling va load-test; buni kod yozish bilan avtomatik kafolatlangan deb hisoblamaslik.
- Reconnect token xona davomida amal qiladi, host o‘chsa dedicated server matchni tugatmaydi; rate limit/name sanitize/protocol validation.
- Static frontend GitHub Pages; backend uchun alohida host (Render/Fly/VPS va hokazo). Hosting’ni tanlashda WebSocket, sessiya davomiyligi, resurs va narx shartlari tekshirilsin; free backend uyquga ketishi mumkin.

### Muhandislik tarkibi (tavsiya)
```text
minigame/
  apps/
    client/
      public/assets/
        atlases/{players,monsters,weapons,environment,vfx,ui}/
        maps/ sound/
      src/
        scenes/{Boot,Menu,Lobby,Game,Results}.ts
        render/{IsoMap,DepthSort,Lighting,Visibility,Camera}.ts
        entities/{Player,Monster,Projectile,Chest,Terminal}.ts
        systems/{Input,Weapons,Inventory,Animation,Particles,HUD,Network}.ts
        ui/{Shop,Lobby,Settings,Puzzle,Meeting}.ts
    server/
      src/{index,rooms,net,simulation,modes,ai,quiz,loot,security}/
      tests/
  shared/
    protocol/ config/ types/
  tools/
    asset-manifest/ atlas-build/ map-validation/ quiz-validation/
  docs/
    GDD.md TECH_ARCH.md ART_BIBLE.md ACCEPTANCE.md
  .github/workflows/
```

### Ishlash tezligi va moslashuv
- 60 FPS = har kadr uchun ~16.7 ms budjet. `requestAnimationFrame`, fixed-step sim, vaqt cap, `delta` nazorati; barcha pointer event `pointermove` da faqat koordinatani yozadi, qimmat raycast/render u yerda qilinmaydi.
- **Harakat va mouse bir vaqtda:** target world coordinate inverse iso transform; camera bilan kadrlar aralashmasin; pointer lock ixtiyoriy, talab qilinmaydi.
- Statik devor/floor chunk bake, viewport culling, atlases/batching, particles pooling, shadow geometry and low-res light buffer, monster AI interval scheduling, sprite level-of-detail, browser performance panel profiling.
- Har bir sahifada modal ochilganda input reset; ikkilangan `requestAnimationFrame` loop yaratmaslik.
- `High / Medium / Low` sifat profillari; devicePixelRatio cap; past qurilmalarga 30 FPS fallback va yengilroq light/particle rejimi; ko‘zni charchatadigan flicker, head-bob, kuchli shake yo‘q.

## 13. Security / sinf sharoiti
- Nickname-only; yosh bolalarning ma’lumotlarini saqlamaslik, default public global chat yo‘q yoki host moderatsiya qiladi.
- Client to‘g‘ri savol indeksini, yashirin role va devor ortidagi raqib koordinatasini oldindan olmasin.
- Server-authoritative ammo/credits/loot/death; anti-spam, join limit, host kick/mute.
- Hech qanday real-money gamble, skin-box yoki pulli sandiq kerak emas. Tasodifiy sandiq faqat dars ichidagi o‘yin valyutasi bilan va ta’lim javobidan keladi.
- Maktab sharoitida keyboard/mouse + arzon Android ishlashini tekshirish.

## 14. Bosqichma-bosqich amalga oshirish rejasi
| Bosqich | Deliverable | Qabul sharti |
|---|---|---|
| **0. Audit & baseline** | repo audit, perf baseline, 2-player baseline, branch, test plan | mavjud feature ro‘yxati + xatolar; main ishlaydi |
| **1. 2.5D vertical slice** | 1 industrial xona, 1 player, 1 weapon, 1 zombie, lamp + flashlight | mouse+WASD birgalikda ishlaydi; devor occlusion va 60 fps test |
| **2. Art & animation** | player 8-dir anim, weapon/icon atlases, full starter tileset, cube death | bir xil proyeksiya, pivot, nomlash, hitbox |
| **3. Combat/inventory** | ammo, reload, shop, credits, loot, balance | o‘q yo‘qdan paydo bo‘lmaydi; loot duplication yo‘q |
| **4. Multiplayer server** | lobby, join, sync, movement prediction, score, reconnect | 2→10→20 player test; devor ortidagi enemy sync qilinmaydi |
| **5. Modes** | team, FFA, Secret, Escape, Double; CS-like defuse variant | har biri alohida mantiqiy test va HUD |
| **6. Puzzles/monsters** | 1000 quiz validation, RNG chest, 6 monster behavior | xato = yangi random; to‘g‘ri = loot, anti-duplication |
| **7. Polish & deployment** | full UI, ambience, settings, WebGL optimization, production deploy | perf/QA/report, README, deploy link, desktop/mobile smoke test |

## 15. Yakuniy qabul testlari (Definition of Done)
- [ ] 2.5D devor, pol, kamera va qurol/player perspektivasi mos va bir xil yo‘nalishda.
- [ ] 60 FPS target: tanlangan desktop baseline va 2-player local test bilan profiling; past qurilma uchun moslashuv. **Kafolatni testdan keyin aytish.**
- [ ] `WASD` bosib turganda `mouse move + left hold fire` hech qanday freeze/jitter bermaydi.
- [ ] Qurol `mag/reserve`, reload, shop kredit, kill loot va death cube effect ko‘rinadi.
- [ ] Fonar oldiga qaraydi, devor ortiga o‘tmaydi; lampa yonidagi enemy LOS bo‘lsa ko‘rinadi; hidden coordinates oshkor bo‘lmaydi.
- [ ] 1000 ta savol bazasi valid, bir matchda takrorlar nazorat qilinadi; xato bo‘lsa boshqa savol; to‘g‘ri bo‘lsa RNG chest.
- [ ] Host maxluq miqdorini va qiyinligini belgilaydi; 0 va 15 monster bilan sinov.
- [ ] 5 mode qoidalarida o‘yin tugashi/match draw/round tie/jamoa fairness to‘g‘ri.
- [ ] Join link, nick, reconnect, disconnect, spectator, match restart ishlaydi.
- [ ] Hud o‘qilishi, keyboard/mouse/mobil boshqaruv, sound/flicker/motion accessibility tekshirildi.
- [ ] Test va build ko‘rsatkichlari, ma’lum cheklovlar README’da yozildi; production link muvaffaqiyatli sinovdan o‘tdi.

## 16. Work uchun ko‘rsatma (paste-ready task)
**Repository:** https://github.com/QobilbekOdilov21/minigame

> Shu repository’ni GitHub connector orqali och, `main` branchni avval o‘qi va audit qil. Mavjud ishni buzma: yangi `feat/maze-clash-2-5d-rebuild` branchda ishlagin. Ilova bazasini Alien Shooter ruhidagi, lekin original grafikali izometrik **2.5D tactical shooter**ga migratsiya qil. Ushbu hujjatdagi full GDD, texnik arxitektura, art bible, barcha 5 game mode, 1000 savol, reward chest, monsters, unlimited modes, cheklangan ammo, credits/shop, enemy loot, 60 FPS target, mouse+WASD smooth, forward flashlight, lamppost lighting va cube-shatter death talablarini bajar. Ishni faqat tasviriy mockup bilan tugatma: real boshqariladigan gameplay va sinovdan o‘tgan deploy qilinadigan kod kerak. Dastlab audit va 2.5D vertical slice, so‘ng asset atlas, multiplayer server va mode’larni bosqichma-bosqich ishlab chiq; har bosqichda build/test, screenshot, perf profiling, changelog va aniq ishlagan/ishlamagan joylarni ko‘rsat. Main branchga merge qilishdan oldin testlar va foydalanuvchi tasdig‘ini ol. Menga tayyor PR, deploy URL, test natijalari va keyingi amaliy vazifani ber. Kerak bo‘lsa Render yoki boshqa server hostini tanlashdan oldin narx/cheklovlarni tekshir.

---
### Vizual referenslar va rasmiy texnik resurslar
- Original isometric shooter reference: https://store.steampowered.com/app/33100/Alien_Shooter_Last_Hope/ (faqat o‘yin mexanikasi/kamera ruhini o‘rganish uchun)
- Phaser 4 dynamic lighting: https://phaser.io/news/2026/05/phaser-4-dynamic-lighting
- Phaser tilemap: https://docs.phaser.io/api-documentation/class/tilemaps-tilemap
- GitHub: https://github.com/QobilbekOdilov21/minigame

**Mualliflik huquqi:** Alien Shooter, Counter-Strike va Among Us faqat janr va mexanika referensi. Ularning logotip, qahramon, dialog, kod, audio, sprite, rasm va xaritalarini ko‘chirmaslik; original aktivlar yaratish.
