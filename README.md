# MAZE CLASH // Shadow Protocol

SysOne Academy uchun 2D top-down multiplayer labirint o'yini. Frontend **HTML, CSS, Canvas va JavaScript**, xonalar uchun **PeerJS (host-brauzer authoritative)** ishlatiladi. Real pulli to'lov, akkaunt yoki API kaliti talab qilinmaydi.

## O'yinni boshlash

**O'yin:** https://qobilbekodilov21.github.io/minigame/

1. O'qituvchi sahifani ochib **XONA YARATISH** ni bosadi, rejim, vaqt, hayot, raund va labirint hajmini tanlaydi.
2. Yaratilgan xona havolasini o'quvchilarga beradi.
3. O'quvchilar havoladan kirib, o'z ismlarini kiritadi.
4. Host **MATCHNI BOSHLASH** ni bosadi. Barcha mijozlar xaritani va o'zlariga ruxsat etilgan o'yin holatini oladi.
5. Host sahifasi ochiq va internetga ulangan bo'lishi shart.

## Rejimlar

- **TEAM CLASH:** 2 ta tengroq jamoa, qizillar / ko'klar, cheklangan o'q va data-core qurilmasi (E bilan o'rnatish/zararsizlantirish).
- **FREE FOR ALL:** hamma o'zi uchun, har bir o'yinchi turlicha rangda.
- **SECRET AGENT:** maxfiy xoin, jumboqli topshiriqlar, sabotaj, yig'ilish, chat, ovoz berish. Rejim kamida 4 o'yinchini talab qiladi va 1 jonli ishlaydi.
- **MAZE ESCAPE:** uchta kod-parcha topish, chiqish portaliga yetish.
- **DOUBLE AGENT:** 2 jamoa; har tomonda sirli xoin. Maxsus sabotaj qobiliyati mavjud.

## Mexanikalar

- Labirint match boshida seed asosida qayta hosil bo'ladi. Ko'rinish 7 katak atrofida, devorlar orti berkitilgan, server raqiblarni yashirishda filtr ishlatadi.
- Pistol, SMG, rifle, shotgun, sniper; magazin va zaxira o'qlar; otish tezligi, tarqalish, zarba kuchi, reload.
- Inventar do'koni: qurol, o'q, medkit, armor, scanner, smoke, stamina, master key.
- Kredit: dastlab beriladi, raqibni yengish, jumboq yechish va sandiqlardan topiladi.
- Raqib yo'q qilinganda qurol, qolgan patron va krediti tushgan loot sifatida olinadi.
- Mag'lubiyat: rangli kubchalarga parchalanish (canvas particle effects), qolgan jon bo'lsa qayta paydo bo'lish, aks holda spectator.
- Puzzles, eshik kalitlari, sirli terminallar, smoke va oxirgi daqiqadagi taxminiy radar.
- Mobil joystik, o't ochish, olish, reload, maxsus qobiliyat, yig'ilish tugmalari.

## Boshqaruv

| Tugma | Amal |
| --- | --- |
| W/A/S/D yoki strelkalar | Yurish |
| Shift | Tez yurish (stamina) |
| Sichqoncha + chap tugma | Nishonga olish va otish |
| R | Qayta o'qlash |
| E | Resursni olish / jumboq / qulf / data core / portal |
| B | Do'kon |
| 1–5 | Qurol almashtirish |
| H | Medkit ishlatish |
| Q | Maxsus qobiliyat (Secret / Double Agent) |
| M | Secret Agent yig'ilishi |
| Tab yoki Roster | Natijalar |

## Joylashtirish

Repository'ning `main` branchidagi `index.html`, `styles.css` va `game.js` fayllari GitHub Pages `/(root)` dan tarqatiladi. Hech qanday npm build talab qilinmaydi.

## Muhim cheklovlar

- **PeerJS ommaviy signaling xizmati** ishlatiladi. Host sahifasi yopilsa, match ishlamaydi. Bu **kichik yopiq guruhlar uchun sinov arxitekturasi**; 20–30 nafar o'quvchining barqaror online matchlari va haqiqiy server-side anti-cheat uchun alohida WebSocket game-server (masalan, Node.js + ws / Colyseus) zarur.
- PeerJS host ulanishi va Google Fonts uchun internet talab qilinadi. VPN/firewall yoki brauzer kengaytmalari WebRTCni bloklashi mumkin.
- Bu soddalashtirilgan brauzer o'yini, to'liq Counter-Strike yoki Among Us nusxasi emas. Ovozli chat, real multiplayer performance benchmark, akkauntlar, mukammal reconnect, to'liq anti-cheat va reytinglar serverda saqlanishi hozircha yo'q.
- Chatni faqat sinfingizdagi ishonchli o'quvchilar bilan ulashing. Ism va xabarlar serverdagi database'ga yozilmaydi.

---

© SysOne Academy. Original HTML5 browser game.