# Test hisoboti · 2026-11-14

| Tekshiruv | Natija |
|---|---|
| `npm run check` | Syntax, 1000 quiz schema, 19 manba, 324 sprite hududi o‘tdi |
| `npm test` | 14/14: fizika, qurol, loot, terminal, privacy, rejim, map, AI, WS |
| `npm run test:e2e` | 9 browser check: mashq, E quiz, WASD+mouse+fire, shop/reload, screenshot, 2-client multiplayer, 390px, 0 console error |
| Render baseline | Chromium software headless, 1440×1000; 48–60 FPS kuzatildi; oxirgi sinov 48 FPS, mean 3.94 ms, p95 8.90 ms |
| `npm run test:load` | 20 WebSocket client, 15 monster, 30 Hz target / 15 Hz snapshot |
| Lokal server load | 6 s, 189 tick; mean 2.859 ms, max 20 ms, kamida 94 snapshot/client; 74 MB RSS |

Bu raqamlar tanlangan lokal testdagi o‘lchovlar. O‘zbekiston internetidagi latency/jitter, 30 daqiqalik soak, real Android va sinf kompyuteri profiling’i bilan tenglashtirmang. JSON hisobotlar qayta test paytida yangilanadi. Muayyan qo‘shimcha tekshiruvning o‘tishi master-briefdagi barcha production talablari yopildi degani emas.

Browser rasmlari: `screenshots/menu.png`, `gameplay.png`, `multiplayer.png`, `mobile.png`.

Live deploy tekshiruvi: Render `live`, `/health` 200; ikki tashqi browser client bir xonaga kirib match boshladi. `screenshots/live-server.png` shu jonli serverdan olingan. Tashqi browserda ikki tab bilan 21–30 FPS ham kuzatildi; 60 FPS faqat yuqoridagi lokal baseline natijasi.

Ochiq jumboq paytida o‘lim, reservation expiry va Escape’da barcha jonlarning tugashi alohida regression bilan tekshirildi. O‘limda terminal bandligi serverda bo‘shatiladi; eski quiz oynasi clientda yopiladi.
