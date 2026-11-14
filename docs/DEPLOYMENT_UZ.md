# Jonli build

- O‘yin: https://maze-clash-shadow-protocol.onrender.com/
- WebSocket: wss://maze-clash-shadow-protocol.onrender.com/ws
- Sog‘liq tekshiruvi: https://maze-clash-shadow-protocol.onrender.com/health
- PR: https://github.com/QobilbekOdilov21/minigame/pull/1
- Branch: `feat/maze-clash-2-5d-rebuild`; `main` o‘zgarmagan.
- Runtime: Node, Frankfurt, Free, build `npm ci --omit=dev && npm run build`, start `npm start`.

Bir kishilik tez sinov uchun **Mashqni boshlash**. Do‘stlar bilan: **Xona yaratish**, kod/havolani ulashish, boshqalarda **Xonaga kirish**, hostda **Matchni boshlash**. Server maydoni jonli saytda avtomatik to‘ladi.

Bepul hosting demo uchun: 15 daqiqa trafik bo‘lmasa uxlaydi, keyingi kirishda uyg‘onadi. RAM’dagi xonalar restart/deployda tugaydi. Free tarif 24/7 production kafolati emas; hisobning umumiy bandwidth/build limitlari ham amal qiladi. Rasmiy shartlar: https://render.com/docs/free .

Deploy `live` holatiga yetgani, health 200 va ikki tashqi browserning bir xonada ishlashi tekshirildi. To‘liq internet soak, past quvvatli real Android va barcha 8-dir action atlaslari hali ochiq; `ACCEPTANCE.md`ni ko‘ring.
