# MAZE CLASH // Shadow Protocol 2.0

**SysOne Academy** — 5-sinf o‘quvchilari uchun ko‘p o‘yinchili 2D tactical maze, shooter va IT jumboqlar platformasi.

## O‘ynash

- `https://qobilbekodilov21.github.io/minigame/`
- Host **XONA YARATISH** → rejim, vaqt, jonlar, raundlar, xarita, o‘q va **maxluqlar** sonini tanlaydi.
- Mehmonlar xona havolasini ochib ism kiritadi, host matchni boshlaydi.
- **Team Clash** (2 jamoa), **FFA**, **Secret Agent**, **Maze Escape**, **Double Agent**.

## Yangiliklar

- **Night-vision** kayfiyatidagi chizilgan 3D-ish devorlar, pol qoplamalari, chiroqlar va yoritilgan zonalar.
- O‘yinchi oldiga yo‘nalgan, devorlardan o‘tmaydigan **fonar konusi**; lampalar yonidagi dushmanlar ham ko‘rinadi.
- Mayda piksellardan yig‘ilgan ikki oyoqli, qo‘lli, qurol ushlagan **pixel-personaj**.
- **Mouse** kursori orqali nishonga olish va **chap tugmani ushlab otish**; boshqa joyga bosilganda otmaydi.
- `requestAnimationFrame` render, yengillashtirilgan canvas piksellari va 12-frame minimap intervali, ko‘rinish raycast keshlash va past aniqlikdagi yoritish maskasi; yuqorida **haqiqiy joriy FPS** ko‘rsatiladi. Maqsad 60 FPS, qurilma/ekranga qarab pasayishi mumkin.
- Qurol uchun aniq **SVG siluetlar** do‘konda va HUD’da, o‘q, reload, kredit, xarid, raqib loot va kubchalarga bo‘linish effektlari.
- **1 000 ta** offline, 4 variantli, 5-sinfga mos o‘zbekcha IT savollar: qurilmalar, xavfsizlik, Scratch, klaviatura, algoritm, ikkilik sanoq, fayllar, bit/bayt.
- **O‘yin savolni tekshiradi:** noto‘g‘rida yangi tasodifiy savol chiqadi (20 kredit jarima), to‘g‘rida **mukofot sandig‘i** tushadi. `[E]` bilan sandiqni oching va tasodifiy qurol/o‘q/zirh/kredit/medkit va boshqa resursni oling.
- Bitta match davomida oldingi savollar qayta chiqmasligi uchun markaziy savollar tarixidan foydalaniladi.
- **Maxluqlar:** o‘chirish / 4 ta / 8 ta / 15 ta. AI labirint bo‘ylab o‘yinchiga yaqinlashadi, hujum qiladi, o‘ldirilganda loot qoldiradi.

## Boshqaruv

| Amal | Kompyuter |
|---|---|
| Harakat | WASD yoki o‘q tugmalari |
| Nishon | Sichqoncha harakati |
| Otish | **Sichqoncha chap tugmasi** (ushlab turish) |
| Qayta o‘qlash | R |
| Interact / terminal / sandiq / loot | E |
| Do‘kon | B |
| Qo‘shimcha qobiliyat | Q |
| Medkit | H |
| Qurol tanlash | 1–5 |
| Hisob | Tab |
| Secret Agent yig‘ilishi | M |

Telefon: virtual joystick va ekrandagi tugmalar.

## Fayllar

- `index.html` — barcha ekranlar va semantik HTML.
- `styles.css` — moslashuvchan qorong‘i interfeys.
- `game.js` — host boshqaruvchi o‘yin dvigateli, vizual render va PeerJS multiplayer.
- `quiz-bank.js` — tekshirilgan **1000 ta** savollar bazasi.
- `build_questions.py` — savollar bazasini qayta yaratish uchun deterministik generator.

GitHub Pages statik hosting uchun. PeerJS Cloud signalizatsiya va brauzerlar orasida P2P aloqani ta’minlaydi. O‘qituvchi sahifani yopsa match tugaydi. Maktabning sust tarmog‘ida yoki NAT/firewall ortida ulanish ishlamasligi mumkin; 20–30 qurilmali barqaror o‘yin uchun WebSocket serveri va serverda o‘yin holati boshqaruvini tavsiya qilamiz.

Darsda ishlatish uchun sinfda avval 2 qurilma bilan sinovdan o‘tkazing. O‘yin ichidagi kreditlar haqiqiy pul emas.

## Performance patch / Mouse & 60 FPS

- Sichqoncha koordinatasi `pointermove` orqali ekranga nisbatan uzluksiz kuzatiladi; chap tugma otadi. WASD yurishda ham burilish qoladi.
- O‘qituvchi/host kamera va personaj holati endi tarmoq snapshotiga bog‘lanmagan; client harakati lokal silliqlanadi.
- Ko‘rish hisoblari keshlanadi; kafellar sprite keshga olinadi; yoritish canvasining ichki aniqligi adaptiv, ekrandagi tashqi o‘lcham o‘zgarmaydi.
- FPS past bo‘lsa, ichki render aniqligi avtomatik pasayadi. 60 FPS maqsad, kafolat emas (qurilma va tarmoq sharoitiga bog‘liq).