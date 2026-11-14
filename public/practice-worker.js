"use strict";
const randomUUID=()=>crypto.randomUUID();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const uid = () => randomUUID();
const colorFor = (i) => `hsl(${(i * 137.508 + 32) % 360} 62% 65%)`;
function hash(x, y, seed = 0) {
  let n =
    (Math.imul(x + 13, 374761393) + Math.imul(y + 17, 668265263) + seed) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}
const QUIZZES=[{"q":"Scratch spriti x=-4 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["0","1","-9","2"],"correct":1},{"q":"Scratch spriti x=-2 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["0","1","-1","-4"],"correct":0},{"q":"Scratch: mushuk “repeat 4” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["9","15","20","25"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 11011 soni o‘nlikda nechaga teng?","a":["30","29","28","27"],"correct":3},{"q":"Robot “6 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["30","36","12","37"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 19, 29, 39, ... Keyingi sonni toping.","a":["59","39","49","50"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 15, 20, 25, ... Keyingi sonni toping.","a":["25","35","30","31"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 11111 soni o‘nlikda nechaga teng?","a":["34","33","32","31"],"correct":3},{"q":"Robot “8 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["32","40","41","13"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 21, 28, 35, ... Keyingi sonni toping.","a":["35","43","49","42"],"correct":3},{"q":"Scratch: mushuk “repeat 8” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["14","42","48","54"],"correct":2},{"q":"Scratch: “repeat 10” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["15","55","45","50"],"correct":3},{"q":"Linux nima?","a":["Operatsion tizim","Printer kabeli","Brauzer paroli","Rasm formati"],"correct":0},{"q":"Scratch: “repeat 11” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["84","18","77","70"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 6, 8, 10, ... Keyingi sonni toping.","a":["13","12","14","10"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["112","22","80","96"],"correct":3},{"q":"Scratch: mushuk “repeat 4” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["33","15","44","55"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 7, 9, 11, ... Keyingi sonni toping.","a":["14","11","15","13"],"correct":3},{"q":"27 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11101","11110","11100","11011"],"correct":3},{"q":"7 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1000","1001","1010","111"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 5, 9, 13, ... Keyingi sonni toping.","a":["18","17","13","21"],"correct":1},{"q":"Scratch: “repeat 8” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["49","15","63","56"],"correct":3},{"q":"Veb-sahifani qaysi dastur ochadi?","a":["Kalkulyator","Arxivator","Brauzer","Paint"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["12","9","24","18"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 7, 18, 29, ... Keyingi sonni toping.","a":["41","40","29","51"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 1 soni o‘nlikda nechaga teng?","a":["2","4","3","1"],"correct":3},{"q":"20 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["152","168","80","160"],"correct":3},{"q":"Scratch spriti x=1 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["10","9","11","-8"],"correct":0},{"q":"38 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100110","100111","101000","101001"],"correct":0},{"q":"15 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10001","10010","10000","1111"],"correct":3},{"q":"Scratch: mushuk “repeat 3” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["19","64","32","48"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 15, 24, 33, ... Keyingi sonni toping.","a":["43","33","51","42"],"correct":3},{"q":"Scratch spriti x=4 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["1","8","7","6"],"correct":2},{"q":"Scratch spriti x=-5 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["-3","-1","-8","-2"],"correct":3},{"q":"Kompyuterda vaqtincha ishlovchi tezkor xotira nima?","a":["Kolonka","Monitor","Printer","RAM"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 23, 33, 43, ... Keyingi sonni toping.","a":["43","54","63","53"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["18","65","52","78"],"correct":1},{"q":"Xabar yuborishdan oldin nimani tekshiramiz?","a":["Faqat quvvat tugmasini","Qabul qiluvchi va matnni","Faqat ovoz balandligini","Faqat fon rangini"],"correct":1},{"q":"Klaviaturada Ctrl + X tugmalari odatda nima qiladi?","a":["Faylni ochish","Qidirish","Oxirgi amalni bekor qilish","Kesib olish"],"correct":3},{"q":"Vaziyat 1: Internetda bir xabar juda g‘alati ko‘rindi. Qaysi ish to‘g‘ri?","a":["Bir nechta ishonchli manbadan tekshirish","Hammaga tarqatish","Darhol ishonish","Faqat rasmga qarash"],"correct":0},{"q":"Scratch spriti x=-1 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["9","7","-10","8"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 5, 13, 21, ... Keyingi sonni toping.","a":["30","29","37","21"],"correct":1},{"q":"Scratch spriti x=-5 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["-13","3","4","2"],"correct":1},{"q":"Xato (bug) nima?","a":["Yangi fayl","Dasturdagi noto‘g‘ri ishlash","Internet manzil","Printer siyohi"],"correct":1},{"q":"Scratch spriti x=2 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["11","12","13","-8"],"correct":1},{"q":"Scratch: mushuk “repeat 12” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["117","21","99","108"],"correct":3},{"q":"Scratch spriti x=1 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["-2","3","4","5"],"correct":2},{"q":"Scratch: “repeat 10” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["80","72","18","88"],"correct":0},{"q":"47 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["368","384","376","188"],"correct":2},{"q":"7 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["48","64","28","56"],"correct":3},{"q":"Ikki bosqichli tasdiqlash nimaga yordam beradi?","a":["Monitorni kattalashtiradi","Klaviaturani yoqadi","Internetni tezlashtiradi","Hisob xavfsizligini oshiradi"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 1011 soni o‘nlikda nechaga teng?","a":["11","14","12","13"],"correct":0},{"q":"Scratch: mushuk “repeat 2” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["9","27","11","18"],"correct":3},{"q":"Scratch: mushuk “repeat 11” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["88","19","96","80"],"correct":0},{"q":"“dars.pptx” faylini ko‘rsangiz, uning turi nima?","a":["PowerPoint taqdimoti","Ovoz","Rasm","Excel jadvali"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 21, 25, 29, ... Keyingi sonni toping.","a":["29","37","33","34"],"correct":2},{"q":"Robot “7 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["14","42","50","49"],"correct":3},{"q":"Qaysi qurilma kiritish qurilmasi?","a":["Printer","Skaner","Kolonka","Proyektor"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["135","105","120","23"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 12, 20, 28, ... Keyingi sonni toping.","a":["37","44","36","28"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 6, 13, 20, ... Keyingi sonni toping.","a":["20","27","34","28"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 10, 19, 28, ... Keyingi sonni toping.","a":["46","28","38","37"],"correct":3},{"q":".xlsx kengaytmasi qaysi hujjatga mos?","a":["Ovoz yozuvi","Rasm","Arxiv","Elektron jadval"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 2, 13, 24, ... Keyingi sonni toping.","a":["24","35","46","36"],"correct":1},{"q":"Scratch: mushuk “repeat 4” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["70","42","18","56"],"correct":3},{"q":"Scratch: mushuk “repeat 3” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["16","32","24","11"],"correct":2},{"q":".docx kengaytmali fayl ko‘pincha nima?","a":["Matn hujjati","Ovoz","Rasm","Internet manzil"],"correct":0},{"q":"41 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101100","101001","101011","101010"],"correct":1},{"q":"Katta harflarni doimiy yoqadigan tugma qaysi?","a":["Caps Lock","Delete","Tab","Backspace"],"correct":0},{"q":"Scratch: mushuk “repeat 9” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["90","19","100","80"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 5, 14, 23, ... Keyingi sonni toping.","a":["23","32","41","33"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["6","12","8","18"],"correct":1},{"q":"Robot “5 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["26","20","10","25"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 21, 32, 43, ... Keyingi sonni toping.","a":["65","54","55","43"],"correct":1},{"q":"44 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101100","101111","101110","101101"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 22, 31, 40, ... Keyingi sonni toping.","a":["40","49","50","58"],"correct":1},{"q":"88 bit axborot necha bayt bo‘ladi?","a":["11","22","12","13"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 9, 17, 25, ... Keyingi sonni toping.","a":["34","25","41","33"],"correct":3},{"q":"Scratch: “repeat 3” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["4","5","6","8"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 12, 15, 18, ... Keyingi sonni toping.","a":["18","24","22","21"],"correct":3},{"q":"Raqamli iz nima?","a":["Qog‘ozdagi oyoq izi","Monitor ustidagi chang","Printer turi","Internetdagi faoliyatdan qolgan ma’lumotlar"],"correct":3},{"q":"Scratch spriti x=2 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["12","11","10","-7"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["35","30","11","25"],"correct":1},{"q":"14 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["56","112","120","104"],"correct":1},{"q":"Scratch spriti x=4 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["8","9","-1","10"],"correct":1},{"q":"Robot “2 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["8","13","12","10"],"correct":2},{"q":"Scratch spriti x=1 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["8","10","9","-7"],"correct":2},{"q":"“dars.png” faylini ko‘rsangiz, uning turi nima?","a":["PDF hujjat","Rasm","Oddiy matn","Animatsiyali rasm"],"correct":1},{"q":"Scratch: “repeat 3” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["27","36","12","18"],"correct":0},{"q":"Brauzerda yangi yorliq (tab) nimaga kerak?","a":["Printer tanlash","Boshqa sahifani alohida ochish","Kompyuterni qayta o‘rnatish","Klaviaturani yoqish"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 0 soni o‘nlikda nechaga teng?","a":["1","0","3","2"],"correct":1},{"q":"“dars.mp3” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Oddiy matn","Ovoz","PDF hujjat"],"correct":2},{"q":"Matn kiritish uchun qaysi qurilmadan foydalanamiz?","a":["Monitor","Printer","Klaviatura","Kolonka"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 14, 21, 28, ... Keyingi sonni toping.","a":["28","35","36","42"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 10110 soni o‘nlikda nechaga teng?","a":["23","24","22","25"],"correct":2},{"q":"Scratch: mushuk “repeat 10” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["150","165","135","25"],"correct":0},{"q":"Robot “7 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["14","10","21","22"],"correct":2},{"q":"Scratch spriti x=-1 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["0","-3","1","2"],"correct":2},{"q":"Shubhali faylni yuklab olish kerakmi?","a":["Hammaga ulashish kerak","Darhol ochish kerak","Yo‘q, avval manbani tekshirish kerak","Ha, doim"],"correct":2},{"q":"Scratch: “repeat 2” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","24","8","10"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 11 soni o‘nlikda nechaga teng?","a":["5","3","6","4"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 22, 26, 30, ... Keyingi sonni toping.","a":["30","38","34","35"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 22, 24, 26, ... Keyingi sonni toping.","a":["30","26","28","29"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["90","120","105","22"],"correct":2},{"q":"49 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["110001","110100","110010","110011"],"correct":0},{"q":"Scratch: mushuk “repeat 10” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["21","99","121","110"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 12, 18, 24, ... Keyingi sonni toping.","a":["24","36","30","31"],"correct":2},{"q":"Robot “3 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["30","33","34","14"],"correct":1},{"q":"Scratch: mushuk “repeat 3” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["27","12","18","36"],"correct":0},{"q":"Scratch: “repeat 5” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","24","9","20"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 22, 24, ... Keyingi sonni toping.","a":["27","26","24","28"],"correct":1},{"q":"“dars.docx” faylini ko‘rsangiz, uning turi nima?","a":["PowerPoint taqdimoti","Ovoz","Word hujjati","Rasm"],"correct":2},{"q":"Yangi qatorga o‘tish uchun qaysi tugma?","a":["Alt","Enter","Ctrl","Shift"],"correct":1},{"q":"Scratch spriti x=2 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["7","6","-3","8"],"correct":0},{"q":"Scratch: mushuk “repeat 12” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["132","23","121","143"],"correct":0},{"q":"15 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["112","60","120","128"],"correct":2},{"q":"Scratch spriti x=3 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["14","12","13","-7"],"correct":2},{"q":"Qaysi qurilma chiqish qurilmasi?","a":["Mikrofon","Sichqoncha","Klaviatura","Monitor"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 29, 38, ... Keyingi sonni toping.","a":["48","47","38","56"],"correct":1},{"q":"Scratch: mushuk “repeat 12” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["48","44","52","16"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 5, 12, 19, ... Keyingi sonni toping.","a":["26","33","19","27"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 2, 7, 12, ... Keyingi sonni toping.","a":["12","22","17","18"],"correct":2},{"q":"Bir martalik katta harf uchun qaysi tugmani bosib turish mumkin?","a":["Ctrl","Shift","Esc","Tab"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 13, 15, 17, ... Keyingi sonni toping.","a":["20","21","17","19"],"correct":3},{"q":"Scratch: “repeat 5” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["10","12","8","7"],"correct":0},{"q":".pptx kengaytmasi qaysi fayl turiga mos?","a":["Video","Rasm","Ovoz","Taqdimot"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 23, 28, 33, ... Keyingi sonni toping.","a":["39","38","33","43"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 14, 16, 18, ... Keyingi sonni toping.","a":["20","18","21","22"],"correct":0},{"q":"Scratch: mushuk “repeat 7” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["14","9","16","12"],"correct":0},{"q":"Scratch: mushuk “repeat 3” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["13","40","30","20"],"correct":2},{"q":"80 bit axborot necha bayt bo‘ladi?","a":["12","11","10","20"],"correct":2},{"q":"Scratch spriti x=-5 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["0","1","-10","-1"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 10101 soni o‘nlikda nechaga teng?","a":["22","23","24","21"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 14, 24, 34, ... Keyingi sonni toping.","a":["45","34","54","44"],"correct":3},{"q":"8 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["56","72","64","32"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 5, 15, 25, ... Keyingi sonni toping.","a":["45","36","35","25"],"correct":2},{"q":"Vaziyat 1: Internetda kimgadir uy manzilingiz kerak ekan. Qaysi ish to‘g‘ri?","a":["Telefon raqam ham berish","Xaritadan uy ko‘rsatish","Manzilni yozish","Kattalar bilan maslahatlashish"],"correct":3},{"q":"Scratch spriti x=-3 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["-1","-2","-4","-3"],"correct":1},{"q":"Scratch spriti x=-2 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["7","8","-12","9"],"correct":1},{"q":"Scratch spriti x=-5 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["-3","-7","-4","-2"],"correct":0},{"q":"Scratch: mushuk “repeat 9” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["21","96","108","120"],"correct":2},{"q":"Scratch: “repeat 3” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","8","7","12"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 10001 soni o‘nlikda nechaga teng?","a":["19","20","17","18"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 100101 soni o‘nlikda nechaga teng?","a":["39","38","40","37"],"correct":3},{"q":"Kolonka nima chiqaradi?","a":["Skan","Ovoz","Matn kodi","Qog‘oz"],"correct":1},{"q":"Scratch: mushuk “repeat 11” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["150","165","26","180"],"correct":1},{"q":"272 bit axborot necha bayt bo‘ladi?","a":["68","35","36","34"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 23, 32, 41, ... Keyingi sonni toping.","a":["59","50","41","51"],"correct":1},{"q":"Scratch: “repeat 5” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["54","36","14","45"],"correct":3},{"q":"Scratch: mushuk “repeat 9” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["64","80","72","17"],"correct":2},{"q":"Qaysi format ko‘pincha rasm uchun ishlatiladi?","a":["MP4","WAV","MP3","JPEG"],"correct":3},{"q":"Kompyuterdan uzoq foydalanganda nima qilish foydali?","a":["Vaqti-vaqti bilan tanaffus qilish","Chiroqni o‘chirib o‘tirish","Ekranni yanada yaqinlashtirish","Doim ekranga tikilish"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 17, 20, 23, ... Keyingi sonni toping.","a":["27","29","23","26"],"correct":3},{"q":"Klaviaturada Ctrl + R tugmalari odatda nima qiladi?","a":["Kesib olish","Sahifani yangilash","Hammasini tanlash","Matnni qalin qilish"],"correct":1},{"q":"Robot “7 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["56","57","15","49"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 15, 23, 31, ... Keyingi sonni toping.","a":["47","31","40","39"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 13, 19, 25, ... Keyingi sonni toping.","a":["25","37","31","32"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 2, 10, 18, ... Keyingi sonni toping.","a":["26","34","27","18"],"correct":0},{"q":"4 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["40","16","24","32"],"correct":3},{"q":"Scratch spriti x=-1 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["-8","7","6","5"],"correct":2},{"q":"Scratch: “repeat 9” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["40","50","14","45"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["30","36","11","24"],"correct":0},{"q":"Scratch spriti x=-2 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["-9","5","4","6"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 12, 16, 20, ... Keyingi sonni toping.","a":["28","25","20","24"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 18, 23, 28, ... Keyingi sonni toping.","a":["34","38","28","33"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 21, 24, 27, ... Keyingi sonni toping.","a":["30","33","31","27"],"correct":0},{"q":"Robot “5 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["25","31","30","11"],"correct":2},{"q":"Scratch spriti x=-1 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["5","4","-6","3"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["30","45","17","15"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 1, 4, 7, ... Keyingi sonni toping.","a":["7","11","10","13"],"correct":2},{"q":"Kuchli parolga qaysi misol mos?","a":["123456","password","Uzun va noyob parol","ismim"],"correct":2},{"q":"Scratch: mushuk “repeat 6” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["40","56","14","48"],"correct":3},{"q":"248 bit axborot necha bayt bo‘ladi?","a":["31","33","62","32"],"correct":0},{"q":"Scratch: “repeat 5” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["18","15","12","8"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 100010 soni o‘nlikda nechaga teng?","a":["37","34","35","36"],"correct":1},{"q":"Scratch spriti x=3 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["0","5","7","6"],"correct":3},{"q":"Scratch: “repeat 8” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","72","56","64"],"correct":3},{"q":"Scratch spriti x=-1 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["9","-11","8","10"],"correct":0},{"q":"“dars.js” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Ovoz","JavaScript kodi","Excel jadvali"],"correct":2},{"q":"Scratch spriti x=3 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["11","10","9","-4"],"correct":1},{"q":"Scratch: mushuk “repeat 4” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["13","27","36","45"],"correct":2},{"q":"23 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11000","11001","10111","11010"],"correct":2},{"q":"Scratch: “repeat 7” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["42","48","36","13"],"correct":0},{"q":"6 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["111","1001","1000","110"],"correct":3},{"q":"Scratch: mushuk “repeat 11” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["50","16","60","55"],"correct":3},{"q":"136 bit axborot necha bayt bo‘ladi?","a":["17","34","19","18"],"correct":0},{"q":"Word dasturi asosan nimaga xizmat qiladi?","a":["Matnli hujjat yaratish","Musiqa bastalash","3D o‘yin","Video montaj"],"correct":0},{"q":"Robot “8 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["72","73","17","64"],"correct":0},{"q":"Scratch: “repeat 11” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["108","99","20","90"],"correct":1},{"q":"Fayl nomidagi .mp3 nimaga tegishli?","a":["Ovoz","Rasm","Veb-sahifa","Jadval"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 8, 16, 24, ... Keyingi sonni toping.","a":["33","40","24","32"],"correct":3},{"q":"Debugging nimaga kerak?","a":["Printer ulash","Kompyuterni bo‘yash","Fayl bosish","Dastur xatosini topish va tuzatish"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 24, 32, 40, ... Keyingi sonni toping.","a":["40","48","49","56"],"correct":1},{"q":"Scratch spriti x=-3 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["-8","3","2","1"],"correct":2},{"q":"Scratch: mushuk “repeat 5” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["84","70","56","19"],"correct":1},{"q":"Vaziyat 1: Maktab kompyuterida virus haqida ogohlantirish chiqdi. Qaysi ish to‘g‘ri?","a":["Barcha faylni o‘chirish","Har qanday tugmani bosish","O‘qituvchiga aytish","Ogohlantirishni ulashish"],"correct":2},{"q":"Scratch: “repeat 5” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["24","11","36","30"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 9, 20, 31, ... Keyingi sonni toping.","a":["31","42","43","53"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 1111 soni o‘nlikda nechaga teng?","a":["16","15","17","18"],"correct":1},{"q":"Robot “4 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["32","33","12","28"],"correct":0},{"q":"Scratch'da sahna qanday nomlanadi?","a":["Keyboard","Browser","Stage","Disk"],"correct":2},{"q":"9 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1010","1100","1011","1001"],"correct":3},{"q":"25 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11100","11011","11001","11010"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["22","132","121","110"],"correct":2},{"q":"“dars.pdf” faylini ko‘rsangiz, uning turi nima?","a":["Ovoz","PDF hujjat","Rasm","Excel jadvali"],"correct":1},{"q":"Scratch spriti x=-4 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["0","-7","-1","-2"],"correct":2},{"q":"Scratch: mushuk “repeat 2” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["16","18","48","32"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 1100 soni o‘nlikda nechaga teng?","a":["13","15","12","14"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 21, 27, 33, ... Keyingi sonni toping.","a":["45","33","39","40"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["18","60","30","45"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 2, 4, 6, ... Keyingi sonni toping.","a":["9","6","8","10"],"correct":2},{"q":"Scratch: “repeat 11” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["17","66","72","60"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 13, 24, 35, ... Keyingi sonni toping.","a":["57","35","46","47"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 23, 34, 45, ... Keyingi sonni toping.","a":["67","57","45","56"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 4, 6, 8, ... Keyingi sonni toping.","a":["12","11","10","8"],"correct":2},{"q":"Robot “6 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["16","61","54","60"],"correct":3},{"q":"45 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101101","101111","110000","101110"],"correct":0},{"q":"Scratch: mushuk “repeat 10” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["63","77","17","70"],"correct":3},{"q":"Scratch: “repeat 2” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["9","6","5","3"],"correct":1},{"q":"Scratch: “repeat 3” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["12","9","24","18"],"correct":3},{"q":"Scratch spriti x=0 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["9","10","-9","8"],"correct":0},{"q":"“dars.css” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Excel jadvali","Veb-sahifa uslubi","Ovoz"],"correct":2},{"q":"14 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1111","10001","1110","10000"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["16","39","52","26"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 11, 17, 23, ... Keyingi sonni toping.","a":["35","29","23","30"],"correct":1},{"q":"“dars.txt” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Ovoz","Oddiy matn","PowerPoint taqdimoti"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["25","140","154","168"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 23, 26, 29, ... Keyingi sonni toping.","a":["32","35","29","33"],"correct":0},{"q":"Robot “4 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["45","40","15","44"],"correct":3},{"q":"Vaziyat 1: Sayt “bepul sovg‘a” uchun pasport raqami so‘rayapti. Qaysi ish to‘g‘ri?","a":["Kattalar bilan tekshirmasdan ma’lumot bermaslik","Rasmli hujjat yuborish","Do‘stlarning raqamini berish","Darhol yozish"],"correct":0},{"q":"Qaysi dastur kod yozishda ishlatilishi mumkin?","a":["Kod muharriri","Ekran qulfi","Ovoz balandligi","Printer drayveri"],"correct":0},{"q":"Scratch: mushuk “repeat 5” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["18","12","15","8"],"correct":2},{"q":"Scratch: mushuk “repeat 5” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["17","60","48","72"],"correct":1},{"q":"Scratch spriti x=4 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["12","11","13","-4"],"correct":0},{"q":"Scratch spriti x=-3 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["2","0","-7","1"],"correct":3},{"q":"Scratch: “repeat 3” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["28","21","10","14"],"correct":1},{"q":"36 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100101","100100","100111","100110"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 20, 28, 36, ... Keyingi sonni toping.","a":["44","36","52","45"],"correct":0},{"q":"Scratch spriti x=1 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["8","9","7","-6"],"correct":0},{"q":"Robot “5 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["13","35","40","41"],"correct":2},{"q":"Scratch: “repeat 2” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["6","8","18","12"],"correct":3},{"q":"368 bit axborot necha bayt bo‘ladi?","a":["47","92","46","48"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 13, 18, 23, ... Keyingi sonni toping.","a":["29","23","28","33"],"correct":2},{"q":"34 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["264","136","272","280"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 8, 12, 16, ... Keyingi sonni toping.","a":["20","21","24","16"],"correct":0},{"q":"Onlayn darsga kirishdan oldin nima tekshiriladi?","a":["Faqat daftar rangi","Faqat printer","Internet va havola","Faqat monitor qutisi"],"correct":2},{"q":"Robot “3 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["12","9","13","7"],"correct":0},{"q":"Scratch spriti x=-3 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["4","-10","5","3"],"correct":0},{"q":"11 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1100","1101","1011","1110"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 17, 27, 37, ... Keyingi sonni toping.","a":["37","48","47","57"],"correct":2},{"q":"Scratch: “repeat 8” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["81","17","63","72"],"correct":3},{"q":"Faylni nomlashda qaysi usul yaxshi?","a":["Nomini umuman qo‘ymaslik","Faqat bo‘sh joy ishlatish","Mazmunli va tushunarli nom qo‘yish","Hamma faylga bir xil nom berish"],"correct":2},{"q":"Robot “5 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["35","36","30","12"],"correct":0},{"q":"Scratch: mushuk “repeat 5” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["60","50","15","40"],"correct":1},{"q":"Scratch spriti x=0 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["5","-4","4","3"],"correct":2},{"q":"39 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101001","101000","101010","100111"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 4, 15, 26, ... Keyingi sonni toping.","a":["38","26","48","37"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["16","66","44","55"],"correct":3},{"q":"Scratch spriti x=3 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["8","-3","9","10"],"correct":2},{"q":"Scratch: “repeat 7” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","12","14","9"],"correct":2},{"q":"Scratch: mushuk “repeat 8” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["112","144","128","24"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 8, 10, 12, ... Keyingi sonni toping.","a":["15","16","14","12"],"correct":2},{"q":"20 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10100","10111","10110","10101"],"correct":0},{"q":"112 bit axborot necha bayt bo‘ladi?","a":["28","16","14","15"],"correct":2},{"q":"Scratch: mushuk “repeat 12” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["18","72","66","78"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 12, 14, 16, ... Keyingi sonni toping.","a":["20","19","18","16"],"correct":2},{"q":"64 bit axborot necha bayt bo‘ladi?","a":["8","9","16","10"],"correct":0},{"q":"41 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["320","164","336","328"],"correct":3},{"q":"376 bit axborot necha bayt bo‘ladi?","a":["47","49","94","48"],"correct":0},{"q":"Scratch: mushuk “repeat 8” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["77","88","99","19"],"correct":1},{"q":"Scratch: mushuk “repeat 4” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["75","45","60","19"],"correct":2},{"q":"Arxiv (ZIP) nima uchun ishlatiladi?","a":["Rasmni ekranga chiqarish","Internetni to‘sish","Ovozni balandlatish","Fayllarni bir joyga yig‘ish va siqish"],"correct":3},{"q":"Scratch: mushuk “repeat 4” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["40","32","24","12"],"correct":1},{"q":"Scratch: mushuk “repeat 4” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["24","18","10","30"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 10, 12, 14, ... Keyingi sonni toping.","a":["14","16","18","17"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 17, 28, 39, ... Keyingi sonni toping.","a":["61","51","50","39"],"correct":2},{"q":"18 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["72","144","136","152"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 7, 17, 27, ... Keyingi sonni toping.","a":["27","37","47","38"],"correct":1},{"q":"Scratch spriti x=0 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["-3","2","4","3"],"correct":3},{"q":"Scratch spriti x=2 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["6","4","-1","5"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 19, 24, 29, ... Keyingi sonni toping.","a":["39","34","35","29"],"correct":1},{"q":"Robot “7 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["12","28","35","36"],"correct":2},{"q":"Scratch: mushuk “repeat 10” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["60","54","66","16"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 101111 soni o‘nlikda nechaga teng?","a":["48","49","50","47"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 21, 30, 39, ... Keyingi sonni toping.","a":["39","49","57","48"],"correct":3},{"q":"Scratch spriti x=-4 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["5","4","3","-12"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 10 soni o‘nlikda nechaga teng?","a":["4","5","3","2"],"correct":3},{"q":"Scratch: “repeat 2” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["9","21","7","14"],"correct":3},{"q":"12 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["88","96","104","48"],"correct":1},{"q":"Klaviaturada Ctrl + C tugmalari odatda nima qiladi?","a":["Chop etish","Saqlash","Nusxa olish","Joylashtirish"],"correct":2},{"q":"Kompyuterning hisoblash markazi qaysi?","a":["Protsessor (CPU)","Sichqoncha","Monitor","Printer"],"correct":0},{"q":"45 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["360","180","352","368"],"correct":0},{"q":"56 bit axborot necha bayt bo‘ladi?","a":["9","7","8","14"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 10, 18, 26, ... Keyingi sonni toping.","a":["26","42","35","34"],"correct":3},{"q":"Scratch: “repeat 7” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["24","11","28","32"],"correct":2},{"q":"Scratch spriti x=-4 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["1","-10","2","3"],"correct":2},{"q":"32 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100011","100000","100010","100001"],"correct":1},{"q":"Qaysi dastur slaydlar tayyorlash uchun mos?","a":["Fayl menejeri","Kalkulyator","PowerPoint","Antivirus"],"correct":2},{"q":"Scratch: “repeat 6” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["14","56","40","48"],"correct":3},{"q":"24 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["96","192","200","184"],"correct":1},{"q":"Scratch: mushuk “repeat 7” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["60","70","17","80"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["63","72","17","81"],"correct":1},{"q":"Vaziyat 1: Begona odam o‘yin chatida parolingizni so‘radi. Qaysi ish to‘g‘ri?","a":["Parolni bermaslik","Parolni yuborish","Parolni guruhga yozish","Unga SMS-kodni ham berish"],"correct":0},{"q":"384 bit axborot necha bayt bo‘ladi?","a":["50","49","48","96"],"correct":2},{"q":"31 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["240","248","124","256"],"correct":1},{"q":"Scratch spriti x=-3 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["6","7","8","-13"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 15, 17, 19, ... Keyingi sonni toping.","a":["22","21","19","23"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 101011 soni o‘nlikda nechaga teng?","a":["43","44","46","45"],"correct":0},{"q":"Scratch: mushuk “repeat 5” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["25","20","30","10"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 1, 5, 9, ... Keyingi sonni toping.","a":["9","17","14","13"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 3, 10, 17, ... Keyingi sonni toping.","a":["31","25","17","24"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 11, 13, 15, ... Keyingi sonni toping.","a":["17","15","18","19"],"correct":0},{"q":"Fayl nima?","a":["Sichqoncha tugmasi","Printer qog‘ozi","Elektr uzatish simi","Saqlangan raqamli ma’lumot"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 13, 21, 29, ... Keyingi sonni toping.","a":["38","29","45","37"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 14, 22, 30, ... Keyingi sonni toping.","a":["30","46","38","39"],"correct":2},{"q":"Klaviaturada Ctrl + B tugmalari odatda nima qiladi?","a":["Qidirish","Oxirgi amalni bekor qilish","Nusxa olish","Matnni qalin qilish"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 1000 soni o‘nlikda nechaga teng?","a":["11","10","8","9"],"correct":2},{"q":"24 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11001","11011","11010","11000"],"correct":3},{"q":"4 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["111","110","101","100"],"correct":3},{"q":"Scratch spriti x=-3 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["1","-6","-1","0"],"correct":3},{"q":"13 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["96","52","104","112"],"correct":2},{"q":"Robot “4 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["6","4","9","8"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 10011 soni o‘nlikda nechaga teng?","a":["20","21","22","19"],"correct":3},{"q":"Scratch: “repeat 9” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["24","12","27","30"],"correct":2},{"q":"344 bit axborot necha bayt bo‘ladi?","a":["45","43","44","86"],"correct":1},{"q":"5 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["32","48","20","40"],"correct":3},{"q":"208 bit axborot necha bayt bo‘ladi?","a":["28","52","26","27"],"correct":2},{"q":"1 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["0","16","4","8"],"correct":3},{"q":"Robot “6 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["12","18","19","9"],"correct":1},{"q":"Scratch: “repeat 2” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["10","15","5","7"],"correct":0},{"q":"Scratch: “repeat 4” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["15","20","25","9"],"correct":1},{"q":"Scratch: mushuk “repeat 7” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["16","72","54","63"],"correct":3},{"q":"Robot “3 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["8","16","15","12"],"correct":2},{"q":"16 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["120","136","128","64"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 7, 15, 23, ... Keyingi sonni toping.","a":["23","32","31","39"],"correct":2},{"q":"Scratch: “repeat 11” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["33","30","36","14"],"correct":0},{"q":"Scratch: “repeat 7” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["24","21","18","10"],"correct":1},{"q":"Scratch: mushuk “repeat 11” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["66","17","72","60"],"correct":0},{"q":"21 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["84","176","160","168"],"correct":3},{"q":"30 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11111","100001","100000","11110"],"correct":3},{"q":"Scratch: “repeat 6” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["49","42","35","13"],"correct":1},{"q":"Scratch: mushuk “repeat 11” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["24","22","20","13"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["20","28","24","10"],"correct":2},{"q":"Algoritmda qadamlar tartibi nima uchun kerak?","a":["Ovozni pasaytirish uchun","Faqat chiroyli ko‘rinishi uchun","Ekran rangini almashtirish uchun","Natija to‘g‘ri chiqishi uchun"],"correct":3},{"q":"Scratch: mushuk “repeat 7” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["19","84","72","96"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["12","10","20","30"],"correct":2},{"q":"Robot “6 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["13","6","12","8"],"correct":2},{"q":"42 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101101","101100","101010","101011"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 5, 10, 15, ... Keyingi sonni toping.","a":["21","15","20","25"],"correct":2},{"q":"Scratch spriti x=-2 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["-11","6","7","8"],"correct":2},{"q":"Vaziyat 1: Kompyuter juda qizib ketdi. Qaysi ish to‘g‘ri?","a":["Yanada og‘ir o‘yin ochish","Adyol bilan yopish","Ustiga suv quyish","Foydalanishni to‘xtatib kattaga aytish"],"correct":3},{"q":"Scratch: mushuk “repeat 11” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["23","120","144","132"],"correct":3},{"q":"328 bit axborot necha bayt bo‘ladi?","a":["42","43","82","41"],"correct":3},{"q":"Internet manzili (URL) nimani ko‘rsatadi?","a":["Veb-resurs manzilini","Printer tezligini","Fayl hajmini","Kompyuter haroratini"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 16, 24, 32, ... Keyingi sonni toping.","a":["41","48","32","40"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 24, 28, ... Keyingi sonni toping.","a":["36","33","28","32"],"correct":3},{"q":"Scratch: mushuk “repeat 12” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["26","22","14","24"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 4, 7, 10, ... Keyingi sonni toping.","a":["14","10","13","16"],"correct":2},{"q":"Scratch: mushuk “repeat 10” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["23","130","143","117"],"correct":1},{"q":"Scratch: “repeat 11” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["20","24","13","22"],"correct":3},{"q":"Scratch spriti x=4 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["2","6","5","7"],"correct":1},{"q":"Scratch spriti x=-5 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["-11","1","0","2"],"correct":1},{"q":"Scratch: “repeat 2” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["11","27","9","18"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 22, 29, 36, ... Keyingi sonni toping.","a":["36","43","44","50"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 16, 27, 38, ... Keyingi sonni toping.","a":["49","38","60","50"],"correct":0},{"q":"120 bit axborot necha bayt bo‘ladi?","a":["30","15","17","16"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 1, 10, 19, ... Keyingi sonni toping.","a":["28","19","29","37"],"correct":0},{"q":"Scratch spriti x=1 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["3","2","4","-1"],"correct":0},{"q":"Klaviaturada Ctrl + N tugmalari odatda nima qiladi?","a":["Faylni ochish","Nusxa olish","Yangi hujjat yoki oyna","Joriy yorliqni yopish"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 11100 soni o‘nlikda nechaga teng?","a":["29","28","31","30"],"correct":1},{"q":"Scratch: “repeat 6” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["42","30","36","12"],"correct":2},{"q":"Scratch spriti x=-3 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["-9","2","3","4"],"correct":2},{"q":"224 bit axborot necha bayt bo‘ladi?","a":["30","28","56","29"],"correct":1},{"q":"Scratch: “repeat 8” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["18","16","10","14"],"correct":1},{"q":"288 bit axborot necha bayt bo‘ladi?","a":["72","36","37","38"],"correct":1},{"q":"Scratch: mushuk “repeat 7” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["10","21","18","24"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 101110 soni o‘nlikda nechaga teng?","a":["49","47","46","48"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 12, 21, 30, ... Keyingi sonni toping.","a":["48","30","39","40"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["42","48","13","36"],"correct":0},{"q":"28 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["216","232","112","224"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 7, 14, 21, ... Keyingi sonni toping.","a":["28","35","21","29"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 18, 25, 32, ... Keyingi sonni toping.","a":["46","40","39","32"],"correct":2},{"q":"Scratch: “repeat 9” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["48","60","15","54"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 6, 17, 28, ... Keyingi sonni toping.","a":["39","40","28","50"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 11, 19, 27, ... Keyingi sonni toping.","a":["36","43","27","35"],"correct":3},{"q":"Vaziyat 1: Notanish kanalda “parolingizni tasdiqlang” xabari keldi. Qaysi ish to‘g‘ri?","a":["Parolni yuborish","Kodni yozish","Linkdan darhol kirish","Xabarga ishonmasdan rasmiy saytni tekshirish"],"correct":3},{"q":"Scratch: mushuk “repeat 10” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["14","36","44","40"],"correct":3},{"q":"Scratch spriti x=-4 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["4","3","-11","2"],"correct":1},{"q":"PowerPoint nimaga xizmat qiladi?","a":["Virus qidirish","Internet provayder","Papka ochish","Slaydli taqdimot yaratish"],"correct":3},{"q":"Scratch spriti x=1 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["7","6","5","-4"],"correct":1},{"q":"Scratch spriti x=-4 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["6","5","-13","4"],"correct":1},{"q":"Scratch spriti x=4 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["-3","12","10","11"],"correct":3},{"q":"Scratch: mushuk “repeat 12” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["22","130","110","120"],"correct":3},{"q":"Scratch: “repeat 10” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["17","77","63","70"],"correct":3},{"q":"Nusxa ko‘chirish amali nima?","a":["Asl faylni darhol o‘chirish","Kompyuterni o‘chirish","Ma’lumotning nusxasini yaratish","Faylni parollash"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 1, 7, 13, ... Keyingi sonni toping.","a":["25","20","13","19"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 6, 12, 18, ... Keyingi sonni toping.","a":["18","25","30","24"],"correct":3},{"q":"Scratch spriti x=0 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["-10","10","9","11"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["33","11","13","22"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 4, 8, 12, ... Keyingi sonni toping.","a":["17","12","20","16"],"correct":3},{"q":"Scratch spriti x=3 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["4","3","5","2"],"correct":0},{"q":"Klaviaturada Alt + Tab tugmalari odatda nima qiladi?","a":["Brauzerda yangi yorliq","Matnni qalin qilish","Kesib olish","Oynalar orasida o‘tish"],"correct":3},{"q":"72 bit axborot necha bayt bo‘ladi?","a":["11","9","10","18"],"correct":1},{"q":"Scratch spriti x=3 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["11","13","12","-6"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 24, 27, 30, ... Keyingi sonni toping.","a":["34","30","36","33"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 14, 23, 32, ... Keyingi sonni toping.","a":["41","50","32","42"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 11001 soni o‘nlikda nechaga teng?","a":["28","26","27","25"],"correct":3},{"q":"21 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10111","10110","11000","10101"],"correct":3},{"q":"128 bit axborot necha bayt bo‘ladi?","a":["16","18","17","32"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 6, 11, 16, ... Keyingi sonni toping.","a":["21","16","26","22"],"correct":0},{"q":"Scratch: mushuk “repeat 10” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["22","18","12","20"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 15, 19, 23, ... Keyingi sonni toping.","a":["28","27","23","31"],"correct":1},{"q":"Robot “6 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["18","10","25","24"],"correct":3},{"q":"Robot “6 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["55","54","15","48"],"correct":1},{"q":"33 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100001","100100","100010","100011"],"correct":0},{"q":"Scratch'da if bloki nima qiladi?","a":["Ovozni saqlaydi","Rasmni chop etadi","Wi-Fi ulaydi","Shartni tekshiradi"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 18, 27, 36, ... Keyingi sonni toping.","a":["46","54","45","36"],"correct":2},{"q":"Sifatli ma’lumot manbasi qanday?","a":["Faqat reklama","Faqat tasodifiy xabar","Manbasi noma’lum","Ishonchli va tekshiriladigan"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 3, 6, 9, ... Keyingi sonni toping.","a":["13","12","15","9"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["13","42","35","49"],"correct":1},{"q":"Scratch: “repeat 4” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["12","40","24","32"],"correct":3},{"q":"Scratch: mushuk “repeat 6” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["72","60","18","84"],"correct":0},{"q":"Printer nima uchun kerak?","a":["Ovozni yozish","Dastur yozish","Internetga ulash","Hujjatni qog‘ozga chiqarish"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 7, 12, 17, ... Keyingi sonni toping.","a":["23","27","22","17"],"correct":2},{"q":"Scratch: mushuk “repeat 5” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["45","14","36","54"],"correct":0},{"q":"Scratch spriti x=3 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["9","7","8","-2"],"correct":2},{"q":"Robot “4 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["37","32","13","36"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 1, 9, 17, ... Keyingi sonni toping.","a":["17","25","33","26"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 100011 soni o‘nlikda nechaga teng?","a":["35","37","36","38"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 2, 5, 8, ... Keyingi sonni toping.","a":["14","12","8","11"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 100 soni o‘nlikda nechaga teng?","a":["7","4","5","6"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["126","112","22","98"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 16, 22, 28, ... Keyingi sonni toping.","a":["34","35","40","28"],"correct":0},{"q":"Scratch: mushuk “repeat 5” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["24","20","9","16"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 3, 13, 23, ... Keyingi sonni toping.","a":["33","23","43","34"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 101001 soni o‘nlikda nechaga teng?","a":["44","43","41","42"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["18","77","66","88"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 15, 26, 37, ... Keyingi sonni toping.","a":["48","59","49","37"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 1110 soni o‘nlikda nechaga teng?","a":["16","15","14","17"],"correct":2},{"q":"Scratch: mushuk “repeat 6” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["84","98","20","70"],"correct":0},{"q":"Sichqonchadagi scroll g‘ildiragi nimaga yordam beradi?","a":["Dastur o‘chirish","Fayl saqlash","Tovush yozish","Sahifani aylantirish"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 1, 6, 11, ... Keyingi sonni toping.","a":["21","16","17","11"],"correct":1},{"q":"38 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["312","304","152","296"],"correct":1},{"q":"Robot “8 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["80","81","18","72"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 2, 12, 22, ... Keyingi sonni toping.","a":["32","22","42","33"],"correct":0},{"q":"Antivirus nimaga yordam beradi?","a":["Printerga siyoh quyish","Matnni ranglash","Batareyani kattalashtirish","Zararli dasturlardan himoyalanish"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 5, 7, 9, ... Keyingi sonni toping.","a":["13","11","9","12"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 6, 15, 24, ... Keyingi sonni toping.","a":["34","24","42","33"],"correct":3},{"q":"Scratch spriti x=-5 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["-1","0","-2","-9"],"correct":0},{"q":"Scratch spriti x=-1 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["-7","5","4","6"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 12, 22, 32, ... Keyingi sonni toping.","a":["42","32","52","43"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 11, 15, 19, ... Keyingi sonni toping.","a":["24","27","23","19"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 13, 20, 27, ... Keyingi sonni toping.","a":["27","34","41","35"],"correct":1},{"q":"Scratch spriti x=-2 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["-6","1","3","2"],"correct":3},{"q":"Robot “4 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["10","20","24","25"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 5, 11, 17, ... Keyingi sonni toping.","a":["23","17","29","24"],"correct":0},{"q":"Sichqonchaning chap tugmasi ko‘pincha nima qiladi?","a":["Tanlaydi","Wi-Fi uzadi","Qog‘oz bosadi","Ovozni chiqaradi"],"correct":0},{"q":"Tanish bo‘lmagan odam internetda manzil so‘rasa nima qilish kerak?","a":["Kattalarga aytish va bermaslik","Hammaga ko‘rsatish","Darhol yuborish","Ovozli xabar yuborish"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 1001 soni o‘nlikda nechaga teng?","a":["11","10","12","9"],"correct":3},{"q":"Scratch: “repeat 9” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["13","36","32","40"],"correct":1},{"q":"Scratch: mushuk “repeat 11” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["36","33","30","14"],"correct":1},{"q":"336 bit axborot necha bayt bo‘ladi?","a":["84","44","42","43"],"correct":2},{"q":"18 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10011","10101","10010","10100"],"correct":2},{"q":"9 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["36","72","64","80"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["24","27","21","11"],"correct":0},{"q":"352 bit axborot necha bayt bo‘ladi?","a":["45","46","44","88"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 16, 26, 36, ... Keyingi sonni toping.","a":["56","36","47","46"],"correct":3},{"q":"Scratch: mushuk “repeat 12” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["96","104","88","20"],"correct":0},{"q":"17 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10001","10010","10100","10011"],"correct":0},{"q":"0 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11","0","10","1"],"correct":1},{"q":"Scratch spriti x=2 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["8","9","7","-4"],"correct":0},{"q":"Scratch spriti x=2 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["7","6","5","-2"],"correct":1},{"q":"Scratch: mushuk “repeat 5” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["8","7","10","12"],"correct":2},{"q":"152 bit axborot necha bayt bo‘ladi?","a":["20","21","38","19"],"correct":3},{"q":"23 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["176","92","192","184"],"correct":3},{"q":"Robot “2 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["13","23","22","20"],"correct":2},{"q":"Scratch: mushuk “repeat 9” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["14","40","50","45"],"correct":3},{"q":"Scratch: “repeat 6” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["11","35","25","30"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 21, 23, 25, ... Keyingi sonni toping.","a":["29","25","27","28"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 100110 soni o‘nlikda nechaga teng?","a":["40","38","39","41"],"correct":1},{"q":"Scratch spriti x=2 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["10","9","-5","8"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["6","9","5","3"],"correct":0},{"q":"22 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11000","10110","10111","11001"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 13, 22, 31, ... Keyingi sonni toping.","a":["40","49","41","31"],"correct":0},{"q":"Scratch: mushuk “repeat 7” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["49","56","14","42"],"correct":0},{"q":"Robot “7 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["63","64","16","56"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 10, 16, 22, ... Keyingi sonni toping.","a":["28","34","22","29"],"correct":0},{"q":"Scratch: mushuk “repeat 2” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["24","8","16","10"],"correct":2},{"q":"Scratch spriti x=-4 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["-6","-2","-1","-3"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["16","20","11","18"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 18, 22, 26, ... Keyingi sonni toping.","a":["30","31","34","26"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 22, 30, 38, ... Keyingi sonni toping.","a":["47","54","46","38"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 8, 17, 26, ... Keyingi sonni toping.","a":["36","44","35","26"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["8","16","7","12"],"correct":3},{"q":"360 bit axborot necha bayt bo‘ladi?","a":["46","47","90","45"],"correct":3},{"q":"Robot “3 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["24","11","25","21"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 14, 25, 36, ... Keyingi sonni toping.","a":["36","48","58","47"],"correct":3},{"q":"Robot “4 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["7","13","8","12"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 25, 30, ... Keyingi sonni toping.","a":["40","35","30","36"],"correct":1},{"q":"34 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100101","100010","100100","100011"],"correct":1},{"q":"Scratch: mushuk “repeat 3” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["28","42","56","17"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["112","126","23","140"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["63","15","49","56"],"correct":3},{"q":"Scratch spriti x=0 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["6","5","7","-6"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 2, 11, 20, ... Keyingi sonni toping.","a":["30","20","38","29"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 11110 soni o‘nlikda nechaga teng?","a":["31","33","30","32"],"correct":2},{"q":"Robot “5 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["7","10","5","11"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 11, 22, 33, ... Keyingi sonni toping.","a":["44","45","55","33"],"correct":0},{"q":"Scratch spriti x=4 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["15","-6","14","13"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["192","27","176","160"],"correct":2},{"q":"Scratch: “repeat 4” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["12","16","8","20"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["4","8","6","12"],"correct":1},{"q":"Scratch'da sound nima?","a":["Xotira turi","Tarmoq shifri","Rang chizish","Ovoz bilan ishlash bo‘limi"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 6, 9, 12, ... Keyingi sonni toping.","a":["16","15","12","18"],"correct":1},{"q":"Scratch'da forever bloki nima qiladi?","a":["Slayd qo‘shadi","Faylni saqlaydi","Buyruqlarni uzluksiz takrorlaydi","Faqat bir marta bajaradi"],"correct":2},{"q":"Robot “7 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["15","9","14","7"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 10, 20, 30, ... Keyingi sonni toping.","a":["30","50","40","41"],"correct":2},{"q":"Fishing (phishing) nima?","a":["Rasm chizish","Internetni o‘chirish","Musica tinglash","Aldov xabari bilan ma’lumot o‘g‘irlash"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 1, 3, 5, ... Keyingi sonni toping.","a":["9","7","5","8"],"correct":1},{"q":"Sichqoncha kursori nima?","a":["Kompyuter quvvati","Ekrandagi ko‘rsatkich","Quloqchin","Printer ruligi"],"correct":1},{"q":"Robot “2 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["11","19","18","16"],"correct":2},{"q":"Scratch spriti x=-4 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["-8","1","-1","0"],"correct":3},{"q":"Dasturlash nima?","a":["Kompyuterga bajariladigan ko‘rsatmalar yozish","Musiqa yozib olish","Printer ta’mirlash","Faqat internet ko‘rish"],"correct":0},{"q":"Robot “8 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["88","80","89","19"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 7, 16, 25, ... Keyingi sonni toping.","a":["35","34","43","25"],"correct":1},{"q":"29 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["116","224","232","240"],"correct":2},{"q":"Klaviaturada Ctrl + F tugmalari odatda nima qiladi?","a":["Qidirish","Oynalar orasida o‘tish","Sahifani yangilash","Chop etish"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 12, 19, 26, ... Keyingi sonni toping.","a":["26","34","33","40"],"correct":2},{"q":"Scratch: mushuk “repeat 4” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["12","7","15","9"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 8, 18, 28, ... Keyingi sonni toping.","a":["38","39","48","28"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 17, 19, 21, ... Keyingi sonni toping.","a":["23","21","24","25"],"correct":0},{"q":"Scratch: mushuk “repeat 8” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["13","45","35","40"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 10, 14, 18, ... Keyingi sonni toping.","a":["18","26","23","22"],"correct":3},{"q":"Robot “5 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["45","46","40","14"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 6, 16, 26, ... Keyingi sonni toping.","a":["36","46","37","26"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 11, 21, 31, ... Keyingi sonni toping.","a":["31","42","41","51"],"correct":2},{"q":"10 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["80","72","88","40"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 15, 18, 21, ... Keyingi sonni toping.","a":["25","27","24","21"],"correct":2},{"q":"3 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101","110","100","11"],"correct":3},{"q":"Scratch'da costume nimani o‘zgartiradi?","a":["Fayl kengaytmasini","Printer formatini","Internet tezligini","Qahramon ko‘rinishini"],"correct":3},{"q":"Scratch spriti x=4 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["3","5","6","4"],"correct":1},{"q":"Vaziyat 1: Noma’lum havolada sovg‘a yutdingiz deb yozilgan. Qaysi ish to‘g‘ri?","a":["Havolani tekshirmay ochmaslik","Do‘stlarga ulashish","Darhol hisobga kirish","Shaxsiy ma’lumotni kiritish"],"correct":0},{"q":"44 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["352","176","344","360"],"correct":0},{"q":"Robot “3 qadam oldinga” buyrug‘ini 9 marta takrorlasa, jami qancha yuradi?","a":["12","27","28","24"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 24, 28, 32, ... Keyingi sonni toping.","a":["40","32","37","36"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 10010 soni o‘nlikda nechaga teng?","a":["21","20","18","19"],"correct":2},{"q":"Robot “3 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["3","5","6","7"],"correct":2},{"q":"Scratch: mushuk “repeat 4” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["80","20","64","48"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 23, 27, 31, ... Keyingi sonni toping.","a":["35","36","39","31"],"correct":0},{"q":"39 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["156","320","304","312"],"correct":3},{"q":"Scratch: mushuk “repeat 6” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["63","45","15","54"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 13, 17, 21, ... Keyingi sonni toping.","a":["21","25","26","29"],"correct":1},{"q":"Bulutli xotira nima?","a":["Internet orqali fayl saqlash xizmati","Telefon kamera turi","Printer qutisi","Osmondagi bulut"],"correct":0},{"q":"104 bit axborot necha bayt bo‘ladi?","a":["14","15","26","13"],"correct":3},{"q":"Robot “2 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["17","14","10","16"],"correct":3},{"q":"“dars.gif” faylini ko‘rsangiz, uning turi nima?","a":["Video","Rasm","Animatsiyali rasm","PowerPoint taqdimoti"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 2, 8, 14, ... Keyingi sonni toping.","a":["14","21","20","26"],"correct":2},{"q":"Scratch: “repeat 6” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["28","24","10","20"],"correct":1},{"q":"Scratch spriti x=0 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["2","3","1","-2"],"correct":0},{"q":"Scratch: “repeat 6” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["63","45","54","15"],"correct":2},{"q":"Scratch spriti x=-1 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["-2","-1","1","0"],"correct":3},{"q":"Scratch: “repeat 3” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["11","16","24","32"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 101100 soni o‘nlikda nechaga teng?","a":["45","46","44","47"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 3, 12, 21, ... Keyingi sonni toping.","a":["31","21","39","30"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 1, 11, 21, ... Keyingi sonni toping.","a":["31","41","21","32"],"correct":0},{"q":"Scratch spriti x=4 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["9","0","8","7"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 18, 21, 24, ... Keyingi sonni toping.","a":["24","28","27","30"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 17, 24, 31, ... Keyingi sonni toping.","a":["38","31","39","45"],"correct":0},{"q":"Ikkita tez bosish (double click) ko‘pincha nima qiladi?","a":["Fayl yoki dasturni ochadi","Ekranni yuvadi","Wi-Fi ulaydi","Ovozni o‘chiradi"],"correct":0},{"q":"Robot “6 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["11","24","31","30"],"correct":3},{"q":"43 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101011","101101","101110","101100"],"correct":0},{"q":"Yuklash (upload) nima?","a":["Internetni o‘chirish","Qurilmadan internetga fayl yuborish","Faylni yopish","Tugmani bosish"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["15","48","54","60"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 3, 9, 15, ... Keyingi sonni toping.","a":["22","21","15","27"],"correct":1},{"q":"Bo‘sh joy kirituvchi tugma qaysi?","a":["Space","Esc","Tab","Enter"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 18, 28, 38, ... Keyingi sonni toping.","a":["38","58","48","49"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 17, 25, 33, ... Keyingi sonni toping.","a":["33","42","49","41"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 10, 17, 24, ... Keyingi sonni toping.","a":["24","38","31","32"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 9, 13, 17, ... Keyingi sonni toping.","a":["22","17","25","21"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 8, 13, 18, ... Keyingi sonni toping.","a":["23","28","24","18"],"correct":0},{"q":"Scratch: mushuk “repeat 5” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["96","64","21","80"],"correct":3},{"q":"1 bayt necha bit?","a":["16 bit","8 bit","4 bit","2 bit"],"correct":1},{"q":"Vaziyat 1: Kompyuteringizda noma’lum fayl paydo bo‘ldi. Qaysi ish to‘g‘ri?","a":["Parol bilan ochish","Darhol ishga tushirish","Kattadan so‘rab, faylni tekshirtirish","Do‘stga yuborish"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 10100 soni o‘nlikda nechaga teng?","a":["20","23","22","21"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 11000 soni o‘nlikda nechaga teng?","a":["26","27","24","25"],"correct":2},{"q":"10 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1101","1100","1011","1010"],"correct":3},{"q":"Scratch: “repeat 5” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["30","20","25","10"],"correct":2},{"q":"“dars.mp4” faylini ko‘rsangiz, uning turi nima?","a":["Ovoz","PowerPoint taqdimoti","Rasm","Video"],"correct":3},{"q":"40 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101000","101010","101001","101011"],"correct":0},{"q":"Scratch: “repeat 4” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["11","28","35","21"],"correct":1},{"q":"Fayl nomidagi .mp4 ko‘pincha nima?","a":["Printer drayveri","Faqat matn","Papka","Video fayli"],"correct":3},{"q":"28 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11110","11101","11100","11111"],"correct":2},{"q":"Robot “8 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["40","49","14","48"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 3, 8, 13, ... Keyingi sonni toping.","a":["18","19","23","13"],"correct":0},{"q":"16 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10001","10010","10011","10000"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 7, 11, 15, ... Keyingi sonni toping.","a":["20","15","19","23"],"correct":2},{"q":"27 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["216","208","224","108"],"correct":0},{"q":"24 bit axborot necha bayt bo‘ladi?","a":["4","6","5","3"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 11, 16, 21, ... Keyingi sonni toping.","a":["21","27","31","26"],"correct":3},{"q":"Shaxsiy parolni kim bilan bo‘lishish mumkin?","a":["Ochiq guruhda","Barcha sinfdosh bilan","Hech kim bilan bo‘lishmaslik kerak","Notanish odam bilan"],"correct":2},{"q":"Scratch: mushuk “repeat 12” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["19","77","84","91"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 3, 7, 11, ... Keyingi sonni toping.","a":["19","11","16","15"],"correct":3},{"q":"Robot “4 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["16","12","17","8"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 14, 18, 22, ... Keyingi sonni toping.","a":["30","26","22","27"],"correct":1},{"q":"240 bit axborot necha bayt bo‘ladi?","a":["31","60","30","32"],"correct":2},{"q":"Scratch: “repeat 11” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["15","48","40","44"],"correct":3},{"q":"Ekranga juda yaqin o‘tirish to‘g‘rimi?","a":["Ha, har doim","Faqat kechasi","Faqat o‘yinda","Yo‘q, qulay masofa saqlanadi"],"correct":3},{"q":"3 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["12","32","16","24"],"correct":3},{"q":"Vaziyat 1: Telefoningizga tasdiqlash kodi keldi. Qaysi ish to‘g‘ri?","a":["Do‘stga yuborish","Kodni o‘yin chatiga yozish","Postga joylash","Kodni hech kimga bermaslik"],"correct":3},{"q":"Operatsion tizimga misol?","a":["Word hujjati","Windows","JPEG rasm","Sichqoncha"],"correct":1},{"q":"Ma’lumot nima?","a":["Elektr tugmasi","Faqat telefon","Saqlash yoki qayta ishlash mumkin bo‘lgan axborot","Chizma qog‘oz"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 10, 15, 20, ... Keyingi sonni toping.","a":["26","25","20","30"],"correct":1},{"q":"Rasmni kattalashtirish uchun odatda nima qilinadi?","a":["Zoom ishlatiladi","Caps Lock bosiladi","Printer o‘chiriladi","Fayl nomi almashtiriladi"],"correct":0},{"q":"Scratch spriti x=3 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["6","-1","7","8"],"correct":2},{"q":"Vaziyat 1: Maktabdagi umumiy kompyuterda emailga kirdingiz. Qaysi ish to‘g‘ri?","a":["Emailni ochiq qoldirish","Ish tugagach hisobdan chiqish","Hammani kirgizish","Parolni saqlab qo‘yish"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 10000 soni o‘nlikda nechaga teng?","a":["17","18","16","19"],"correct":2},{"q":"46 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["376","360","184","368"],"correct":3},{"q":"Scratch spriti x=0 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["6","7","8","-7"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["22","130","104","117"],"correct":3},{"q":"Scratch: “repeat 10” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["33","13","30","27"],"correct":2},{"q":"40 bit axborot necha bayt bo‘ladi?","a":["7","5","10","6"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 20, 30, 40, ... Keyingi sonni toping.","a":["40","51","60","50"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 31, 42, ... Keyingi sonni toping.","a":["53","64","54","42"],"correct":0},{"q":"Scratch: mushuk “repeat 10” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["99","81","90","19"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 8, 15, 22, ... Keyingi sonni toping.","a":["22","36","30","29"],"correct":3},{"q":"Scratch: mushuk “repeat 8” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["10","16","18","14"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 16, 19, 22, ... Keyingi sonni toping.","a":["25","22","28","26"],"correct":0},{"q":"25 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["208","100","192","200"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 23, 29, 35, ... Keyingi sonni toping.","a":["42","47","41","35"],"correct":2},{"q":"Scratch spriti x=2 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["0","4","3","5"],"correct":1},{"q":"Scratch: mushuk “repeat 4” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["30","50","40","14"],"correct":2},{"q":"Scratch: “repeat 10” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["18","12","20","22"],"correct":2},{"q":"Robot “5 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["15","50","51","45"],"correct":1},{"q":"Scratch: mushuk “repeat 8” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["84","20","96","108"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["28","10","21","14"],"correct":2},{"q":"Scratch: “repeat 8” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["28","12","36","32"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 6, 10, 14, ... Keyingi sonni toping.","a":["18","19","22","14"],"correct":0},{"q":"Scratch spriti x=1 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["-5","6","7","8"],"correct":2},{"q":"Vaziyat 1: Sinfdoshingiz yozgan faylini tasodifan o‘chirdingiz. Qaysi ish to‘g‘ri?","a":["O‘yin ochish","Boshqa faylni ham o‘chirish","O‘qituvchiga aytish va tiklashga urinish","Yashirish"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 9, 16, 23, ... Keyingi sonni toping.","a":["30","23","31","37"],"correct":0},{"q":"Yuklab olish (download) nima?","a":["Faylni internetga yuborish","Ekran rasmini o‘chirish","Internetdan qurilmaga fayl olish","Qog‘oz saqlash"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 14, 19, 24, ... Keyingi sonni toping.","a":["34","24","30","29"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 9, 14, 19, ... Keyingi sonni toping.","a":["24","25","29","19"],"correct":0},{"q":"Ilovaning ruxsatlari (permissions) nima?","a":["Fayl kengaytmasi","Ilova qaysi imkoniyatga kira olishini belgilaydi","Monitor o‘lchami","Printer rangi"],"correct":1},{"q":"296 bit axborot necha bayt bo‘ladi?","a":["39","74","38","37"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 10, 13, 16, ... Keyingi sonni toping.","a":["20","22","19","16"],"correct":2},{"q":"11 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["44","88","80","96"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 3, 11, 19, ... Keyingi sonni toping.","a":["27","19","28","35"],"correct":0},{"q":"Scratch: mushuk “repeat 6” ichida “turn 6 degrees” bajarsa, jami necha daraja buriladi?","a":["42","36","30","12"],"correct":1},{"q":"Robot “6 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["60","17","66","67"],"correct":2},{"q":"304 bit axborot necha bayt bo‘ladi?","a":["76","39","38","40"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["77","84","18","70"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 23, 31, 39, ... Keyingi sonni toping.","a":["39","48","55","47"],"correct":3},{"q":"Scratch: “repeat 4” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["27","36","45","13"],"correct":1},{"q":"2 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101","100","10","11"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["78","20","91","104"],"correct":2},{"q":"37 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101000","100111","100101","100110"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 15, 25, 35, ... Keyingi sonni toping.","a":["45","55","35","46"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 5, 16, 27, ... Keyingi sonni toping.","a":["27","49","39","38"],"correct":3},{"q":"Scratch: mushuk “repeat 10” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["140","24","154","126"],"correct":0},{"q":"40 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["160","312","320","328"],"correct":2},{"q":"Robot “2 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["18","20","21","12"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["70","50","16","60"],"correct":3},{"q":"32 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["256","248","264","128"],"correct":0},{"q":"Qaysi format ko‘pincha ovoz uchun ishlatiladi?","a":["PNG","WAV","DOCX","XLSX"],"correct":1},{"q":"8 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1000","1011","1010","1001"],"correct":0},{"q":"Klaviaturada Ctrl + O tugmalari odatda nima qiladi?","a":["Sahifani yangilash","Joylashtirish","Faylni ochish","Oynalar orasida o‘tish"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["21","112","84","98"],"correct":3},{"q":"Scratch: “repeat 7” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["12","35","30","40"],"correct":1},{"q":"Vaziyat 1: Kutilmaganda yangi ilova o‘rnatishni so‘rashdi. Qaysi ish to‘g‘ri?","a":["Manba va ruxsatlarni tekshirish","Do‘stlarga ham o‘rnatish","Darhol o‘rnatish","Barcha parollarni kiritish"],"correct":0},{"q":"Vaziyat 1: O‘yin ichida kimdir sizni kamsitmoqda. Qaysi ish to‘g‘ri?","a":["Shaxsiy ma’lumot berish","U bilan janjallashish","Bloklash yoki shikoyat qilish","Xuddi shunday javob berish"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["10","8","20","15"],"correct":3},{"q":"Scratch: “repeat 2” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["4","12","6","8"],"correct":3},{"q":"Scratch: “repeat 9” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["72","64","17","80"],"correct":0},{"q":"Scratch: “repeat 3” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["8","10","20","15"],"correct":3},{"q":"Xotirani tejash uchun nima yordam beradi?","a":["Hamma faylni ko‘paytirish","Ko‘p brauzer ochish","Keraksiz fayllarni tartib bilan o‘chirish","Har doim video yozish"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 4, 10, 16, ... Keyingi sonni toping.","a":["16","23","28","22"],"correct":3},{"q":"Scratch: “repeat 4” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["7","9","15","12"],"correct":3},{"q":"Vaziyat 1: Ilova kameradan foydalanishga ruxsat so‘radi, ammo kamera kerak emas. Qaysi ish to‘g‘ri?","a":["Telefonni qayta sotish","Parolni kiritish","Ruxsatni bermaslik","Hamma ruxsatni berish"],"correct":2},{"q":"400 bit axborot necha bayt bo‘ladi?","a":["50","51","100","52"],"correct":0},{"q":"Scratch spriti x=-5 nuqtada. “change x by 7” dan keyin x nechaga teng?","a":["3","1","-12","2"],"correct":3},{"q":"Robot “8 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["16","65","64","56"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 101000 soni o‘nlikda nechaga teng?","a":["43","42","40","41"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 21, 31, 41, ... Keyingi sonni toping.","a":["51","61","41","52"],"correct":0},{"q":"Scratch: “repeat 11” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","50","55","60"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["156","143","130","24"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["24","120","150","135"],"correct":3},{"q":"Scratch'da yashil bayroq nima uchun?","a":["Faylni bosish","Kompyuterni o‘chirish","Tarixni tozalash","Loyihani ishga tushirish"],"correct":3},{"q":"Scratch spriti x=-2 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["-1","0","-3","-2"],"correct":0},{"q":"Scratch spriti x=-4 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["-3","-2","-4","-5"],"correct":0},{"q":"Scratch: mushuk “repeat 2” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["26","13","39","15"],"correct":0},{"q":"Scratch: mushuk “repeat 10” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["80","18","88","72"],"correct":0},{"q":"Klaviaturada Ctrl + S tugmalari odatda nima qiladi?","a":["Yangi hujjat yoki oyna","Saqlash","Brauzerda yangi yorliq","Hammasini tanlash"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 11101 soni o‘nlikda nechaga teng?","a":["29","30","31","32"],"correct":0},{"q":"47 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["101111","110001","110000","110010"],"correct":0},{"q":"“dars.svg” faylini ko‘rsangiz, uning turi nima?","a":["Ovoz","Rasm","Vektor rasm","Excel jadvali"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["12","40","35","30"],"correct":2},{"q":"Scratch spriti x=-4 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["7","-14","5","6"],"correct":3},{"q":"Scratch: mushuk “repeat 8” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["90","80","70","18"],"correct":1},{"q":"Scratch: “repeat 10” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["81","99","90","19"],"correct":2},{"q":"Robot “8 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["24","11","16","25"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 101101 soni o‘nlikda nechaga teng?","a":["46","45","47","48"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 17, 21, 25, ... Keyingi sonni toping.","a":["30","33","25","29"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 9, 11, 13, ... Keyingi sonni toping.","a":["16","13","15","17"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 6, 14, 22, ... Keyingi sonni toping.","a":["30","38","22","31"],"correct":0},{"q":"Scratch dasturida qahramon nima deyiladi?","a":["Folder","Driver","Router","Sprite"],"correct":3},{"q":"46 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["110000","101111","101110","110001"],"correct":2},{"q":"Bit nima?","a":["Printer turi","Katta disk","Rasm muharriri","Axborotning eng kichik ikkilik birligi"],"correct":3},{"q":"“dars.py” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Python kodi","Ovoz","Excel jadvali"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["32","36","40","13"],"correct":1},{"q":"“dars.xlsx” faylini ko‘rsangiz, uning turi nima?","a":["Ovoz","Excel jadvali","Rasm","PowerPoint taqdimoti"],"correct":1},{"q":"Scratch spriti x=0 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["1","2","-1","0"],"correct":0},{"q":"Scratch: mushuk “repeat 4” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["11","35","21","28"],"correct":3},{"q":"Boshqaning rasmini ishlatganda nima qilish to‘g‘ri?","a":["Darhol sotish","O‘zimniki deb e’lon qilish","Ruxsat yoki litsenziyani tekshirish","Muallifni o‘chirib yuborish"],"correct":2},{"q":"“dars.wav” faylini ko‘rsangiz, uning turi nima?","a":["Oddiy matn","Rasm","PDF hujjat","Ovoz"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 19, 27, 35, ... Keyingi sonni toping.","a":["44","35","51","43"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 8, 14, 20, ... Keyingi sonni toping.","a":["27","20","26","32"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 18, 29, 40, ... Keyingi sonni toping.","a":["40","52","51","62"],"correct":2},{"q":"Scratch: “repeat 9” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["63","70","56","16"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 22, 33, 44, ... Keyingi sonni toping.","a":["56","66","44","55"],"correct":3},{"q":"Scratch: mushuk “repeat 8” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["104","117","21","91"],"correct":0},{"q":"Scratch: mushuk “repeat 12” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["132","156","24","144"],"correct":3},{"q":"Scratch: “repeat 8” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["48","14","42","54"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 10111 soni o‘nlikda nechaga teng?","a":["26","23","25","24"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 100111 soni o‘nlikda nechaga teng?","a":["39","41","42","40"],"correct":0},{"q":"“dars.csv” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","Jadval ma’lumoti","Ovoz","Excel jadvali"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 17, 23, 29, ... Keyingi sonni toping.","a":["29","41","35","36"],"correct":2},{"q":"160 bit axborot necha bayt bo‘ladi?","a":["22","21","20","40"],"correct":2},{"q":"Scratch: mushuk “repeat 4” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["39","17","52","65"],"correct":2},{"q":"Klaviaturada Ctrl + P tugmalari odatda nima qiladi?","a":["Matnni qalin qilish","Brauzerda yangi yorliq","Yangi hujjat yoki oyna","Chop etish"],"correct":3},{"q":"216 bit axborot necha bayt bo‘ladi?","a":["29","28","27","54"],"correct":2},{"q":"42 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["328","168","336","344"],"correct":2},{"q":"Scratch spriti x=0 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["6","-5","4","5"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 2, 6, 10, ... Keyingi sonni toping.","a":["15","14","18","10"],"correct":1},{"q":"Scratch spriti x=-2 nuqtada. “change x by 5” dan keyin x nechaga teng?","a":["2","3","4","-7"],"correct":1},{"q":"Algoritm nima?","a":["Bir xil harf","Amallarning tartibli ketma-ketligi","Ovoz fayli","Faqat bir rasm"],"correct":1},{"q":"264 bit axborot necha bayt bo‘ladi?","a":["33","66","35","34"],"correct":0},{"q":"35 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100110","100101","100100","100011"],"correct":3},{"q":"Scratch spriti x=-1 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["4","2","-5","3"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 4, 13, 22, ... Keyingi sonni toping.","a":["22","31","40","32"],"correct":1},{"q":"280 bit axborot necha bayt bo‘ladi?","a":["36","37","70","35"],"correct":3},{"q":"Scratch: mushuk “repeat 6” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["75","21","90","105"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 15, 22, 29, ... Keyingi sonni toping.","a":["29","37","36","43"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 3, 14, 25, ... Keyingi sonni toping.","a":["37","25","36","47"],"correct":2},{"q":"Internet nima?","a":["O‘zaro ulangan kompyuter tarmoqlari","Faqat bitta dastur","Klaviatura turi","Printer turi"],"correct":0},{"q":"Robot “8 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["32","24","33","12"],"correct":0},{"q":"184 bit axborot necha bayt bo‘ladi?","a":["23","46","24","25"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 14, 17, 20, ... Keyingi sonni toping.","a":["26","23","20","24"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["5","10","15","7"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 19, 25, 31, ... Keyingi sonni toping.","a":["38","37","31","43"],"correct":1},{"q":"Scratch: mushuk “repeat 10” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["110","100","90","20"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 1, 12, 23, ... Keyingi sonni toping.","a":["35","45","23","34"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 2, 9, 16, ... Keyingi sonni toping.","a":["24","16","30","23"],"correct":3},{"q":"Scratch spriti x=-3 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["-12","7","6","5"],"correct":2},{"q":"Rasmlarni ekranda ko‘rsatadigan qurilma qaysi?","a":["Klaviatura","Mikrofon","Monitor","Skaner"],"correct":2},{"q":"49 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["196","400","384","392"],"correct":3},{"q":"Robot “7 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["43","35","42","13"],"correct":2},{"q":"Vaziyat 1: Internetdagi notanish kishi uchrashishni taklif etdi. Qaysi ish to‘g‘ri?","a":["Manzilni jo‘natish","Parolni berish","Yolg‘iz borish","Darhol ishonchli kattaga aytish"],"correct":3},{"q":"Scratch: mushuk “repeat 6” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["21","15","18","9"],"correct":2},{"q":"Scratch: mushuk “repeat 2” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["36","24","14","12"],"correct":1},{"q":"SSD nima?","a":["Faqat rasm tahrirlovchi","Ma’lumot saqlash qurilmasi","Internet protokoli","Ovoz balandligi"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 111 soni o‘nlikda nechaga teng?","a":["8","7","10","9"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 22, 28, 34, ... Keyingi sonni toping.","a":["40","41","34","46"],"correct":0},{"q":"Internetdagi har bir ma’lumot to‘g‘rimi?","a":["Yo‘q, manbani tekshirish kerak","Ha, hammasi to‘g‘ri","Faqat sarlavhasi to‘g‘ri","Faqat rasmlar to‘g‘ri"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 110 soni o‘nlikda nechaga teng?","a":["9","8","6","7"],"correct":2},{"q":"Scratch'da buyruqlar qanday ko‘rinishda?","a":["Qog‘ozlar","Elektr simlari","Bloklar","Piksellar"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 4, 9, 14, ... Keyingi sonni toping.","a":["19","20","24","14"],"correct":0},{"q":"Scratch: “repeat 10” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["66","54","16","60"],"correct":3},{"q":"48 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["384","376","392","192"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 11010 soni o‘nlikda nechaga teng?","a":["26","28","27","29"],"correct":0},{"q":"“dars.json” faylini ko‘rsangiz, uning turi nima?","a":["Excel jadvali","Rasm","Tuzilgan ma’lumot","Ovoz"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 21, 26, 31, ... Keyingi sonni toping.","a":["31","37","41","36"],"correct":3},{"q":"312 bit axborot necha bayt bo‘ladi?","a":["78","40","41","39"],"correct":3},{"q":"“dars.webp” faylini ko‘rsangiz, uning turi nima?","a":["Animatsiyali rasm","Rasm","PDF hujjat","Oddiy matn"],"correct":1},{"q":"Dastur yangilanishi (update) nima?","a":["Ekran dog‘i","Dasturning yangi versiyasi","Internet kabeli","Printer qog‘ozi"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 19, 23, 27, ... Keyingi sonni toping.","a":["35","32","31","27"],"correct":2},{"q":"50 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["408","400","392","200"],"correct":1},{"q":"Wi-Fi nima uchun ishlatiladi?","a":["Matnni bo‘yash","Qog‘ozni kesish","Ovozni kuchaytirish","Simsiz tarmoqqa ulanish"],"correct":3},{"q":"Scratch: mushuk “repeat 8” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["28","32","12","36"],"correct":1},{"q":"Robot “2 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["12","14","9","15"],"correct":1},{"q":"Scratch: mushuk “repeat 9” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["70","63","16","56"],"correct":1},{"q":"Klaviaturada Esc ko‘pincha nima qiladi?","a":["Yangi monitor ochadi","Amalni bekor qiladi yoki oynadan chiqadi","Yordamchi xotirani o‘chiradi","Matnni kesadi"],"correct":1},{"q":"Vaziyat 1: Birov sizning suratingizni ruxsatsiz joyladi. Qaysi ish to‘g‘ri?","a":["O‘z manzilingizni e’lon qilish","Hamma rasmlarni tarqatish","Kattaga aytish va shikoyat qilish","Parolni yuborish"],"correct":2},{"q":"Kompyuterga suv to‘kilsa nima qilish kerak?","a":["Kattadan yordam so‘rab, elektrdan ehtiyot bo‘lish","O‘ynashda davom etish","Darhol qo‘l bilan tekshirish","Unga suv qo‘shish"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 13, 23, 33, ... Keyingi sonni toping.","a":["44","53","43","33"],"correct":2},{"q":"Scratch: “repeat 7” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["15","48","64","56"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 16, 21, 26, ... Keyingi sonni toping.","a":["32","36","31","26"],"correct":2},{"q":"Scratch spriti x=-2 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["5","6","-10","7"],"correct":1},{"q":"Maktab kompyuterida shaxsiy hisobdan chiqish nega kerak?","a":["Monitorni yoritish uchun","O‘yin tezlashishi uchun","Hisobni himoyalash uchun","Printer qizishi uchun"],"correct":2},{"q":"Vaziyat 1: Sayt sizdan karta ma’lumotlarini so‘rayapti. Qaysi ish to‘g‘ri?","a":["Ekran rasmi yuborish","Kattalarsiz kiritmaslik","Darhol kiritish","Hamma bilan bo‘lishish"],"correct":1},{"q":"Onlayn o‘yinda begona odam haqorat qilsa nima qilamiz?","a":["Uy manzilini yozish","Bloklash yoki kattaga aytish","Janjal qilish","Parol berish"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 100001 soni o‘nlikda nechaga teng?","a":["36","35","34","33"],"correct":3},{"q":"29 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11110","11101","100000","11111"],"correct":1},{"q":"Scratch spriti x=3 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["4","5","6","1"],"correct":1},{"q":"Scratch: mushuk “repeat 3” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["48","24","15","36"],"correct":3},{"q":"Robot “6 qadam oldinga” buyrug‘ini 8 marta takrorlasa, jami qancha yuradi?","a":["42","48","14","49"],"correct":1},{"q":"Scratch: mushuk “repeat 10” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["27","13","30","33"],"correct":2},{"q":"Robot “4 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["29","11","28","24"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 23, 30, 37, ... Keyingi sonni toping.","a":["45","44","37","51"],"correct":1},{"q":"Vaziyat 1: Do‘stingiz internetda sizga qo‘pol yozdi. Qaysi ish to‘g‘ri?","a":["Xotirjam javob berish yoki kattaga aytish","Parolini so‘rash","Javoban haqorat qilish","Hamma bilan urishish"],"correct":0},{"q":"Scratch: mushuk “repeat 4” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["16","20","12","8"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 100000 soni o‘nlikda nechaga teng?","a":["34","33","32","35"],"correct":2},{"q":"Robot “2 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["8","10","7","11"],"correct":1},{"q":"1 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11","1","10","100"],"correct":1},{"q":"Scratch spriti x=-1 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["-4","3","1","2"],"correct":3},{"q":"Klaviaturada Ctrl + A tugmalari odatda nima qiladi?","a":["Hammasini tanlash","Qidirish","Faylni ochish","Joriy yorliqni yopish"],"correct":0},{"q":"Scratch: “repeat 7” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","63","72","54"],"correct":1},{"q":"Robotga aniq buyruq berish nima uchun muhim?","a":["Sichqonchani tozalash uchun","Printer tezligini oshirish uchun","Ekranni ranglash uchun","U to‘g‘ri bajarishi uchun"],"correct":3},{"q":"Papka (folder) nima?","a":["Monitor ekrani","Internet tarmog‘i","Kompyuter protsessori","Fayllarni tartiblab saqlash joyi"],"correct":3},{"q":"13 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1111","1110","1101","10000"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["44","48","15","40"],"correct":0},{"q":"Skanerning vazifasi nima?","a":["Kompyuterni sovitish","Internet tarqatish","Qog‘ozdagi tasvirni raqamlashtirish","Matnni chop etish"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 10 degrees” bajarsa, jami necha daraja buriladi?","a":["21","100","110","120"],"correct":2},{"q":"Klaviaturadagi yo‘nalish tugmalari nima?","a":["Funksiya tugmalari","Strelkalar","Raqamlar","Harflar"],"correct":1},{"q":"Robot “8 qadam oldinga” buyrug‘ini 2 marta takrorlasa, jami qancha yuradi?","a":["10","17","16","8"],"correct":2},{"q":"Scratch: mushuk “repeat 8” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["56","16","64","72"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 11, 18, 25, ... Keyingi sonni toping.","a":["39","33","25","32"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 24, 26, 28, ... Keyingi sonni toping.","a":["32","31","30","28"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 19, 22, 25, ... Keyingi sonni toping.","a":["29","31","28","25"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 18, 24, 30, ... Keyingi sonni toping.","a":["30","42","37","36"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 9, 19, 29, ... Keyingi sonni toping.","a":["40","29","39","49"],"correct":2},{"q":"Scratch spriti x=1 nuqtada. “change x by 4” dan keyin x nechaga teng?","a":["-3","5","4","6"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 101010 soni o‘nlikda nechaga teng?","a":["45","44","43","42"],"correct":3},{"q":"Scratch: mushuk “repeat 9” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["18","81","72","90"],"correct":1},{"q":"Fayl nomidagi .png odatda nimani bildiradi?","a":["Matn dasturi","Rasm fayli","Ovoz fayli","Video o‘yini"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 4, 14, 24, ... Keyingi sonni toping.","a":["34","35","44","24"],"correct":0},{"q":"Scratch spriti x=-2 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["3","-8","5","4"],"correct":3},{"q":"Robot “7 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["18","78","70","77"],"correct":3},{"q":"Paint dasturida nima qilsa bo‘ladi?","a":["Rasm chizish","Operatsion tizim o‘rnatish","Wi-Fi yaratish","Kompyuterni ta’mirlash"],"correct":0},{"q":"17 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["136","128","144","68"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 20, 27, 34, ... Keyingi sonni toping.","a":["42","48","34","41"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 7, 10, 13, ... Keyingi sonni toping.","a":["16","17","13","19"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 22, 32, 42, ... Keyingi sonni toping.","a":["52","53","42","62"],"correct":0},{"q":"Robot “4 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["36","41","40","14"],"correct":2},{"q":"Klaviaturada Ctrl + W tugmalari odatda nima qiladi?","a":["Joylashtirish","Saqlash","Sahifani yangilash","Joriy yorliqni yopish"],"correct":3},{"q":"Scratch: “repeat 7” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["42","14","49","56"],"correct":2},{"q":"Mualliflik huquqi nima?","a":["Printer siyohi","Wi-Fi kodi","Ijodkorning asariga tegishli huquq","Rasm filtri"],"correct":2},{"q":"35 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["288","272","280","140"],"correct":2},{"q":"Scratch: “repeat 5” ichida “move 7 steps” bo‘lsa, jami necha qadam yuradi?","a":["42","12","28","35"],"correct":3},{"q":"Scratch spriti x=-3 nuqtada. “change x by 2” dan keyin x nechaga teng?","a":["0","-2","-5","-1"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 12, 23, 34, ... Keyingi sonni toping.","a":["34","56","45","46"],"correct":2},{"q":"Klaviaturada Ctrl + Z tugmalari odatda nima qiladi?","a":["Oxirgi amalni bekor qilish","Saqlash","Oynalar orasida o‘tish","Chop etish"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 1, 8, 15, ... Keyingi sonni toping.","a":["22","23","29","15"],"correct":0},{"q":"Scratch'da variable (o‘zgaruvchi) nima?","a":["Papka nomi","O‘zgaradigan qiymatni saqlovchi nom","Sichqoncha tugmasi","Doimiy rasm"],"correct":1},{"q":"Scratch: mushuk “repeat 6” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["91","78","19","65"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 8, 19, 30, ... Keyingi sonni toping.","a":["30","52","42","41"],"correct":3},{"q":"37 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["148","304","296","288"],"correct":2},{"q":"26 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["216","104","208","200"],"correct":2},{"q":"Scratch: mushuk “repeat 12” ichida “turn 13 degrees” bajarsa, jami necha daraja buriladi?","a":["156","169","25","143"],"correct":0},{"q":"Scratch spriti x=1 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["-9","10","11","12"],"correct":2},{"q":"Scratch spriti x=-5 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["-14","3","4","5"],"correct":2},{"q":"Scratch: mushuk “repeat 12” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["154","26","182","168"],"correct":3},{"q":"Scratch: “repeat 5” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["32","40","13","48"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 15, 21, 27, ... Keyingi sonni toping.","a":["27","34","33","39"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 1101 soni o‘nlikda nechaga teng?","a":["15","14","13","16"],"correct":2},{"q":"6 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["56","24","40","48"],"correct":3},{"q":"320 bit axborot necha bayt bo‘ladi?","a":["41","42","80","40"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 24, 33, 42, ... Keyingi sonni toping.","a":["60","42","51","52"],"correct":2},{"q":"“dars.zip” faylini ko‘rsangiz, uning turi nima?","a":["Arxiv","Excel jadvali","Ovoz","Rasm"],"correct":0},{"q":"Robot “8 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["57","48","15","56"],"correct":3},{"q":"Scratch: “repeat 8” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["11","21","24","27"],"correct":2},{"q":"Scratch: “repeat 11” ichida “move 8 steps” bo‘lsa, jami necha qadam yuradi?","a":["19","96","88","80"],"correct":2},{"q":"Robot “5 qadam oldinga” buyrug‘ini 11 marta takrorlasa, jami qancha yuradi?","a":["50","16","56","55"],"correct":3},{"q":"“dars.jpg” faylini ko‘rsangiz, uning turi nima?","a":["Rasm","PDF hujjat","Oddiy matn","Animatsiyali rasm"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 8, 11, 14, ... Keyingi sonni toping.","a":["20","14","18","17"],"correct":3},{"q":"Scratch: mushuk “repeat 2” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["9","21","7","14"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 18, 20, 22, ... Keyingi sonni toping.","a":["26","22","24","25"],"correct":2},{"q":"Scratch: mushuk “repeat 10” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["144","176","26","160"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["90","60","75","20"],"correct":2},{"q":"Mikrofon qaysi ma’lumotni kiritadi?","a":["Elektr toki","Ovoz","Rasm","Qog‘oz"],"correct":1},{"q":"Faylni boshqa papkaga ko‘chirishdan oldin nima qilish yaxshi?","a":["Internetni yoqish","Sichqonchani almashtirish","Monitorni uzish","To‘g‘ri faylni tanlash"],"correct":3},{"q":"96 bit axborot necha bayt bo‘ladi?","a":["14","24","12","13"],"correct":2},{"q":"Scratch spriti x=-5 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["-6","-3","-5","-4"],"correct":3},{"q":"Klaviaturada Ctrl + T tugmalari odatda nima qiladi?","a":["Nusxa olish","Joriy yorliqni yopish","Oxirgi amalni bekor qilish","Brauzerda yangi yorliq"],"correct":3},{"q":"Excel dasturi nimaga mos?","a":["Ovoz yozish","Jadval va hisoblash","O‘yin boshqarish","Rasm chizish"],"correct":1},{"q":"Robot “7 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["21","29","11","28"],"correct":3},{"q":"Scratch: “repeat 8” ichida “move 5 steps” bo‘lsa, jami necha qadam yuradi?","a":["40","13","45","35"],"correct":0},{"q":"19 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["10110","10011","10100","10101"],"correct":1},{"q":"Scratch: “repeat 9” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["16","20","18","11"],"correct":2},{"q":"Scratch: mushuk “repeat 3” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["14","22","44","33"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 18, 26, 34, ... Keyingi sonni toping.","a":["50","42","34","43"],"correct":1},{"q":"48 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["110011","110000","110001","110010"],"correct":1},{"q":"Robot “5 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["15","10","16","8"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 5, 8, 11, ... Keyingi sonni toping.","a":["15","14","17","11"],"correct":1},{"q":"43 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["172","336","344","352"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 20, 23, 26, ... Keyingi sonni toping.","a":["30","32","29","26"],"correct":2},{"q":"Suhbatda odob nima?","a":["Parollarni so‘rash","Hurmat bilan yozish","Do‘stni kamsitish","Boshqalarni haqorat qilish"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 9, 15, 21, ... Keyingi sonni toping.","a":["27","33","28","21"],"correct":0},{"q":"33 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["132","272","256","264"],"correct":3},{"q":"Scratch: mushuk “repeat 3” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["6","4","5","8"],"correct":0},{"q":"Scratch spriti x=3 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["10","12","11","-5"],"correct":2},{"q":"Scratch: “repeat 9” ichida “move 9 steps” bo‘lsa, jami necha qadam yuradi?","a":["72","81","18","90"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 13, 16, 19, ... Keyingi sonni toping.","a":["25","22","19","23"],"correct":1},{"q":"Scratch spriti x=-2 nuqtada. “change x by 3” dan keyin x nechaga teng?","a":["1","2","-5","0"],"correct":0},{"q":"Robot “6 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["43","13","36","42"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 16, 25, 34, ... Keyingi sonni toping.","a":["52","43","44","34"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 10, 21, 32, ... Keyingi sonni toping.","a":["54","44","43","32"],"correct":2},{"q":"22 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["184","176","88","168"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 16, 18, 20, ... Keyingi sonni toping.","a":["20","22","24","23"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 17, 22, 27, ... Keyingi sonni toping.","a":["27","37","33","32"],"correct":3},{"q":"Robot “3 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["13","27","31","30"],"correct":3},{"q":"Robot “3 qadam oldinga” buyrug‘ini 7 marta takrorlasa, jami qancha yuradi?","a":["18","22","21","10"],"correct":2},{"q":"Scratch spriti x=2 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["2","1","3","4"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 22, 27, 32, ... Keyingi sonni toping.","a":["38","42","32","37"],"correct":3},{"q":"Scratch: mushuk “repeat 9” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["24","30","12","27"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 20, 26, 32, ... Keyingi sonni toping.","a":["44","38","39","32"],"correct":1},{"q":"392 bit axborot necha bayt bo‘ladi?","a":["49","51","98","50"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 24, 30, 36, ... Keyingi sonni toping.","a":["48","36","42","43"],"correct":2},{"q":"Parol nima uchun kerak?","a":["Ekranni kattalashtirish","Hisobni himoyalash","Printer tanlash","O‘yin yuklash"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 23, 25, 27, ... Keyingi sonni toping.","a":["29","27","31","30"],"correct":0},{"q":"Scratch: mushuk “repeat 12” ichida “turn 3 degrees” bajarsa, jami necha daraja buriladi?","a":["39","15","33","36"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 19, 21, 23, ... Keyingi sonni toping.","a":["26","25","23","27"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 24, 31, 38, ... Keyingi sonni toping.","a":["45","38","52","46"],"correct":0},{"q":"232 bit axborot necha bayt bo‘ladi?","a":["58","29","31","30"],"correct":1},{"q":"Scratch spriti x=4 nuqtada. “change x by 6” dan keyin x nechaga teng?","a":["10","11","-2","9"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 9, 18, 27, ... Keyingi sonni toping.","a":["36","45","37","27"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 3, 5, 7, ... Keyingi sonni toping.","a":["7","9","11","10"],"correct":1},{"q":"Scratch: mushuk “repeat 10” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["132","120","22","108"],"correct":1},{"q":"Scratch: “repeat 4” ichida “move 6 steps” bo‘lsa, jami necha qadam yuradi?","a":["24","30","10","18"],"correct":0},{"q":"48 bit axborot necha bayt bo‘ladi?","a":["6","8","12","7"],"correct":0},{"q":"Scratch: mushuk “repeat 12” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["17","65","60","55"],"correct":2},{"q":"Vaziyat 1: Parolingizni do‘stingiz bilib qoldi. Qaysi ish to‘g‘ri?","a":["Hamma bilan ulashish","Hech nima qilmaslik","Parolni almashtirish","Bir xil parolni tarqatish"],"correct":2},{"q":"Scratch: mushuk “repeat 9” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["128","25","160","144"],"correct":3},{"q":"5 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["110","111","101","1000"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 19, 26, 33, ... Keyingi sonni toping.","a":["40","33","41","47"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 16, 20, 24, ... Keyingi sonni toping.","a":["32","28","29","24"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 101 soni o‘nlikda nechaga teng?","a":["6","8","5","7"],"correct":2},{"q":"Scratch spriti x=-1 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["-9","7","8","6"],"correct":1},{"q":"176 bit axborot necha bayt bo‘ladi?","a":["24","23","44","22"],"correct":3},{"q":"Scratch'dagi repeat bloki nima qiladi?","a":["Faylni o‘chiradi","Internetni yopadi","Ovozni o‘chiradi","Buyruqlarni takrorlaydi"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["13","48","40","32"],"correct":2},{"q":"Robot “7 qadam oldinga” buyrug‘ini 10 marta takrorlasa, jami qancha yuradi?","a":["63","70","17","71"],"correct":1},{"q":"“dars.html” faylini ko‘rsangiz, uning turi nima?","a":["Excel jadvali","Veb-sahifa","Rasm","Ovoz"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 11, 20, 29, ... Keyingi sonni toping.","a":["29","47","39","38"],"correct":3},{"q":"Scratch: mushuk “repeat 4” ichida “turn 12 degrees” bajarsa, jami necha daraja buriladi?","a":["48","60","16","36"],"correct":0},{"q":"36 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["144","288","280","296"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 9, 12, 15, ... Keyingi sonni toping.","a":["15","18","21","19"],"correct":1},{"q":"32 bit axborot necha bayt bo‘ladi?","a":["4","8","5","6"],"correct":0},{"q":"Ikkilik sanoq tizimidagi 110001 soni o‘nlikda nechaga teng?","a":["51","52","49","50"],"correct":2},{"q":"Ikkilik sanoq tizimidagi 1010 soni o‘nlikda nechaga teng?","a":["11","10","13","12"],"correct":1},{"q":"Scratch spriti x=-5 nuqtada. “change x by 10” dan keyin x nechaga teng?","a":["5","4","-15","6"],"correct":0},{"q":"Scratch: mushuk “repeat 9” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["20","110","88","99"],"correct":3},{"q":"Scratch: mushuk “repeat 5” ichida “turn 7 degrees” bajarsa, jami necha daraja buriladi?","a":["12","42","28","35"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 12, 17, 22, ... Keyingi sonni toping.","a":["28","27","32","22"],"correct":1},{"q":"200 bit axborot necha bayt bo‘ladi?","a":["50","25","26","27"],"correct":1},{"q":"Scratch: mushuk “repeat 2” ichida “turn 14 degrees” bajarsa, jami necha daraja buriladi?","a":["28","42","14","16"],"correct":0},{"q":"Robot “4 qadam oldinga” buyrug‘ini 5 marta takrorlasa, jami qancha yuradi?","a":["16","20","9","21"],"correct":1},{"q":"30 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["248","240","232","120"],"correct":1},{"q":"144 bit axborot necha bayt bo‘ladi?","a":["20","36","19","18"],"correct":3},{"q":"Scratch: mushuk “repeat 10” ichida “turn 5 degrees” bajarsa, jami necha daraja buriladi?","a":["45","55","50","15"],"correct":2},{"q":"Scratch: “repeat 10” ichida “move 4 steps” bo‘lsa, jami necha qadam yuradi?","a":["44","14","40","36"],"correct":2},{"q":"26 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["11011","11010","11101","11100"],"correct":1},{"q":"Scratch: “repeat 6” ichida “move 3 steps” bo‘lsa, jami necha qadam yuradi?","a":["9","18","15","21"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 19, 28, 37, ... Keyingi sonni toping.","a":["37","46","55","47"],"correct":1},{"q":"Ikkilik sanoq tizimidagi 100100 soni o‘nlikda nechaga teng?","a":["37","36","38","39"],"correct":1},{"q":"12 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["1110","1111","1101","1100"],"correct":3},{"q":"256 bit axborot necha bayt bo‘ladi?","a":["33","32","34","64"],"correct":1},{"q":"Shart (condition) nima?","a":["Internet paroli","To‘g‘ri yoki noto‘g‘ri bo‘lishi mumkin bo‘lgan tekshiruv","Fayl nomi","Monitor kabeli"],"correct":1},{"q":"Scratch: “repeat 6” ichida “move 2 steps” bo‘lsa, jami necha qadam yuradi?","a":["8","14","12","10"],"correct":2},{"q":"Scratch spriti x=2 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["9","11","-6","10"],"correct":3},{"q":"Ikkilik sanoq tizimidagi 110000 soni o‘nlikda nechaga teng?","a":["51","50","48","49"],"correct":2},{"q":"168 bit axborot necha bayt bo‘ladi?","a":["21","23","22","42"],"correct":0},{"q":".pdf fayl odatda nima?","a":["O‘yin boshqaruvi","Ko‘rish va ulashish uchun hujjat","Sichqoncha tugmasi","Printer qurilmasi"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 21, 29, 37, ... Keyingi sonni toping.","a":["37","53","46","45"],"correct":3},{"q":"Scratch: mushuk “repeat 7” ichida “turn 8 degrees” bajarsa, jami necha daraja buriladi?","a":["15","64","48","56"],"correct":3},{"q":"19 bayt nechta bitga teng? (1 bayt = 8 bit)","a":["160","76","152","144"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 11, 14, 17, ... Keyingi sonni toping.","a":["20","21","17","23"],"correct":0},{"q":"Zaxira nusxa (backup) nima?","a":["Eski klaviatura","Printer uchun qog‘oz","Katta monitor","Muhim ma’lumotning qo‘shimcha nusxasi"],"correct":3},{"q":"Matndagi xatoni o‘chirish uchun qaysi tugma yordam beradi?","a":["F1","Print Screen","Caps Lock","Backspace"],"correct":3},{"q":"Scratch'da x va y koordinatalar nima?","a":["Internet tezligi","Fayl hajmi","Musiqa balandligi","Qahramon joylashuvi"],"correct":3},{"q":"Scratch: mushuk “repeat 7” ichida “turn 4 degrees” bajarsa, jami necha daraja buriladi?","a":["11","24","28","32"],"correct":2},{"q":"Scratch spriti x=4 nuqtada. “change x by 9” dan keyin x nechaga teng?","a":["14","-5","13","12"],"correct":2},{"q":"Scratch spriti x=-3 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["4","6","-11","5"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 24, 29, 34, ... Keyingi sonni toping.","a":["39","40","44","34"],"correct":0},{"q":"Scratch: mushuk “repeat 6” ichida “turn 11 degrees” bajarsa, jami necha daraja buriladi?","a":["17","55","66","77"],"correct":2},{"q":"Scratch: mushuk “repeat 11” ichida “turn 9 degrees” bajarsa, jami necha daraja buriladi?","a":["90","99","20","108"],"correct":1},{"q":"Robot “3 qadam oldinga” buyrug‘ini 6 marta takrorlasa, jami qancha yuradi?","a":["9","19","18","15"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 4, 11, 18, ... Keyingi sonni toping.","a":["25","26","18","32"],"correct":0},{"q":"31 soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?","a":["100010","100001","100000","11111"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 14, 20, 26, ... Keyingi sonni toping.","a":["26","32","38","33"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 17, 26, 35, ... Keyingi sonni toping.","a":["45","53","35","44"],"correct":3},{"q":"Ikkilik sanoq sistemasida qaysi raqamlar ishlatiladi?","a":["0 va 1","2 va 9","1 va 3","0 va 2"],"correct":0},{"q":"Ekran rasmi (screenshot) nima?","a":["Video ovozi","Fayl paroli","Ekrandagi tasvir nusxasi","Internet kabeli"],"correct":2},{"q":"Qidiruv tizimi nima qiladi?","a":["Internetdagi ma’lumotlarni qidiradi","Kompyuterni o‘chiradi","Qog‘oz chop etadi","Musiqa yozadi"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 4, 12, 20, ... Keyingi sonni toping.","a":["36","28","20","29"],"correct":1},{"q":"Robot “5 qadam oldinga” buyrug‘ini 4 marta takrorlasa, jami qancha yuradi?","a":["15","9","21","20"],"correct":3},{"q":"Noma’lum havolani olsangiz nima qilish kerak?","a":["Faylni ishga tushirish","Hammaga yuborish","Darhol parol kiritish","Tekshirmay ochmaslik"],"correct":3},{"q":"USB fleshka nima uchun kerak?","a":["Ovoz kuchaytirish","Internet manzilni topish","Suv isitish","Ma’lumot saqlash va ko‘chirish"],"correct":3},{"q":"Robot kodi ketma-ketlik berdi: 16, 23, 30, ... Keyingi sonni toping.","a":["38","44","37","30"],"correct":2},{"q":"Scratch: mushuk “repeat 7” ichida “turn 16 degrees” bajarsa, jami necha daraja buriladi?","a":["23","128","96","112"],"correct":3},{"q":"Scratch: mushuk “repeat 6” ichida “turn 2 degrees” bajarsa, jami necha daraja buriladi?","a":["12","10","14","8"],"correct":0},{"q":"Robot “2 qadam oldinga” buyrug‘ini 3 marta takrorlasa, jami qancha yuradi?","a":["7","6","4","5"],"correct":1},{"q":"Robot kodi ketma-ketlik berdi: 22, 25, 28, ... Keyingi sonni toping.","a":["34","28","31","32"],"correct":2},{"q":"Scratch: mushuk “repeat 12” ichida “turn 15 degrees” bajarsa, jami necha daraja buriladi?","a":["180","195","165","27"],"correct":0},{"q":"Klaviaturada Ctrl + V tugmalari odatda nima qiladi?","a":["Kesib olish","Joylashtirish","Hammasini tanlash","Yangi hujjat yoki oyna"],"correct":1},{"q":"192 bit axborot necha bayt bo‘ladi?","a":["24","26","25","48"],"correct":0},{"q":"Scratch spriti x=1 nuqtada. “change x by 1” dan keyin x nechaga teng?","a":["0","3","2","1"],"correct":2},{"q":"Robot kodi ketma-ketlik berdi: 19, 30, 41, ... Keyingi sonni toping.","a":["53","63","41","52"],"correct":3},{"q":"Scratch spriti x=0 nuqtada. “change x by 8” dan keyin x nechaga teng?","a":["8","-8","9","7"],"correct":0},{"q":"Robot kodi ketma-ketlik berdi: 7, 13, 19, ... Keyingi sonni toping.","a":["19","26","25","31"],"correct":2}]
;
const MODES = {
  team: {
    name: "TEAM CLASH",
    summary:
      "Qizillar vs Ko‘klar. Raqiblarni yenging va data-core qurilmasini himoya qiling yoki faollashtiring.",
    type: "tactical",
  },
  ffa: {
    name: "FREE FOR ALL",
    summary:
      "Barcha o‘yinchilar mustaqil. Eng ko‘p raqibni yenggan va omon qolgan g‘olib.",
    type: "survival",
  },
  impostor: {
    name: "SECRET AGENT",
    summary:
      "Agentlar topshiriqlarni bajaradi. Xoin yashirin hujum qiladi; yig‘ilishda kimga ishonishni hal qiling.",
    type: "social",
  },
  escape: {
    name: "MAZE ESCAPE",
    summary:
      "Uchta kod-parchani toping, jumboq yeching va chiqish portaliga birinchi yetib boring.",
    type: "puzzle",
  },
  double: {
    name: "DOUBLE AGENT",
    summary:
      "Ikki jamoa, lekin har biri orasida o‘z tomoniga sabotaj qiladigan sirli xoin bor.",
    type: "betrayal",
  },
};
const TEAMS = [
  { name: "QIZILLAR", color: "#f0806e" },
  { name: "KO‘KLAR", color: "#82b9d6" },
];
const {WEAPONS,SHOP}={
  "MODES": {
    "team": {
      "name": "TEAM CLASH",
      "summary": "Qizillar vs Ko‘klar. Raqiblarni yenging va data-core qurilmasini himoya qiling yoki faollashtiring.",
      "type": "tactical"
    },
    "ffa": {
      "name": "FREE FOR ALL",
      "summary": "Barcha o‘yinchilar mustaqil. Eng ko‘p raqibni yenggan va omon qolgan g‘olib.",
      "type": "survival"
    },
    "impostor": {
      "name": "SECRET AGENT",
      "summary": "Agentlar topshiriqlarni bajaradi. Xoin yashirin hujum qiladi; yig‘ilishda kimga ishonishni hal qiling.",
      "type": "social"
    },
    "escape": {
      "name": "MAZE ESCAPE",
      "summary": "Uchta kod-parchani toping, jumboq yeching va chiqish portaliga birinchi yetib boring.",
      "type": "puzzle"
    },
    "double": {
      "name": "DOUBLE AGENT",
      "summary": "Ikki jamoa, lekin har biri orasida o‘z tomoniga sabotaj qiladigan sirli xoin bor.",
      "type": "betrayal"
    }
  },
  "WEAPONS": {
    "pistol": {
      "name": "MK1 PISTOL",
      "class": "SIDEARM",
      "price": 0,
      "mag": 12,
      "reserve": 36,
      "damage": 19,
      "speed": 18,
      "delay": 310,
      "load": 1350,
      "spread": 0.045,
      "pellets": 1,
      "range": 13,
      "icon": "⌐"
    },
    "smg": {
      "name": "VECTOR SMG",
      "class": "SMG",
      "price": 550,
      "mag": 24,
      "reserve": 72,
      "damage": 11,
      "speed": 19,
      "delay": 105,
      "load": 1750,
      "spread": 0.17,
      "pellets": 1,
      "range": 10,
      "icon": "≡"
    },
    "rifle": {
      "name": "AR-7 RIFLE",
      "class": "ASSAULT",
      "price": 850,
      "mag": 30,
      "reserve": 90,
      "damage": 23,
      "speed": 24,
      "delay": 165,
      "load": 2150,
      "spread": 0.07,
      "pellets": 1,
      "range": 16,
      "icon": "⌁"
    },
    "shotgun": {
      "name": "BREACH-8",
      "class": "SHOTGUN",
      "price": 700,
      "mag": 6,
      "reserve": 24,
      "damage": 11,
      "speed": 17,
      "delay": 850,
      "load": 2350,
      "spread": 0.22,
      "pellets": 6,
      "range": 6,
      "icon": "≋"
    },
    "sniper": {
      "name": "LONGSHOT",
      "class": "MARKSMAN",
      "price": 1200,
      "mag": 5,
      "reserve": 15,
      "damage": 68,
      "speed": 36,
      "delay": 1100,
      "load": 2600,
      "spread": 0.01,
      "pellets": 1,
      "range": 23,
      "icon": "⟜"
    },
    "lmg": {
      "name": "M-60 SUPPORT",
      "class": "SUPPORT",
      "price": 1450,
      "mag": 60,
      "reserve": 120,
      "damage": 18,
      "speed": 22,
      "delay": 125,
      "load": 3600,
      "spread": 0.13,
      "pellets": 1,
      "range": 17
    }
  },
  "SHOP": [
    {
      "id": "pistol",
      "name": "MK1 PISTOL",
      "info": "12 / 36 · 19 DMG",
      "cost": 180,
      "icon": "⌐",
      "kind": "gun"
    },
    {
      "id": "smg",
      "name": "VECTOR SMG",
      "info": "24 / 72 · TEZKOR",
      "cost": 550,
      "icon": "≡",
      "kind": "gun"
    },
    {
      "id": "rifle",
      "name": "AR-7 RIFLE",
      "info": "30 / 90 · ANIQLIK",
      "cost": 850,
      "icon": "⌁",
      "kind": "gun"
    },
    {
      "id": "shotgun",
      "name": "BREACH-8",
      "info": "6 / 24 · YAQINDAN",
      "cost": 700,
      "icon": "≋",
      "kind": "gun"
    },
    {
      "id": "sniper",
      "name": "LONGSHOT",
      "info": "5 / 15 · UZOQDAN",
      "cost": 1200,
      "icon": "⟜",
      "kind": "gun"
    },
    {
      "id": "ammo",
      "name": "AMMO BOX",
      "info": "+2 MAGAZIN / TANLANGAN",
      "cost": 170,
      "icon": "▤",
      "kind": "supply"
    },
    {
      "id": "medkit",
      "name": "MEDKIT",
      "info": "+60 HP / MAX 100",
      "cost": 230,
      "icon": "✚",
      "kind": "supply"
    },
    {
      "id": "armor",
      "name": "ARMOR PLATE",
      "info": "+50 ZIRH / MAX 100",
      "cost": 320,
      "icon": "⬡",
      "kind": "supply"
    },
    {
      "id": "scanner",
      "name": "RECON PULSE",
      "info": "8 S RADAR / YAQIN RAQIBLAR",
      "cost": 280,
      "icon": "◉",
      "kind": "supply"
    },
    {
      "id": "smoke",
      "name": "SMOKE CANISTER",
      "info": "10 S TUMAN / YASHIRINISH",
      "cost": 260,
      "icon": "☷",
      "kind": "supply"
    },
    {
      "id": "energy",
      "name": "ENERGY CELL",
      "info": "TO‘LIQ STAMINA",
      "cost": 95,
      "icon": "ϟ",
      "kind": "supply"
    },
    {
      "id": "key",
      "name": "MASTER KEY",
      "info": "BIR ESHIK / 1 KOD-BO‘LAK",
      "cost": 750,
      "icon": "⟡",
      "kind": "supply"
    },
    {
      "id": "lmg",
      "name": "M-60 SUPPORT",
      "cost": 1450,
      "info": "60 / 120 · YORDAMCHI",
      "kind": "gun"
    }
  ]
}
;

function generateMaze(n, seed) {
  // Deterministic connected facility: five rooms and wide navigable corridors.
  n = n | 1;
  let state = seed >>> 0;
  const rng = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const g = Array.from({ length: n }, () => Array(n).fill(1));
  const mid = Math.floor(n / 2);
  const carve = (x, y, w, h) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++)
        if (xx > 0 && yy > 0 && xx < n - 1 && yy < n - 1) g[yy][xx] = 0;
  };
  const centers = [
    [6, 6],
    [n - 7, 6],
    [mid, mid],
    [6, n - 7],
    [n - 7, n - 7],
  ];
  for (const [x, y] of centers) carve(x - 4, y - 4, 9, 9);
  for (let i = 0; i < centers.length - 1; i++) {
    const [a, b] = centers[i],
      [c, d] = centers[i + 1];
    carve(Math.min(a, c), b - 1, Math.abs(c - a) + 1, 3);
    carve(c - 1, Math.min(b, d), 3, Math.abs(d - b) + 1);
  }
  carve(5, mid - 1, n - 10, 3);
  carve(mid - 1, 5, 3, n - 10);
  for (const [cx, cy] of centers)
    for (let i = 0; i < 3; i++) {
      const x = cx + Math.floor(rng() * 7) - 3,
        y = cy + Math.floor(rng() * 7) - 3;
      if (Math.abs(x - cx) > 1 && Math.abs(y - cy) > 1) g[y][x] = 1;
    }
  return g;
}
const isWall = (grid, x, y) =>
  !grid ||
  y < 0 ||
  x < 0 ||
  y >= grid.length ||
  x >= grid.length ||
  grid[Math.floor(y)][Math.floor(x)] === 1;
function lineClear(grid, ax, ay, bx, by) {
  const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * 7);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isWall(grid, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}
function spawnCells(map) {
  const cells = [];
  for (let y = 2; y < map.length - 2; y++)
    for (let x = 2; x < map.length - 2; x++)
      if (!map[y][x]) cells.push({ x: x + 0.5, y: y + 0.5 });
  return cells;
}
const randomCell = (cells) =>
  cells[Math.floor(Math.random() * cells.length)] || { x: 1.5, y: 1.5 };
function validMove(map, x, y, r = 0.28) {
  return (
    !isWall(map, x - r, y - r) &&
    !isWall(map, x + r, y - r) &&
    !isWall(map, x - r, y + r) &&
    !isWall(map, x + r, y + r)
  );
}
class World {
  constructor(
    config,
    players,
    matchWins,
    round = 1,
    seed = Math.floor(Math.random() * 1e8),
  ) {
    this.config = config;
    this.mode = config.mode;
    this.round = round;
    this.seed = seed;
    this.map = generateMaze(
      config.mapSize === "large" ? 51 : config.mapSize === "small" ? 29 : 39,
      seed,
    );
    this.size = this.map.length;
    this.cells = spawnCells(this.map);
    this.started = Date.now();
    this.endsAt = this.started + config.duration * 1000;
    this.phase = "playing";
    this.paused = false;
    this.pauseStarted = 0;
    this.last = Date.now();
    this.players = new Map();
    this.bullets = [];
    this.drops = [];
    this.terminals = [];
    this.gates = [];
    this.smokes = [];
    this.monsters = [];
    this.lamps = [];
    this.pathCache = new Map();
    this.pathCacheAt = 0;
    this.events = [];
    this.eventNum = 0;
    this.nextBullet = 0;
    this.matchWins = matchWins || [0, 0];
    this.bomb = {
      planted: false,
      expiresAt: 0,
      site: this.near({ x: this.size / 2, y: this.size / 2 }),
      carrier: null,
    };
    this.exit = this.near({ x: this.size - 3.5, y: this.size - 3.5 });
    this.meeting = null;
    this.sabotageEndsAt = 0;
    this.sabotageTeam = -1;
    this.roundWinner = null;
    this.roundReason = "";
    this.roundEndAt = 0;
    this.lastSignal = 0;
    this.lastDropAt = Date.now();
    this.quizSeen = new Set();
    this.placeObjects();
    this.addPlayers(players);
    this.createLights();
    this.spawnMonsters();
    this.buyEndsAt = this.config.practice ? 0 : Date.now() + 6000;
    this.props = [];
    this.decorate();
  }
  near(pos) {
    let b = this.cells[0],
      d = Infinity;
    for (const cell of this.cells) {
      const v = distance(pos, cell);
      if (v < d) {
        b = cell;
        d = v;
      }
    }
    return { x: b.x, y: b.y };
  }
  placeObjects() {
    const candidates = [...this.cells].sort(() => Math.random() - 0.5);
    const isFar = (x, y) =>
      distance({ x, y }, this.bomb.site) > 3 &&
      distance({ x, y }, this.exit) > 2.8;
    for (const c of candidates) {
      if (
        this.config.puzzles &&
        this.terminals.length <
          Math.min(9, Math.max(5, Math.floor(this.size / 5))) &&
        isFar(c.x, c.y) &&
        this.terminals.every((t) => distance(t, c) > 5)
      ) {
        this.terminals.push({
          id: "term" + this.terminals.length,
          x: c.x,
          y: c.y,
          quiz: this.nextQuiz(),
          solved: false,
          by: null,
        });
      }
      if (
        this.drops.length < Math.floor(this.size * 0.45) &&
        isFar(c.x, c.y) &&
        this.drops.every((d) => distance(d, c) > 2.4)
      )
        this.drops.push({
          id: uid(),
          x: c.x,
          y: c.y,
          kind: [
            "cash",
            "cash",
            "ammo",
            "medkit",
            "armor",
            "weapon",
            "scanner",
            "energy",
          ][Math.floor(Math.random() * 8)],
          amount: 90 + Math.floor(rand(0, 5)) * 30,
        });
      if (
        this.terminals.length >= 8 &&
        this.drops.length >= Math.floor(this.size * 0.45)
      )
        break;
    }
    for (const c of candidates) {
      if (this.gates.length >= 4) break;
      if (
        isFar(c.x, c.y) &&
        this.gates.every((g) => distance(g, c) > 6) &&
        this.terminals.every((t) => distance(t, c) > 2.2)
      ) {
        this.gates.push({
          id: "gate" + this.gates.length,
          x: c.x,
          y: c.y,
          locked: true,
        });
      }
    }
  }

  nextQuiz() {
    this.quizSeen ||= new Set();
    if (this.quizSeen.size >= QUIZZES.length) this.quizSeen.clear();
    if (!this.quizDeck?.length) {
      this.quizDeck = Array.from(
        { length: QUIZZES.length },
        (_, i) => i,
      ).filter((id) => !this.quizSeen.has(id));
      for (let i = this.quizDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.quizDeck[i], this.quizDeck[j]] = [
          this.quizDeck[j],
          this.quizDeck[i],
        ];
      }
    }
    const id = this.quizDeck.pop();
    this.quizSeen.add(id);
    return id;
  }
  createLights() {
    let seq = 0;
    for (let y = 3; y < this.size - 3; y += 4)
      for (let x = 3; x < this.size - 3; x += 4) {
        const cx = x + (hash(x, y, this.seed) % 4),
          cy = y + (hash(y, x, this.seed) % 4);
        if (!this.map[cy]?.[cx] && hash(cx, cy, this.seed) % 3 !== 0)
          this.lamps.push({
            x: cx + 0.5,
            y: cy + 0.5,
            r: 2.7 + (hash(cy, cx, this.seed) % 5) * 0.14,
            color: seq++ % 5 === 0 ? "amber" : "mint",
          });
      }
  }
  spawnMonsters() {
    const total =
      { none: 0, few: 4, normal: 8, horde: 15 }[this.config.monsters] || 0;
    const occupants = [...this.players.values()];
    const cells = [...this.cells].sort(() => Math.random() - 0.5);
    for (const c of cells) {
      if (this.monsters.length >= total) break;
      if (
        occupants.some((p) => distance(p, c) < 3) ||
        this.monsters.some((m) => distance(m, c) < 1.8) ||
        distance(c, this.exit) < 2
      )
        continue;
      const kind = ["walker", "brute", "stalker", "toxic", "runner", "boss"][
        this.monsters.length % 6
      ];
      this.monsters.push({
        id: "creature-" + this.monsters.length,
        x: c.x,
        y: c.y,
        a: 0,
        hp: kind === "boss" ? 340 : kind === "brute" ? 145 : 70,
        maxHp: kind === "boss" ? 340 : kind === "brute" ? 145 : 70,
        alive: true,
        kind,
        attackAt: 0,
        pathAt: 0,
        stepDir: null,
      });
    }
  }
  flowTo(target) {
    const tx = Math.floor(target.x),
      ty = Math.floor(target.y),
      n = this.size,
      key = tx + "," + ty;
    if (Date.now() - this.pathCacheAt > 800) {
      this.pathCache.clear();
      this.pathCacheAt = Date.now();
    }
    if (this.pathCache.has(key)) return this.pathCache.get(key);
    const dist = new Int16Array(n * n).fill(-1),
      queue = new Int32Array(n * n),
      start = ty * n + tx;
    dist[start] = 0;
    queue[0] = start;
    let head = 0,
      tail = 1;
    while (head < tail) {
      const i = queue[head++],
        x = i % n,
        y = Math.floor(i / n);
      for (const k of [1, -1, n, -n]) {
        const v = i + k;
        const nx = v % n,
          ny = Math.floor(v / n);
        if (
          v < 0 ||
          v >= n * n ||
          Math.abs(nx - x) + Math.abs(ny - y) !== 1 ||
          this.map[ny][nx] ||
          dist[v] >= 0
        )
          continue;
        dist[v] = dist[i] + 1;
        queue[tail++] = v;
      }
    }
    this.pathCache.set(key, dist);
    return dist;
  }
  moveMonsters(dt, now) {
    const live = [...this.players.values()].filter((p) => p.alive && p.active);
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const speed =
        {
          walker: 1.05,
          brute: 0.85,
          stalker: 1.65,
          toxic: 1.1,
          runner: 2.4,
          boss: 0.8,
        }[m.kind] || 1.3;
      const nearest = live
        .filter(
          (p) =>
            distance(m, p) < 12 &&
            (this.sight(m, p) ||
              (now - p.lastFire < 600 && distance(m, p) < 9)),
        )
        .sort((a, b) => distance(m, a) - distance(m, b))[0];
      if (nearest) {
        m.target = { x: nearest.x, y: nearest.y };
        m.memoryUntil = now + 4000;
        m.state = "chase";
      } else if (m.target && now < m.memoryUntil) m.state = "search";
      else {
        m.state = "patrol";
        if (
          !m.target ||
          distance(m, m.target) < 0.3 ||
          now > (m.patrolUntil || 0)
        ) {
          m.target = this.cells[Math.floor(Math.random() * this.cells.length)];
          m.patrolUntil = now + 5000;
        }
      }
      if (nearest && distance(m, nearest) < 0.8 && this.sight(m, nearest)) {
        m.state = "attack";
        if (now > m.attackAt) {
          m.attackAt = now + (m.kind === "runner" ? 900 : 1400);
          this.damage(
            nearest,
            m.kind === "boss" ? 30 : m.kind === "brute" ? 20 : 10,
            m.id,
          );
        }
        continue;
      }
      const t = m.target;
      if (!t) continue;
      let dest = t;
      if (!this.sight(m, t)) {
        const field = this.flowTo(t),
          x = Math.floor(m.x),
          y = Math.floor(m.y);
        let best = Infinity;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const xx = x + dx,
            yy = y + dy;
          if (isWall(this.map, xx + 0.5, yy + 0.5)) continue;
          const d = field[yy * this.size + xx];
          if (d >= 0 && d < best) {
            best = d;
            dest = { x: xx + 0.5, y: yy + 0.5 };
          }
        }
      }
      const dx = dest.x - m.x,
        dy = dest.y - m.y,
        len = Math.hypot(dx, dy);
      if (len > 0.08) {
        m.a = Math.atan2(dy, dx);
        const step = Math.min(len, speed * dt);
        if (this.collide(m.x + (dx / len) * step, m.y, 0.2))
          m.x += (dx / len) * step;
        if (this.collide(m.x, m.y + (dy / len) * step, 0.2))
          m.y += (dy / len) * step;
      }
    }
  }
  hitMonster(m, damage, owner) {
    if (!m.alive) return;
    m.hp = Math.max(0, m.hp - damage);
    this.event("monster_hit", { x: m.x, y: m.y });
    if (m.hp > 0) return;
    m.alive = false;
    const p = this.getPlayer(owner);
    if (p) {
      p.credits = clamp(p.credits + (m.kind === "brute" ? 160 : 80), 0, 9999);
      p.score += m.kind === "brute" ? 110 : 60;
    }
    const rewards = ["ammo", "cash", "medkit", "armor", "weapon", "energy"];
    this.drops.push({
      id: uid(),
      x: m.x,
      y: m.y,
      kind: rewards[Math.floor(Math.random() * rewards.length)],
      amount: 90 + Math.floor(rand(0, 5)) * 30,
    });
    this.event("monster_death", { x: m.x, y: m.y, team: 2, kindType: m.kind });
  }
  rollChest() {
    const rewards = [
      "cash",
      "cash",
      "ammo",
      "ammo",
      "medkit",
      "armor",
      "energy",
      "scanner",
      "weapon",
      "weapon",
      "key",
    ];
    return rewards[Math.floor(Math.random() * rewards.length)];
  }
  addPlayers(raw) {
    const order = [...raw]
      .filter((p) => p.participates)
      .sort((a, b) => a.joined - b.joined || a.id.localeCompare(b.id));
    const occupied = [];
    for (let i = 0; i < order.length; i++) {
      const u = order[i];
      let team = this.mode === "team" || this.mode === "double" ? i % 2 : -1;
      const target =
        team === 0
          ? { x: 3, y: 3 }
          : team === 1
            ? { x: this.size - 4, y: this.size - 4 }
            : { x: rand(4, this.size - 4), y: rand(4, this.size - 4) };
      let pool = this.cells.filter(
        (c) =>
          distance(c, target) <
            (this.mode === "team" || this.mode === "double" ? 8 : this.size) &&
          occupied.every((o) => distance(o, c) > 3.2),
      );
      if (!pool.length)
        pool = this.cells.filter((c) =>
          occupied.every((o) => distance(o, c) > 2),
        );
      const cell = randomCell(pool.length ? pool : this.cells);
      occupied.push(cell);
      const previous = u.stats || {};
      const p = {
        id: u.id,
        name: u.name,
        team,
        role: "operative",
        color: team < 0 ? colorFor(i) : TEAMS[team].color,
        x: cell.x,
        y: cell.y,
        a: 0,
        hp: 100,
        armor: 0,
        lives: this.config.lives,
        alive: true,
        respawnAt: 0,
        kills: previous.kills || 0,
        deaths: previous.deaths || 0,
        assists: previous.assists || 0,
        score: previous.score || 0,
        credits: clamp(previous.credits ?? 700, 0, 9999),
        inventory: {
          pistol: { mag: 12, reserve: this.config.ammo === "scarce" ? 12 : 36 },
        },
        weapon: "pistol",
        items: { scanner: 0, smoke: 0, key: 0, medkit: 0 },
        pieces: previous.pieces || 0,
        meetingsLeft: 1,
        stamina: 100,
        input: { dx: 0, dy: 0, aim: 0, fire: false, run: false },
        lastFire: 0,
        reloadAt: 0,
        lastSpecial: 0,
        scannerEndsAt: 0,
        lastAttacker: null,
        lastDamageAt: 0,
        taskCount: 0,
        joined: u.joined,
        active: true,
      };
      if (this.mode === "impostor") {
        p.inventory = { pistol: { mag: 0, reserve: 0 } };
        p.credits = 0;
      }
      this.players.set(p.id, p);
    }
    const active = [...this.players.values()];
    if (this.mode === "impostor" && active.length >= 2) {
      const n = Math.max(1, Math.floor(active.length / 5));
      const arr = [...active].sort(() => Math.random() - 0.5);
      arr.slice(0, n).forEach((p) => (p.role = "traitor"));
      active
        .filter((p) => p.role !== "traitor")
        .forEach((p) => (p.role = "crew"));
    }
    if (this.mode === "double" && active.length >= 4)
      for (const team of [0, 1]) {
        const group = active.filter((p) => p.team === team);
        if (group.length > 1) {
          group[Math.floor(Math.random() * group.length)].role = "double";
        }
      }
  }
  event(kind, more = {}) {
    const e = { id: ++this.eventNum, kind, time: Date.now(), ...more };
    this.events.push(e);
    if (this.events.length > 100) this.events.shift();
    return e;
  }
  collide(x, y, r = 0.26) {
    return (
      validMove(this.map, x, y, r) &&
      !this.gates.some(
        (g) =>
          g.locked &&
          Math.abs(x - g.x) < 0.43 + r &&
          Math.abs(y - g.y) < 0.43 + r,
      ) &&
      !(this.props || []).some(
        (p) =>
          p.solid &&
          Math.abs(x - p.x) < p.radius + r &&
          Math.abs(y - p.y) < p.radius + r,
      )
    );
  }
  getPlayer(id) {
    return this.players.get(id);
  }
  setInput(id, d) {
    const p = this.getPlayer(id);
    if (!p || !p.alive) return;
    p.input = {
      dx: clamp(Number(d.dx) || 0, -1, 1),
      dy: clamp(Number(d.dy) || 0, -1, 1),
      aim: Number.isFinite(d.aim) ? d.aim : 0,
      fire: !!d.fire,
      run: !!d.run,
    };
    p.seq = Number.isSafeInteger(d.seq) ? d.seq : p.seq || 0;
    p.inputAt = Date.now();
  }
  step(dt) {
    if (this.paused || this.phase === "round_end" || this.phase === "match_end")
      return;
    const now = Date.now();
    this.smokes = this.smokes.filter((s) => s.until > now);
    if (this.phase === "meeting") {
      if (now > this.meeting.endsAt) this.resolveMeeting();
      return;
    }
    for (const p of this.players.values()) {
      if (!p.alive) {
        if (
          p.lives > 0 &&
          p.respawnAt &&
          now > p.respawnAt &&
          this.phase === "playing"
        ) {
          const cell = this.near({
            x: p.team === 0 ? 2 : this.size - 3,
            y: p.team === 1 ? this.size - 3 : 3,
          });
          p.x = cell.x;
          p.y = cell.y;
          p.hp = 100;
          p.armor = 0;
          p.inventory = { pistol: { mag: 12, reserve: 24 } };
          p.alive = true;
          p.respawnAt = 0;
          p.input.fire = false;
          this.event("respawn", { player: p.name, x: p.x, y: p.y });
        }
        continue;
      }
      if (p.reloadAt && now >= p.reloadAt) {
        const gun = p.inventory[p.weapon];
        if (gun) {
          const w = WEAPONS[p.weapon],
            taken = Math.min(w.mag - gun.mag, gun.reserve);
          gun.mag += taken;
          gun.reserve -= taken;
        }
        p.reloadAt = 0;
      }
      if (now - (p.inputAt || now) > 300)
        p.input = { dx: 0, dy: 0, aim: p.a, fire: false, run: false };
      const ix = p.input.dx,
        iy = p.input.dy,
        mag = Math.hypot(ix, iy),
        run = p.input.run && p.stamina > 3,
        spd = (run ? 4.8 : 3.25) * dt,
        nx = ix / mag || 0,
        ny = iy / mag || 0;
      if (mag > 0.01 && now > this.buyEndsAt) {
        if (this.collide(p.x + nx * spd, p.y)) p.x += nx * spd;
        if (this.collide(p.x, p.y + ny * spd)) p.y += ny * spd;
      }
      p.stamina = clamp(
        p.stamina + (run && mag > 0.01 ? -35 : 20) * dt,
        0,
        100,
      );
      p.a = p.input.aim;
      if (p.input.fire && now > this.buyEndsAt && this.mode !== "impostor")
        this.fire(p, now);
      // Health is never regenerated automatically: the medkit economy matters.
    }
    if (now > this.buyEndsAt) this.moveMonsters(dt, now);
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      let removed = false,
        steps = Math.max(2, Math.ceil(b.speed * dt * 4));
      for (let j = 0; j < steps; j++) {
        b.x += (b.dx * b.speed * dt) / steps;
        b.y += (b.dy * b.speed * dt) / steps;
        b.life -= dt / steps;
        if (!this.collide(b.x, b.y, 0.03) || b.life <= 0) {
          removed = true;
          this.event("impact", { x: b.x, y: b.y });
          break;
        }
        for (const p of this.players.values()) {
          if (!p.alive || p.id === b.owner || this.mode === "impostor")
            continue;
          if (
            p.team !== -1 &&
            p.team === b.team &&
            !this.config.friendly &&
            !(this.mode === "double" && b.betrayal)
          )
            continue;
          if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < 0.38 ** 2) {
            removed = true;
            this.damage(p, b.damage, b.owner);
            this.event("impact", { x: b.x, y: b.y });
            break;
          }
        }
        if (!removed)
          for (const m of this.monsters) {
            if (!m.alive) continue;
            if ((m.x - b.x) ** 2 + (m.y - b.y) ** 2 < 0.4 ** 2) {
              removed = true;
              this.hitMonster(m, b.damage, b.owner);
              this.event("impact", { x: b.x, y: b.y });
              break;
            }
          }
        if (removed) break;
      }
      if (removed) this.bullets.splice(i, 1);
    }
    if (this.bomb.planted && now >= this.bomb.expiresAt) {
      this.event("bomb", {
        x: this.bomb.site.x,
        y: this.bomb.site.y,
        msg: "DATA CORE PORTLADI",
      });
      this.endRound("QIZILLAR", "DATA CORE faollashtirildi");
      return;
    }
    if (now >= this.endsAt) {
      this.expireRound();
      return;
    }
    this.checkVictory();
  }
  fire(p, now) {
    const w = WEAPONS[p.weapon],
      g = p.inventory[p.weapon];
    if (!g || p.reloadAt || now - p.lastFire < w.delay) return;
    if (g.mag <= 0) {
      this.reload(p);
      return;
    }
    g.mag--;
    p.lastFire = now;
    let angle = p.a;
    for (let k = 0; k < w.pellets; k++) {
      const a = angle + rand(-w.spread, w.spread);
      this.bullets.push({
        id: ++this.nextBullet,
        owner: p.id,
        team: p.team,
        betrayal: p.role === "double",
        x: p.x + Math.cos(a) * 0.36,
        y: p.y + Math.sin(a) * 0.36,
        dx: Math.cos(a),
        dy: Math.sin(a),
        speed: w.speed,
        damage: w.damage,
        life: w.range / w.speed,
        weapon: p.weapon,
      });
    }
    this.event("shot", { x: p.x, y: p.y, a: angle, player: p.id });
    if (this.bullets.length > 350) this.bullets.splice(0, 40);
  }
  reload(p) {
    const g = p.inventory[p.weapon],
      w = WEAPONS[p.weapon];
    if (!g || g.mag >= w.mag || g.reserve < 1 || p.reloadAt) return false;
    p.reloadAt = Date.now() + w.load;
    return true;
  }
  damage(p, damage, from) {
    if (!p.alive) return;
    const absorbed = Math.min(p.armor, damage * 0.55);
    p.armor -= absorbed;
    p.hp = Math.max(0, Math.round(p.hp - (damage - absorbed)));
    p.lastAttacker = from;
    p.lastDamageAt = Date.now();
    this.event("hit", { x: p.x, y: p.y, target: p.id, damage });
    if (p.hp <= 0) this.kill(p, from);
  }
  kill(p, attacker, reason = "shot") {
    if (!p.alive) return;
    p.alive = false;
    p.hp = 0;
    p.deaths++;
    p.lives = Math.max(0, p.lives - 1);
    p.respawnAt = p.lives > 0 ? Date.now() + 3200 : 0;
    p.input.fire = false;
    const a = this.getPlayer(attacker);
    if (a && a.id !== p.id) {
      a.kills++;
      a.score += 125;
      a.credits = clamp(a.credits + 220, 0, 9999);
    }
    if (this.mode !== "impostor") {
      this.drops.push({
        id: uid(),
        x: p.x,
        y: p.y,
        kind: "corpse",
        amount: Math.floor(p.credits * 0.42),
        from: p.id,
        weapon: p.weapon,
        ammo: p.inventory[p.weapon] ? { ...p.inventory[p.weapon] } : null,
        armor: p.armor,
        items: { ...p.items },
      });
      p.credits = Math.floor(p.credits * 0.58);
    }
    p.inventory = { pistol: { mag: 0, reserve: 0 } };
    p.weapon = "pistol";
    p.items = { scanner: 0, smoke: 0, key: 0, medkit: 0 };
    p.reloadAt = 0;
    this.event("death", {
      x: p.x,
      y: p.y,
      player: p.name,
      killer: a?.name || "LABIRINT",
      target: p.id,
      reason,
      team: p.team,
    });
    this.checkVictory();
  }
  command(id, msg) {
    const p = this.getPlayer(id);
    if (!p) return;
    const type = msg.action;
    const now = Date.now();
    if (type === "vote") {
      if (this.meeting && p.alive && !Object.hasOwn(this.meeting.votes, id)) {
        const target = msg.target;
        if (target !== "skip" && !this.players.get(target)?.alive) return;
        this.meeting.votes[id] = target;
        this.event("vote", { player: p.name });
        if (
          Object.keys(this.meeting.votes).length >=
          [...this.players.values()].filter((v) => v.alive).length
        )
          this.resolveMeeting();
      }
      return;
    }
    if (type === "chat") {
      if (this.meeting && p.alive) {
        const message = String(msg.text || "")
          .replace(/[<>\x00-\x1f]/g, "")
          .trim()
          .slice(0, 100);
        if (message && this.meeting.messages.length < 75)
          this.meeting.messages.push({
            id: uid(),
            name: p.name,
            text: message,
          });
      }
      return;
    }
    if (type === "cancelPuzzle") {
      const t = this.terminals.find(
        (t) => t.id === msg.terminal && t.reservedBy === p.id,
      );
      if (t) {
        t.reservedBy = null;
        t.reservedUntil = 0;
      }
      return;
    }
    if (!p.alive || this.phase !== "playing" || this.paused) return;
    if (type === "reload") {
      this.reload(p);
      return;
    }
    if (type === "equip") {
      const weapon = String(msg.weapon);
      if (WEAPONS[weapon] && p.inventory[weapon]) {
        p.weapon = weapon;
        p.reloadAt = 0;
      }
      return;
    }
    if (type === "buy") {
      this.buy(p, String(msg.item));
      return;
    }
    if (type === "interact") {
      this.interact(p);
      return;
    }
    if (type === "solve") {
      this.solve(p, msg);
      return;
    }
    if (type === "special") {
      this.special(p);
      return;
    }
    if (type === "meeting" && this.mode === "impostor" && p.meetingsLeft > 0) {
      this.startMeeting(p);
      return;
    }
    if (type === "useMed" && p.items.medkit > 0) {
      p.items.medkit--;
      p.hp = clamp(p.hp + 60, 0, 100);
      this.event("heal", { x: p.x, y: p.y });
      return;
    }
  }
  buy(p, id) {
    if (!this.config.practice && Date.now() > this.buyEndsAt) return;
    const item = SHOP.find((a) => a.id === id);
    if (!item || p.credits < item.cost || this.mode === "impostor") return;
    p.credits -= item.cost;
    if (item.kind === "gun") {
      const w = WEAPONS[id];
      if (p.inventory[id]) {
        p.inventory[id].reserve = clamp(
          p.inventory[id].reserve + w.mag,
          0,
          250,
        );
      } else
        p.inventory[id] = {
          mag: w.mag,
          reserve: this.config.ammo === "scarce" ? w.mag : w.reserve,
        };
      p.weapon = id;
      p.reloadAt = 0;
    } else if (id === "ammo") {
      const w = WEAPONS[p.weapon],
        g = p.inventory[p.weapon];
      g.reserve = clamp(g.reserve + w.mag * 2, 0, 250);
    } else if (id === "medkit") p.items.medkit = (p.items.medkit || 0) + 1;
    else if (id === "armor") p.armor = clamp(p.armor + 50, 0, 100);
    else if (id === "scanner") {
      p.items.scanner++;
      p.scannerEndsAt = Date.now() + 8000;
      p.items.scanner--;
    } else if (id === "smoke") {
      this.smokes.push({
        x: p.x + Math.cos(p.a) * 1.1,
        y: p.y + Math.sin(p.a) * 1.1,
        until: Date.now() + 10000,
      });
      this.event("smoke", { x: p.x, y: p.y });
    } else if (id === "energy") p.stamina = 100;
    else if (id === "key") {
      p.items.key++;
      p.pieces++;
    }
    this.event("purchase", { x: p.x, y: p.y, player: p.name, item: item.name });
  }
  interact(p) {
    if (this.mode === "team" || this.mode === "double") {
      if (
        distance(p, this.bomb.site) < 1.9 &&
        this.sight(p, this.bomb.site) &&
        Date.now() > this.buyEndsAt
      ) {
        if (p.team === 0 && !this.bomb.planted) {
          this.bomb.planted = true;
          this.bomb.expiresAt = Date.now() + 35000;
          this.event("bomb", {
            x: this.bomb.site.x,
            y: this.bomb.site.y,
            msg: "DATA CORE FAOLLASHTIRILDI",
          });
          return;
        }
        if (p.team === 1 && this.bomb.planted) {
          this.bomb.planted = false;
          this.event("bomb", {
            x: this.bomb.site.x,
            y: this.bomb.site.y,
            msg: "DATA CORE ZARARSIZLANTIRILDI",
          });
          this.endRound("KO‘KLAR", "Data core zararsizlantirildi");
          return;
        }
      }
    }
    if (this.mode === "escape" && distance(p, this.exit) < 1.7) {
      if (p.pieces >= 3)
        this.endRound(p.name, "Labirintdan muvaffaqiyatli chiqdi");
      else
        this.event("hint", {
          target: p.id,
          msg: `Chiqish uchun ${Math.max(0, 3 - p.pieces)} ta kod-parcha kerak`,
        });
      return;
    }
    const gate = this.gates.find((g) => g.locked && distance(g, p) < 1.65);
    if (gate) {
      if (p.items.key > 0) {
        p.items.key--;
        gate.locked = false;
        this.event("gate", {
          x: gate.x,
          y: gate.y,
          msg: "YASHIRIN ESHIK OCHILDI",
          player: p.name,
        });
      } else
        this.event("hint", {
          target: p.id,
          msg: "ESHIKNI OCHISH UCHUN KALIT KERAK",
        });
      return;
    }
    const loot = this.drops.find((d) => distance(d, p) < 1.25);
    if (loot && this.sight(p, loot)) {
      this.pickup(p, loot);
      return;
    }
    const task = this.terminals.find((t) => !t.solved && distance(t, p) < 1.5);
    if (task && this.sight(p, task)) {
      if (
        task.reservedBy &&
        task.reservedBy !== p.id &&
        task.reservedUntil > Date.now()
      ) {
        this.event("hint", {
          target: p.id,
          msg: "Terminal band. Biroz kuting.",
        });
        return;
      }
      task.reservedBy = p.id;
      task.reservedUntil = Date.now() + 45000;
      this.openPuzzle(p, task);
      return;
    }
    this.event("hint", {
      target: p.id,
      msg: "Yaqiningizda olinadigan resurs yo‘q",
    });
  }
  pickup(p, d) {
    if (!this.drops.includes(d)) return;
    this.drops = this.drops.filter((a) => a.id !== d.id);
    if (d.kind === "chest") {
      const reward = d.reward || "cash";
      if (reward === "cash")
        p.credits = clamp(p.credits + (d.amount || 240), 0, 9999);
      else if (reward === "ammo")
        p.inventory[p.weapon].reserve = clamp(
          p.inventory[p.weapon].reserve + WEAPONS[p.weapon].mag * 3,
          0,
          250,
        );
      else if (reward === "medkit") p.items.medkit = (p.items.medkit || 0) + 2;
      else if (reward === "armor") p.armor = clamp(p.armor + 70, 0, 100);
      else if (reward === "energy") p.stamina = 100;
      else if (reward === "scanner") p.scannerEndsAt = Date.now() + 12000;
      else if (reward === "key") p.items.key = (p.items.key || 0) + 2;
      else if (reward === "weapon") {
        const id = ["smg", "rifle", "shotgun", "sniper"][
          Math.floor(Math.random() * 4)
        ];
        p.inventory[id] = {
          mag: WEAPONS[id].mag,
          reserve: WEAPONS[id].reserve,
        };
        p.weapon = id;
      }
      this.event("chest_open", {
        target: p.id,
        x: d.x,
        y: d.y,
        msg: "SANDIQ: " + reward.toUpperCase(),
        reward,
      });
    } else if (d.kind === "corpse") {
      p.credits = clamp(p.credits + (d.amount || 0), 0, 9999);
      p.armor = clamp(p.armor + Math.round((d.armor || 0) * 0.5), 0, 100);
      if (d.weapon && d.weapon !== "pistol" && d.ammo) {
        p.inventory[d.weapon] = { mag: d.ammo.mag, reserve: d.ammo.reserve };
        p.weapon = d.weapon;
      } else if (d.ammo) {
        p.inventory[p.weapon].reserve = clamp(
          p.inventory[p.weapon].reserve + d.ammo.reserve,
          0,
          250,
        );
      }
      p.items.key = (p.items.key || 0) + Math.min(2, d.items?.key || 0);
      p.items.medkit =
        (p.items.medkit || 0) + Math.min(2, d.items?.medkit || 0);
    } else if (d.kind === "cash")
      p.credits = clamp(p.credits + d.amount, 0, 9999);
    else if (d.kind === "ammo")
      p.inventory[p.weapon].reserve = clamp(
        p.inventory[p.weapon].reserve + WEAPONS[p.weapon].mag * 2,
        0,
        250,
      );
    else if (d.kind === "medkit") p.items.medkit = (p.items.medkit || 0) + 1;
    else if (d.kind === "armor") p.armor = clamp(p.armor + 40, 0, 100);
    else if (d.kind === "energy") p.stamina = 100;
    else if (d.kind === "scanner") p.scannerEndsAt = Date.now() + 7000;
    else if (d.kind === "weapon") {
      const w = ["smg", "rifle", "shotgun"][Math.floor(rand(0, 3))];
      p.inventory[w] = { mag: WEAPONS[w].mag, reserve: WEAPONS[w].mag };
      p.weapon = w;
    }
    this.event("pickup", {
      x: d.x,
      y: d.y,
      player: p.name,
      kind: d.kind,
      target: p.id,
    });
  }
  solve(p, msg) {
    const t = this.terminals.find((q) => q.id === msg.terminal);
    if (
      !t ||
      t.solved ||
      distance(t, p) > 1.7 ||
      !this.config.puzzles ||
      !Number.isInteger(msg.answer) ||
      msg.answer < 0 ||
      msg.answer > 3 ||
      t.reservedBy !== p.id ||
      t.reservedUntil < Date.now() ||
      msg.quiz !== t.quiz ||
      !this.sight(p, t)
    )
      return;
    const q = QUIZZES[t.quiz];
    if (!q) return;
    if (msg.answer === q.correct) {
      t.solved = true;
      t.by = p.name;
      p.pieces++;
      p.taskCount++;
      p.score += 160;
      const reward = this.rollChest();
      this.drops.push({
        id: uid(),
        x: t.x,
        y: t.y,
        kind: "chest",
        reward,
        amount: 200 + Math.floor(rand(0, 5)) * 60,
      });
      this.event("solved", {
        x: t.x,
        y: t.y,
        player: p.name,
        target: p.id,
        reward: "SANDIQ OCHILDI",
      });
      this.checkVictory();
    } else {
      t.quiz = this.nextQuiz();
      t.reservedUntil = Date.now() + 45000;
      this.event("hint", {
        target: p.id,
        msg: "NOTO‘G‘RI · BOSHQA SAVOL BERILDI",
      });
      this.openPuzzle(p, t);
    }
  }
  special(p) {
    const now = Date.now();
    if (now - p.lastSpecial < 14000) return;
    if (this.mode === "impostor" && p.role === "traitor") {
      const victims = [...this.players.values()].filter(
        (e) =>
          e.alive &&
          e.id !== p.id &&
          e.role !== "traitor" &&
          distance(e, p) < 1.55 &&
          lineClear(this.map, p.x, p.y, e.x, e.y),
      );
      victims.sort((a, b) => distance(a, p) - distance(b, p));
      if (victims[0]) {
        p.lastSpecial = now;
        this.kill(victims[0], p.id, "silent");
      } else {
        p.lastSpecial = now;
        this.sabotageEndsAt = now + 11000;
        this.event("sabotage", { x: p.x, y: p.y, msg: "ELEKTR O‘CHDI" });
      }
      return;
    }
    if (this.mode === "double" && p.role === "double") {
      p.lastSpecial = now;
      this.sabotageEndsAt = now + 12000;
      this.sabotageTeam = p.team;
      p.credits = clamp(p.credits + 150, 0, 9999);
      this.event("sabotage", { x: p.x, y: p.y, msg: "COMMS JAMMED" });
      return;
    }
    if (p.items.key > 0) {
      p.items.key--;
      p.armor = clamp(p.armor + 15, 0, 100);
      this.event("shield", { x: p.x, y: p.y });
    }
  }
  startMeeting(p) {
    if (this.meeting || p.meetingsLeft < 1) return;
    p.meetingsLeft--;
    this.phase = "meeting";
    this.meeting = {
      calledBy: p.name,
      startedAt: Date.now(),
      endsAt: Date.now() + 32000,
      votes: {},
      messages: [
        {
          id: uid(),
          name: "SYSTEM",
          text: p.name + " yig‘ilish chaqirdi. Kimdan shubhalanasiz?",
        },
      ],
    };
    this.event("meeting", { msg: p.name + " emergency meeting chaqirdi" });
  }
  resolveMeeting() {
    if (!this.meeting) return;
    const votes = Object.values(this.meeting.votes).filter((v) => v !== "skip");
    const count = {};
    for (const v of votes) count[v] = (count[v] || 0) + 1;
    const ranks = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const tied = ranks.length > 1 && ranks[0][1] === ranks[1][1];
    const target = !tied ? ranks[0]?.[0] : null;
    const p = target ? this.getPlayer(target) : null;
    if (
      p &&
      ranks[0][1] >=
        Math.ceil([...this.players.values()].filter((v) => v.alive).length / 2)
    ) {
      p.lives = 1;
      this.kill(p, null, "voted");
      this.event("meeting_result", { msg: p.name + " chiqarildi" });
    } else this.event("meeting_result", { msg: "Hech kim chiqarilmadi" });
    this.endsAt += Date.now() - this.meeting.startedAt;
    this.meeting = null;
    this.phase = "playing";
    this.checkVictory();
  }
  checkVictory() {
    if (this.phase !== "playing") return;
    const list = [...this.players.values()];
    if (!list.length) return;
    if (this.mode === "impostor") {
      const alive = list.filter((p) => p.alive || p.lives > 0),
        traitors = alive.filter((p) => p.role === "traitor").length,
        crew = alive.length - traitors;
      if (traitors === 0) {
        this.endRound("AGENTLAR", "Barcha xoinlar aniqlandi");
        return;
      }
      if (traitors >= crew) {
        this.endRound("XOINLAR", "Xoinlar ustunlikka erishdi");
        return;
      }
      if (this.config.puzzles && this.terminals.every((t) => t.solved)) {
        this.endRound("AGENTLAR", "Barcha vazifalar yakunlandi");
        return;
      }
      return;
    }
    if (this.mode === "escape") return;
    if (this.mode === "ffa") {
      const possible = list.filter((p) => p.alive || p.lives > 0);
      if (possible.length === 1 && list.length > 1)
        this.endRound(possible[0].name, "Yagona omon qolgan o‘yinchi");
      return;
    }
    const a = [0, 1].map(
      (team) =>
        list.filter((p) => p.team === team && (p.alive || p.lives > 0)).length,
    );
    if (a[0] === 0 && a[1] === 0) {
      this.endRound("DURANG", "Hech kim omon qolmadi");
      return;
    }
    if (a[0] === 0 && a[1] > 0)
      this.endRound("KO‘KLAR", "Barcha qizil o‘yinchilar mag‘lub bo‘ldi");
    else if (a[1] === 0 && a[0] > 0)
      this.endRound("QIZILLAR", "Barcha ko‘k o‘yinchilar mag‘lub bo‘ldi");
  }
  expireRound() {
    const list = [...this.players.values()];
    if (this.mode === "impostor") {
      this.endRound("XOINLAR", "Vaqt tugadi");
      return;
    }
    if (this.mode === "escape") {
      const sorted = list.sort(
        (a, b) => b.pieces - a.pieces || b.score - a.score,
      );
      this.endRound(
        sorted[0]?.name || "HECH KIM",
        "Vaqt tugadi, eng ko‘p kod topgan g‘olib",
      );
      return;
    }
    if (this.mode === "ffa") {
      list.sort(
        (a, b) => b.kills - a.kills || b.lives - a.lives || b.score - a.score,
      );
      const a = list[0],
        b = list[1];
      this.endRound(
        a &&
          b &&
          a.kills === b.kills &&
          a.lives === b.lives &&
          a.score === b.score
          ? "DURANG"
          : a?.name || "HECH KIM",
        "Vaqt tugadi",
      );
      return;
    }
    if (this.bomb.planted) {
      this.endsAt = Date.now() + 1000;
      return;
    }
    const tally = [0, 1].map((team) =>
      list
        .filter((p) => p.team === team)
        .reduce((n, p) => n + p.kills * 3 + p.lives, 0),
    );
    this.endRound(
      tally[0] > tally[1]
        ? "QIZILLAR"
        : tally[1] > tally[0]
          ? "KO‘KLAR"
          : "DURANG",
      "Vaqt tugadi · jamoaviy ochkolar hisoblandi",
    );
  }
  endRound(winner, reason) {
    if (this.phase === "round_end" || this.phase === "match_end") return;
    this.phase = "round_end";
    this.roundWinner = winner;
    this.roundReason = reason;
    this.roundEndAt = Date.now();
    if (winner === "QIZILLAR") this.matchWins[0]++;
    if (winner === "KO‘KLAR") this.matchWins[1]++;
    this.event("round_end", { winner, reason });
  }
  snapshotFor(id) {
    const now = Date.now(),
      self = this.getPlayer(id);
    if (!self) return null;
    const all = [...this.players.values()];
    // Dead players spectate an alive teammate. Social modes retain their own location.
    const eyes =
      !self.alive && ["team", "double"].includes(this.mode)
        ? all.find((p) => p.alive && p.team === self.team) || self
        : self;
    const radius =
      this.sabotageEndsAt > now &&
      (this.sabotageTeam === -1 || self.team === this.sabotageTeam)
        ? 3
        : 10;
    const visible = (v) => {
      const d = distance(eyes, v);
      if (d > radius || !this.sight(eyes, v)) return false;
      const forward =
        d < 7.4 &&
        Math.cos(Math.atan2(v.y - eyes.y, v.x - eyes.x) - eyes.a) > 0.63;
      const lit = this.lamps.some(
        (l) => distance(l, v) < l.r && this.sight(l, v),
      );
      return (
        d < 1.7 || forward || lit || (self.scannerEndsAt > now && d < radius)
      );
    };
    const publicPlayer = (p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      a: p.a,
      team: p.team,
      color: p.color,
      hp: p.hp,
      alive: p.alive,
      weapon: p.weapon,
      lives: p.lives,
      moving: Math.hypot(p.input.dx, p.input.dy) > 0.01,
      run: p.input.run,
      seq: p.seq || 0,
      reloadAt: p.reloadAt,
      lastFire: p.lastFire,
    });
    const pview = all
      .filter((p) => p.id === id || visible(p))
      .map(publicPlayer);
    const events = this.events
      .filter(
        (e) =>
          e.time > now - 1500 &&
          (e.target ? e.target === id : "x" in e ? visible(e) : true),
      )
      .map((e) => ({ ...e }));
    const me = {
      ...publicPlayer(self),
      armor: self.armor,
      credits: self.credits,
      inventory: structuredClone(self.inventory),
      stamina: self.stamina,
      items: { ...self.items },
      pieces: self.pieces,
      taskCount: self.taskCount,
      role: self.role,
      scannerEndsAt: self.scannerEndsAt,
    };
    return {
      t: "snapshot",
      now,
      mode: this.mode,
      phase: this.phase,
      round: this.round,
      rounds: this.config.rounds,
      endsAt: this.endsAt,
      buyEndsAt: this.buyEndsAt,
      remaining: Math.max(
        0,
        (this.endsAt -
          (this.paused ? this.pauseStarted : this.meeting?.startedAt || now)) /
          1000,
      ),
      paused: this.paused,
      players: pview,
      me,
      eye: eyes.id === self.id ? null : publicPlayer(eyes),
      roster: all.map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        alive: p.alive,
        kills: p.kills,
        deaths: p.deaths,
        score: p.score,
        taskCount: p.taskCount,
      })),
      bullets: this.bullets
        .filter(visible)
        .map((b) => ({ x: b.x, y: b.y, dx: b.dx, dy: b.dy, weapon: b.weapon })),
      monsters: this.monsters
        .filter((m) => m.alive && visible(m))
        .map((m) => ({
          id: m.id,
          x: m.x,
          y: m.y,
          a: m.a,
          hp: m.hp,
          maxHp: m.maxHp,
          kind: m.kind,
          state: m.state,
        })),
      drops: this.drops
        .filter(visible)
        .map((d) => ({ id: d.id, x: d.x, y: d.y, kind: d.kind })),
      terminals: this.terminals
        .filter(visible)
        .map((t) => ({ id: t.id, x: t.x, y: t.y, solved: t.solved })),
      gates: this.gates.map((g) => ({ ...g })),
      lamps: this.lamps,
      props: this.props,
      smokes: this.smokes.filter(visible),
      exit: this.exit,
      bomb: { ...this.bomb },
      events,
      sabotageEndsAt: this.sabotageEndsAt,
      taskTotal: this.terminals.length,
      taskSolved: this.terminals.filter((t) => t.solved).length,
      matchWins: this.matchWins,
      roundWinner: this.roundWinner,
      roundReason: this.roundReason,
      meeting: this.meeting
        ? {
            endsAt: this.meeting.endsAt,
            voted: Object.keys(this.meeting.votes),
            messages: this.meeting.messages,
            calledBy: this.meeting.calledBy,
          }
        : null,
    };
  }
  sight(a, b) {
    if (!lineClear(this.map, a.x, a.y, b.x, b.y)) return false;
    const n = Math.ceil(distance(a, b) * 8);
    for (let i = 1; i < n; i++) {
      const x = a.x + ((b.x - a.x) * i) / n,
        y = a.y + ((b.y - a.y) * i) / n;
      if (
        this.gates.some(
          (g) =>
            g.locked && Math.abs(g.x - x) < 0.42 && Math.abs(g.y - y) < 0.42,
        )
      )
        return false;
    }
    return true;
  }
  openPuzzle(p, t) {
    const q = QUIZZES[t.quiz];
    this.event("puzzle_open", {
      target: p.id,
      terminal: t.id,
      quiz: t.quiz,
      question: { q: q.q, a: q.a },
    });
  }
  decorate() {
    const types = [
      "crate",
      "barrel",
      "sandbags",
      "generator",
      "server",
      "classroom",
      "medical",
      "armory",
      "storage",
      "workbench",
      "camera",
      "power",
    ];
    for (const c of this.cells) {
      const h = hash(c.x * 2, c.y * 2, this.seed);
      if (
        h % 17 !== 0 ||
        this.terminals.some((t) => distance(c, t) < 1.5) ||
        this.gates.some((t) => distance(c, t) < 1.5) ||
        [...this.players.values()].some((p) => distance(c, p) < 1.4) ||
        this.monsters.some((m) => distance(c, m) < 1)
      )
        continue;
      const wallNear =
        isWall(this.map, c.x + 1, c.y) || isWall(this.map, c.x, c.y + 1);
      if (wallNear)
        this.props.push({
          ...c,
          type: types[h % types.length],
          id: "prop-" + h,
          solid: types[h % types.length] !== "camera",
          radius: 0.25,
        });
    }
  }
}


let w,p,lastSeq=0,sendCount=0;const config={mode:'escape',duration:900,lives:5,rounds:1,mapSize:'small',monsters:'few',ammo:'limited',puzzles:true,practice:true};
onmessage=e=>{const m=e.data;if(m.t==='create'){p={id:'local',name:String(m.name||'Operativ'),participates:true,joined:Date.now()};postMessage({t:'welcome',id:p.id,host:p.id,room:'LOCAL'});postMessage({t:'lobby',room:'LOCAL',host:p.id,config,players:[p]});}
if(m.t==='start'){w=new World(config,[p],[0,0],1,145);const actor=w.getPlayer('local');Object.assign(actor,w.near({x:6.5,y:6.5}),{credits:1800,weapon:'rifle',inventory:{pistol:{mag:12,reserve:36},rifle:{mag:30,reserve:90}}});w.gates=[];w.terminals=[{id:'training-terminal',...w.near({x:actor.x+1,y:actor.y+1}),quiz:w.nextQuiz(),solved:false},...w.terminals.slice(0,4)];w.drops.unshift({id:uid(),...w.near({x:actor.x-1,y:actor.y+1}),kind:'chest',reward:'ammo'});w.lamps.push({x:actor.x,y:actor.y,r:5,color:'amber'});if(w.monsters.length)Object.assign(w.monsters[0],w.near({x:actor.x+4,y:actor.y}));postMessage({t:'map',map:w.map,config,room:'LOCAL'});postMessage(w.snapshotFor('local'));}
if(m.t==='input'&&w)w.setInput('local',m.input);
if(m.t==='command'&&w)w.command('local',m);
if(m.t==='pause'&&w){if(w.paused)w.endsAt+=Date.now()-w.pauseStarted;else w.pauseStarted=Date.now();w.paused=!w.paused;}
};setInterval(()=>{if(w){w.step(1/30);if(w.phase==='round_end')w.phase='match_end';if(++sendCount%2===0)postMessage(w.snapshotFor('local'));}},1000/30);