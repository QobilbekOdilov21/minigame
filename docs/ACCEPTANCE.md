# Acceptance / 2026-11-14

Bu PR ishlaydigan katta rebuild va sinov buildidir. Master-briefning har bir production talabi tugallangan deb belgilanmagan.

| Talab | Holat | Dalil yoki qolgan ish |
|---|---|---|
| Haqiqiy 2.5D izometrik sahna | Bajarildi | Projection/inverse, 2:1 floor, elevated walls, foot depth, cutaway |
| WASD + aim + held fire | Testdan o‘tdi | Chromium real input testi |
| Operativ 8-dir walk | Bajarildi | 64 yangi bitmap kadr |
| 6 maxluq animatsiyasi | Qisman | 48 yurish kadri, 2 diagonal yo‘nalish; 8-dir maxluq atlaslari qolgan |
| Barcha actionlar uchun anatomik atlas | Qisman | Walk/sprint bitmap, recoil/muzzle/bar/layer animatsiyasi; mustaqil 8-dir reload/interact/hit atlaslari qolgan |
| Yuklangan barcha assetlar | Import qilindi | 19 source, 324 regions; muqobil UI/skin rasmlari arxivda, hammasi har gameplay sahnasida chizilmaydi |
| Fonar, cheklangan LOS, devor soyasi | Bajarildi | Ray-clipped light mask va server visibility; normal-map shaderlar yo‘q |
| Limited ammo / shop / credits / loot | Testdan o‘tdi | Server mantiqi, buy phase, duplication himoyasi |
| Qonsiz cube death | Bajarildi | 24 ta z-gravity zarracha, low quality 12 |
| 1000 IT jumboq / RNG sandiq | Testdan o‘tdi | Schema, arithmetic, reservation, wrong/new ID, one-time reward |
| 5 rejim saqlanishi | Bajarildi | Mode victory regression; social to‘liq inson playtest’i qolgan |
| Barqaror server multiplayer | Demo | 2 brauzer / 20 WS client test; reconnect, host transfer; internet soak va packet loss testi qolgan |
| 20 player + 15 monsters | Lokal testdan o‘tdi | 6 sekundlik stress test; 30–60 daqiqa production soak qolgan |
| Prediction/reconciliation | Boshlang‘ich | Local collision prediction + soft correction; to‘liq acknowledged-input replay qolgan |
| Mobil | Smoke test | 390px overflow yo‘q, touch controls; real arzon Android test qolgan |
| Besh to‘liq biome | Qisman | Facility xonalari va import qilingan klass/med/server/storage; alohida sewer/street map campaign qolgan |
| UI/UX | Ishlaydi | Menu, config, lobby, shop, quiz, score, meeting, settings |
| Sound | Boshlang‘ich | Synth shot/hit/reward; yuzaga mos footsteps va original ambience sound pack qolgan |
| 60 FPS | Lokal test | 1440×1000 Chromium test; barcha GPU va sinf kompyuterlari uchun sertifikat emas |
| Production SLA va durable matches | Yo‘q | RAM room state, free-host uyqusi; restart matchni tugatadi |

Main’ga merge qilinmaydi. Ko‘rsatilgan qisman bandlar va real qurilma/internet sinovlari tugamasdan “professional production final” deb belgilamang.
