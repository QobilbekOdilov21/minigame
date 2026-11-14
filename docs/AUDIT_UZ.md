# Dastlabki audit · 2026-11-14

Asos: `main` commit `c666bbe0daba4e12a3bbce6701a06dcdb6c56dc7`. Repository’ning barcha 6 manba fayli o‘qildi; `game.js` 569, `index.html` 120, `styles.css` 27, generator 221 qator edi. Kodning ko‘pi uzun bir qatorli funksiyalar edi.

| Topilma | Ta’sir va o‘zgarish |
|---|---|
| World, DOM, render va PeerJS bitta faylda | Server simulation va client modullarga ajratildi; legacy nusxa saqlandi |
| Brauzer hosti authoritative | Node/WebSocket 30 Hz server qo‘shildi |
| Canvas to‘g‘ri burchakli 2D tile render | 2:1 izometrik projection/inverse, baland devor, depth order, cutaway |
| `quiz-bank.js` to‘g‘ri javoblarni har clientga yuklaydi | Multiplayer quiz javobi serverda; individual savol event orqali yuboriladi |
| Target event ko‘rish shartidan o‘tib begona clientga chiqishi mumkin | Target event faqat o‘z recipientiga yuboriladi |
| Haqiqiy spectator butun xaritani ko‘radi | Dead team spectator tirik jamoadoshning LOS’iga bog‘landi |
| Bullet collision eshiklarni hisobga olmaydi | Har substepda devor, yopiq eshik va solid prop collision |
| Terminal bandligi va eski javob tokeni tekshirilmaydi | 45 s reservation, savol ID va masofa/LOS tekshiruvi |
| Loot funksiyasini takror chaqirish imkoni | World drop ro‘yxati tekshiriladi; o‘limda jihoz transferi bir marta |
| Bir xil vaziyat va shortcut qayta yozilgan | Takroriy sarlavha variantlari kamaytirildi, 1000 savol qayta yaratildi |
| Faqat ikki monster turi | 6 tur, hearing/LOS acquisition, chase/search/patrol/attack |
| Test/CI/package yo‘q | Unit, protocol, browser, load test va CI qo‘shildi |

Avvalgi 2D versiyaning barqaror 60 FPS va haqiqiy 2-device internet baseline’i ushbu muhitda oldindan o‘lchanmagan. Oldingi README’dagi maqsadlar o‘lchangan natija sifatida qabul qilinmadi.
