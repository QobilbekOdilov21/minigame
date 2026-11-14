"""Generate an offline, validated 1000-item Uzbek IT quiz for grade-five students."""
import json, random, re
from pathlib import Path
r=random.Random(251114)
items=[]; seen=set(); stats={}
def add(q, correct, wrongs, cat):
    q=q.strip(); correct=str(correct); choices=[correct]+[str(v) for v in wrongs]
    if q.casefold() in seen or len(set(choices))!=4 or any(not x.strip() for x in choices): return False
    seen.add(q.casefold());r.shuffle(choices)
    items.append({'q':q,'a':choices,'correct':choices.index(correct),'topic':cat})
    stats[cat]=stats.get(cat,0)+1
    return True
facts='''Kompyuterning hisoblash markazi qaysi?|Protsessor (CPU)|Monitor|Printer|Sichqoncha
Kompyuterda vaqtincha ishlovchi tezkor xotira nima?|RAM|Monitor|Kolonka|Printer
Rasmlarni ekranda ko‘rsatadigan qurilma qaysi?|Monitor|Klaviatura|Mikrofon|Skaner
Matn kiritish uchun qaysi qurilmadan foydalanamiz?|Klaviatura|Monitor|Printer|Kolonka
Sichqonchaning chap tugmasi ko‘pincha nima qiladi?|Tanlaydi|Ovozni chiqaradi|Qog‘oz bosadi|Wi-Fi uzadi
Printer nima uchun kerak?|Hujjatni qog‘ozga chiqarish|Ovozni yozish|Internetga ulash|Dastur yozish
Skanerning vazifasi nima?|Qog‘ozdagi tasvirni raqamlashtirish|Kompyuterni sovitish|Matnni chop etish|Internet tarqatish
Mikrofon qaysi ma’lumotni kiritadi?|Ovoz|Rasm|Qog‘oz|Elektr toki
Kolonka nima chiqaradi?|Ovoz|Qog‘oz|Matn kodi|Skan
Veb-sahifani qaysi dastur ochadi?|Brauzer|Kalkulyator|Paint|Arxivator
Internet nima?|O‘zaro ulangan kompyuter tarmoqlari|Faqat bitta dastur|Printer turi|Klaviatura turi
Wi-Fi nima uchun ishlatiladi?|Simsiz tarmoqqa ulanish|Qog‘ozni kesish|Ovozni kuchaytirish|Matnni bo‘yash
Parol nima uchun kerak?|Hisobni himoyalash|Ekranni kattalashtirish|Printer tanlash|O‘yin yuklash
Kuchli parolga qaysi misol mos?|Uzun va noyob parol|123456|password|ismim
Shaxsiy parolni kim bilan bo‘lishish mumkin?|Hech kim bilan bo‘lishmaslik kerak|Notanish odam bilan|Barcha sinfdosh bilan|Ochiq guruhda
Noma’lum havolani olsangiz nima qilish kerak?|Tekshirmay ochmaslik|Darhol parol kiritish|Hammaga yuborish|Faylni ishga tushirish
Tanish bo‘lmagan odam internetda manzil so‘rasa nima qilish kerak?|Kattalarga aytish va bermaslik|Darhol yuborish|Hammaga ko‘rsatish|Ovozli xabar yuborish
Fishing (phishing) nima?|Aldov xabari bilan ma’lumot o‘g‘irlash|Rasm chizish|Internetni o‘chirish|Musica tinglash
Antivirus nimaga yordam beradi?|Zararli dasturlardan himoyalanish|Batareyani kattalashtirish|Printerga siyoh quyish|Matnni ranglash
Operatsion tizimga misol?|Windows|Word hujjati|JPEG rasm|Sichqoncha
Linux nima?|Operatsion tizim|Brauzer paroli|Printer kabeli|Rasm formati
Papka (folder) nima?|Fayllarni tartiblab saqlash joyi|Kompyuter protsessori|Internet tarmog‘i|Monitor ekrani
Fayl nima?|Saqlangan raqamli ma’lumot|Elektr uzatish simi|Sichqoncha tugmasi|Printer qog‘ozi
Fayl nomidagi .png odatda nimani bildiradi?|Rasm fayli|Ovoz fayli|Matn dasturi|Video o‘yini
Fayl nomidagi .mp3 nimaga tegishli?|Ovoz|Jadval|Rasm|Veb-sahifa
Fayl nomidagi .mp4 ko‘pincha nima?|Video fayli|Faqat matn|Papka|Printer drayveri
.docx kengaytmali fayl ko‘pincha nima?|Matn hujjati|Ovoz|Rasm|Internet manzil
.pptx kengaytmasi qaysi fayl turiga mos?|Taqdimot|Rasm|Ovoz|Video
.xlsx kengaytmasi qaysi hujjatga mos?|Elektron jadval|Ovoz yozuvi|Rasm|Arxiv
.pdf fayl odatda nima?|Ko‘rish va ulashish uchun hujjat|O‘yin boshqaruvi|Printer qurilmasi|Sichqoncha tugmasi
Paint dasturida nima qilsa bo‘ladi?|Rasm chizish|Operatsion tizim o‘rnatish|Kompyuterni ta’mirlash|Wi-Fi yaratish
Word dasturi asosan nimaga xizmat qiladi?|Matnli hujjat yaratish|Video montaj|Musiqa bastalash|3D o‘yin
PowerPoint nimaga xizmat qiladi?|Slaydli taqdimot yaratish|Virus qidirish|Internet provayder|Papka ochish
Excel dasturi nimaga mos?|Jadval va hisoblash|Ovoz yozish|O‘yin boshqarish|Rasm chizish
Matndagi xatoni o‘chirish uchun qaysi tugma yordam beradi?|Backspace|Caps Lock|F1|Print Screen
Bo‘sh joy kirituvchi tugma qaysi?|Space|Enter|Tab|Esc
Yangi qatorga o‘tish uchun qaysi tugma?|Enter|Shift|Ctrl|Alt
Katta harflarni doimiy yoqadigan tugma qaysi?|Caps Lock|Backspace|Delete|Tab
Bir martalik katta harf uchun qaysi tugmani bosib turish mumkin?|Shift|Ctrl|Tab|Esc
Klaviaturadagi yo‘nalish tugmalari nima?|Strelkalar|Raqamlar|Funksiya tugmalari|Harflar
Klaviaturada Esc ko‘pincha nima qiladi?|Amalni bekor qiladi yoki oynadan chiqadi|Matnni kesadi|Yangi monitor ochadi|Yordamchi xotirani o‘chiradi
Nusxa ko‘chirish amali nima?|Ma’lumotning nusxasini yaratish|Asl faylni darhol o‘chirish|Kompyuterni o‘chirish|Faylni parollash
Faylni boshqa papkaga ko‘chirishdan oldin nima qilish yaxshi?|To‘g‘ri faylni tanlash|Monitorni uzish|Internetni yoqish|Sichqonchani almashtirish
Zaxira nusxa (backup) nima?|Muhim ma’lumotning qo‘shimcha nusxasi|Eski klaviatura|Printer uchun qog‘oz|Katta monitor
Bulutli xotira nima?|Internet orqali fayl saqlash xizmati|Osmondagi bulut|Printer qutisi|Telefon kamera turi
USB fleshka nima uchun kerak?|Ma’lumot saqlash va ko‘chirish|Suv isitish|Ovoz kuchaytirish|Internet manzilni topish
SSD nima?|Ma’lumot saqlash qurilmasi|Faqat rasm tahrirlovchi|Internet protokoli|Ovoz balandligi
Sichqoncha kursori nima?|Ekrandagi ko‘rsatkich|Printer ruligi|Quloqchin|Kompyuter quvvati
Ikkita tez bosish (double click) ko‘pincha nima qiladi?|Fayl yoki dasturni ochadi|Ovozni o‘chiradi|Wi-Fi ulaydi|Ekranni yuvadi
Rasmni kattalashtirish uchun odatda nima qilinadi?|Zoom ishlatiladi|Printer o‘chiriladi|Caps Lock bosiladi|Fayl nomi almashtiriladi
Scratch dasturida qahramon nima deyiladi?|Sprite|Folder|Driver|Router
Scratch'da sahna qanday nomlanadi?|Stage|Keyboard|Disk|Browser
Scratch'da buyruqlar qanday ko‘rinishda?|Bloklar|Elektr simlari|Qog‘ozlar|Piksellar
Scratch'dagi repeat bloki nima qiladi?|Buyruqlarni takrorlaydi|Ovozni o‘chiradi|Faylni o‘chiradi|Internetni yopadi
Scratch'da yashil bayroq nima uchun?|Loyihani ishga tushirish|Kompyuterni o‘chirish|Faylni bosish|Tarixni tozalash
Scratch'da forever bloki nima qiladi?|Buyruqlarni uzluksiz takrorlaydi|Faqat bir marta bajaradi|Faylni saqlaydi|Slayd qo‘shadi
Scratch'da if bloki nima qiladi?|Shartni tekshiradi|Rasmni chop etadi|Ovozni saqlaydi|Wi-Fi ulaydi
Scratch'da variable (o‘zgaruvchi) nima?|O‘zgaradigan qiymatni saqlovchi nom|Doimiy rasm|Papka nomi|Sichqoncha tugmasi
Scratch'da costume nimani o‘zgartiradi?|Qahramon ko‘rinishini|Internet tezligini|Printer formatini|Fayl kengaytmasini
Scratch'da sound nima?|Ovoz bilan ishlash bo‘limi|Rang chizish|Xotira turi|Tarmoq shifri
Scratch'da x va y koordinatalar nima?|Qahramon joylashuvi|Musiqa balandligi|Fayl hajmi|Internet tezligi
Robotga aniq buyruq berish nima uchun muhim?|U to‘g‘ri bajarishi uchun|Ekranni ranglash uchun|Sichqonchani tozalash uchun|Printer tezligini oshirish uchun
Algoritm nima?|Amallarning tartibli ketma-ketligi|Faqat bir rasm|Bir xil harf|Ovoz fayli
Dasturlash nima?|Kompyuterga bajariladigan ko‘rsatmalar yozish|Printer ta’mirlash|Faqat internet ko‘rish|Musiqa yozib olish
Xato (bug) nima?|Dasturdagi noto‘g‘ri ishlash|Yangi fayl|Printer siyohi|Internet manzil
Debugging nimaga kerak?|Dastur xatosini topish va tuzatish|Kompyuterni bo‘yash|Printer ulash|Fayl bosish
Shart (condition) nima?|To‘g‘ri yoki noto‘g‘ri bo‘lishi mumkin bo‘lgan tekshiruv|Fayl nomi|Monitor kabeli|Internet paroli
Ma’lumot nima?|Saqlash yoki qayta ishlash mumkin bo‘lgan axborot|Faqat telefon|Chizma qog‘oz|Elektr tugmasi
Bit nima?|Axborotning eng kichik ikkilik birligi|Katta disk|Rasm muharriri|Printer turi
1 bayt necha bit?|8 bit|2 bit|4 bit|16 bit
Ikkilik sanoq sistemasida qaysi raqamlar ishlatiladi?|0 va 1|0 va 2|1 va 3|2 va 9
Internet manzili (URL) nimani ko‘rsatadi?|Veb-resurs manzilini|Kompyuter haroratini|Fayl hajmini|Printer tezligini
Qidiruv tizimi nima qiladi?|Internetdagi ma’lumotlarni qidiradi|Qog‘oz chop etadi|Kompyuterni o‘chiradi|Musiqa yozadi
Brauzerda yangi yorliq (tab) nimaga kerak?|Boshqa sahifani alohida ochish|Kompyuterni qayta o‘rnatish|Klaviaturani yoqish|Printer tanlash
Yuklab olish (download) nima?|Internetdan qurilmaga fayl olish|Faylni internetga yuborish|Ekran rasmini o‘chirish|Qog‘oz saqlash
Yuklash (upload) nima?|Qurilmadan internetga fayl yuborish|Internetni o‘chirish|Tugmani bosish|Faylni yopish
Onlayn darsga kirishdan oldin nima tekshiriladi?|Internet va havola|Faqat printer|Faqat daftar rangi|Faqat monitor qutisi
Mualliflik huquqi nima?|Ijodkorning asariga tegishli huquq|Wi-Fi kodi|Rasm filtri|Printer siyohi
Boshqaning rasmini ishlatganda nima qilish to‘g‘ri?|Ruxsat yoki litsenziyani tekshirish|O‘zimniki deb e’lon qilish|Muallifni o‘chirib yuborish|Darhol sotish
Internetdagi har bir ma’lumot to‘g‘rimi?|Yo‘q, manbani tekshirish kerak|Ha, hammasi to‘g‘ri|Faqat sarlavhasi to‘g‘ri|Faqat rasmlar to‘g‘ri
Xabar yuborishdan oldin nimani tekshiramiz?|Qabul qiluvchi va matnni|Faqat fon rangini|Faqat ovoz balandligini|Faqat quvvat tugmasini
Suhbatda odob nima?|Hurmat bilan yozish|Boshqalarni haqorat qilish|Parollarni so‘rash|Do‘stni kamsitish
Ikki bosqichli tasdiqlash nimaga yordam beradi?|Hisob xavfsizligini oshiradi|Internetni tezlashtiradi|Monitorni kattalashtiradi|Klaviaturani yoqadi
Kompyuterdan uzoq foydalanganda nima qilish foydali?|Vaqti-vaqti bilan tanaffus qilish|Doim ekranga tikilish|Ekranni yanada yaqinlashtirish|Chiroqni o‘chirib o‘tirish
Ekranga juda yaqin o‘tirish to‘g‘rimi?|Yo‘q, qulay masofa saqlanadi|Ha, har doim|Faqat o‘yinda|Faqat kechasi
Xotirani tejash uchun nima yordam beradi?|Keraksiz fayllarni tartib bilan o‘chirish|Hamma faylni ko‘paytirish|Ko‘p brauzer ochish|Har doim video yozish
Raqamli iz nima?|Internetdagi faoliyatdan qolgan ma’lumotlar|Qog‘ozdagi oyoq izi|Printer turi|Monitor ustidagi chang
Ekran rasmi (screenshot) nima?|Ekrandagi tasvir nusxasi|Video ovozi|Fayl paroli|Internet kabeli
Faylni nomlashda qaysi usul yaxshi?|Mazmunli va tushunarli nom qo‘yish|Hamma faylga bir xil nom berish|Faqat bo‘sh joy ishlatish|Nomini umuman qo‘ymaslik
Qaysi qurilma chiqish qurilmasi?|Monitor|Klaviatura|Mikrofon|Sichqoncha
Qaysi qurilma kiritish qurilmasi?|Skaner|Printer|Kolonka|Proyektor
Sichqonchadagi scroll g‘ildiragi nimaga yordam beradi?|Sahifani aylantirish|Fayl saqlash|Tovush yozish|Dastur o‘chirish
Qaysi format ko‘pincha rasm uchun ishlatiladi?|JPEG|MP3|WAV|MP4
Qaysi format ko‘pincha ovoz uchun ishlatiladi?|WAV|PNG|DOCX|XLSX
Qaysi dastur slaydlar tayyorlash uchun mos?|PowerPoint|Kalkulyator|Fayl menejeri|Antivirus
Qaysi dastur kod yozishda ishlatilishi mumkin?|Kod muharriri|Printer drayveri|Ovoz balandligi|Ekran qulfi
Sifatli ma’lumot manbasi qanday?|Ishonchli va tekshiriladigan|Manbasi noma’lum|Faqat reklama|Faqat tasodifiy xabar
Shubhali faylni yuklab olish kerakmi?|Yo‘q, avval manbani tekshirish kerak|Ha, doim|Darhol ochish kerak|Hammaga ulashish kerak
Onlayn o‘yinda begona odam haqorat qilsa nima qilamiz?|Bloklash yoki kattaga aytish|Janjal qilish|Parol berish|Uy manzilini yozish
Ilovaning ruxsatlari (permissions) nima?|Ilova qaysi imkoniyatga kira olishini belgilaydi|Monitor o‘lchami|Fayl kengaytmasi|Printer rangi
Algoritmda qadamlar tartibi nima uchun kerak?|Natija to‘g‘ri chiqishi uchun|Faqat chiroyli ko‘rinishi uchun|Ovozni pasaytirish uchun|Ekran rangini almashtirish uchun
Dastur yangilanishi (update) nima?|Dasturning yangi versiyasi|Ekran dog‘i|Printer qog‘ozi|Internet kabeli
Arxiv (ZIP) nima uchun ishlatiladi?|Fayllarni bir joyga yig‘ish va siqish|Ovozni balandlatish|Internetni to‘sish|Rasmni ekranga chiqarish
Kompyuterga suv to‘kilsa nima qilish kerak?|Kattadan yordam so‘rab, elektrdan ehtiyot bo‘lish|Darhol qo‘l bilan tekshirish|Unga suv qo‘shish|O‘ynashda davom etish
Maktab kompyuterida shaxsiy hisobdan chiqish nega kerak?|Hisobni himoyalash uchun|Monitorni yoritish uchun|O‘yin tezlashishi uchun|Printer qizishi uchun'''
for n,line in enumerate(facts.splitlines(),1):
 parts=line.split('|');assert len(parts)==5,(n,line)
 assert add(parts[0],parts[1],parts[2:], 'Asosiy IT')

# Scratch: numerical questions about repeat, forward steps and turns. Each scenario has four plausible answers.
for n in range(2,12):
 for step in range(2,10):
  answer=n*step
  add(f'Scratch: “repeat {n}” ichida “move {step} steps” bo‘lsa, jami necha qadam yuradi?',answer,[answer+step,answer-step,n+step],'Scratch')
for n in range(2,12):
 for step in range(1,9):
  answer=n*step
  add(f'Robot “{step} qadam oldinga” buyrug‘ini {n} marta takrorlasa, jami qancha yuradi?',answer,[answer+1,max(0,answer-step),n+step],'Algoritm')
# Simple sprite motion: 100 single step coordinate exercises
for start in range(-5,5):
 for step in range(1,11):
  answer=start+step
  add(f'Scratch spriti x={start} nuqtada. “change x by {step}” dan keyin x nechaga teng?',answer,[answer+1,answer-1,start-step],'Koordinata')
# Binary, 100 unique numbers with small values and representations
for n in range(0,50):
 b=format(n,'b')
 add(f'{n} soni ikkilik (0 va 1) sanoq tizimida qanday yoziladi?',b,[format(n+1,'b'),format(n+2,'b'),format(n+3,'b')],'Ikkilik sanoq')
 add(f'Ikkilik sanoq tizimidagi {b} soni o‘nlikda nechaga teng?',n,[n+1,n+2,n+3],'Ikkilik sanoq')
# File capacity and bits, 100 total
for n in range(1,51):
 answer=n*8
 add(f'{n} bayt nechta bitga teng? (1 bayt = 8 bit)',answer,[answer+8,answer-8,n*4],'Ma’lumot o‘lchovi')
 add(f'{n*8} bit axborot necha bayt bo‘ladi?',n,[n+1,n+2,n*2],'Ma’lumot o‘lchovi')
# Safety contextual variations (100)
scenarios=[
 ('Begona odam o‘yin chatida parolingizni so‘radi', 'Parolni bermaslik', 'Parolni yuborish', 'Unga SMS-kodni ham berish', 'Parolni guruhga yozish'),
 ('Noma’lum havolada sovg‘a yutdingiz deb yozilgan', 'Havolani tekshirmay ochmaslik', 'Darhol hisobga kirish', 'Do‘stlarga ulashish', 'Shaxsiy ma’lumotni kiritish'),
 ('Internetda kimgadir uy manzilingiz kerak ekan', 'Kattalar bilan maslahatlashish', 'Manzilni yozish', 'Telefon raqam ham berish', 'Xaritadan uy ko‘rsatish'),
 ('Kompyuteringizda noma’lum fayl paydo bo‘ldi', 'Kattadan so‘rab, faylni tekshirtirish', 'Darhol ishga tushirish', 'Do‘stga yuborish', 'Parol bilan ochish'),
 ('Maktabdagi umumiy kompyuterda emailga kirdingiz', 'Ish tugagach hisobdan chiqish', 'Parolni saqlab qo‘yish', 'Hammani kirgizish', 'Emailni ochiq qoldirish'),
 ('Do‘stingiz internetda sizga qo‘pol yozdi', 'Xotirjam javob berish yoki kattaga aytish', 'Javoban haqorat qilish', 'Parolini so‘rash', 'Hamma bilan urishish'),
 ('Telefoningizga tasdiqlash kodi keldi', 'Kodni hech kimga bermaslik', 'Kodni o‘yin chatiga yozish', 'Do‘stga yuborish', 'Postga joylash'),
 ('Birov sizning suratingizni ruxsatsiz joyladi', 'Kattaga aytish va shikoyat qilish', 'O‘z manzilingizni e’lon qilish', 'Hamma rasmlarni tarqatish', 'Parolni yuborish'),
 ('Internetda bir xabar juda g‘alati ko‘rindi', 'Bir nechta ishonchli manbadan tekshirish', 'Darhol ishonish', 'Hammaga tarqatish', 'Faqat rasmga qarash'),
 ('Kompyuter juda qizib ketdi', 'Foydalanishni to‘xtatib kattaga aytish', 'Ustiga suv quyish', 'Adyol bilan yopish', 'Yanada og‘ir o‘yin ochish'),
 ('Parolingizni do‘stingiz bilib qoldi', 'Parolni almashtirish', 'Hamma bilan ulashish', 'Hech nima qilmaslik', 'Bir xil parolni tarqatish'),
 ('Sayt sizdan karta ma’lumotlarini so‘rayapti', 'Kattalarsiz kiritmaslik', 'Darhol kiritish', 'Hamma bilan bo‘lishish', 'Ekran rasmi yuborish'),
 ('Ilova kameradan foydalanishga ruxsat so‘radi, ammo kamera kerak emas', 'Ruxsatni bermaslik', 'Hamma ruxsatni berish', 'Parolni kiritish', 'Telefonni qayta sotish'),
 ('Sinfdoshingiz yozgan faylini tasodifan o‘chirdingiz', 'O‘qituvchiga aytish va tiklashga urinish', 'Yashirish', 'Boshqa faylni ham o‘chirish', 'O‘yin ochish'),
 ('Internetdagi notanish kishi uchrashishni taklif etdi', 'Darhol ishonchli kattaga aytish', 'Yolg‘iz borish', 'Manzilni jo‘natish', 'Parolni berish'),
 ('Sayt “bepul sovg‘a” uchun pasport raqami so‘rayapti', 'Kattalar bilan tekshirmasdan ma’lumot bermaslik', 'Darhol yozish', 'Do‘stlarning raqamini berish', 'Rasmli hujjat yuborish'),
 ('Maktab kompyuterida virus haqida ogohlantirish chiqdi', 'O‘qituvchiga aytish', 'Har qanday tugmani bosish', 'Barcha faylni o‘chirish', 'Ogohlantirishni ulashish'),
 ('O‘yin ichida kimdir sizni kamsitmoqda', 'Bloklash yoki shikoyat qilish', 'Xuddi shunday javob berish', 'Shaxsiy ma’lumot berish', 'U bilan janjallashish'),
 ('Kutilmaganda yangi ilova o‘rnatishni so‘rashdi', 'Manba va ruxsatlarni tekshirish', 'Darhol o‘rnatish', 'Do‘stlarga ham o‘rnatish', 'Barcha parollarni kiritish'),
 ('Notanish kanalda “parolingizni tasdiqlang” xabari keldi', 'Xabarga ishonmasdan rasmiy saytni tekshirish', 'Linkdan darhol kirish', 'Parolni yuborish', 'Kodni yozish')
]
for i,sc in enumerate(scenarios):
 stem,c,*wrong=sc
 for variant in range(1):
  opener=['Vaziyat','Internet xavfsizligi','Raqamli odob','Xavfsiz tanlov','Amaliy misol'][variant]
  add(f'{opener} {variant+1}: {stem}. Qaysi ish to‘g‘ri?',c,wrong,'Internet xavfsizligi')
# Keyboard shortcuts 60 varied scenarios: 15*4
shortcuts=[('Ctrl + C','Nusxa olish'),('Ctrl + V','Joylashtirish'),('Ctrl + X','Kesib olish'),('Ctrl + Z','Oxirgi amalni bekor qilish'),('Ctrl + S','Saqlash'),('Ctrl + A','Hammasini tanlash'),('Ctrl + F','Qidirish'),('Ctrl + P','Chop etish'),('Ctrl + N','Yangi hujjat yoki oyna'),('Ctrl + O','Faylni ochish'),('Alt + Tab','Oynalar orasida o‘tish'),('Ctrl + T','Brauzerda yangi yorliq'),('Ctrl + W','Joriy yorliqni yopish'),('Ctrl + R','Sahifani yangilash'),('Ctrl + B','Matnni qalin qilish')]
for combo,desc in shortcuts:
 wrong=[v for c,v in shortcuts if v!=desc]
 for j in range(1):
  q=[f'Klaviaturada {combo} tugmalari odatda nima qiladi?',f'Kompyuter darsida {combo} bosildi. Natijasi nima?',f'{combo} qisqa buyrug‘ining vazifasini toping.',f'Matn yoki brauzerda {combo} tugmalari uchun to‘g‘ri javobni belgilang.'][j]
  opts=[wrong[(shortcuts.index((combo,desc))+k*3+j)%len(wrong)] for k in range(3)]
  add(q,desc,opts,'Klaviatura')
# File extensions 40 examples
exts=[('png','Rasm'),('jpg','Rasm'),('gif','Animatsiyali rasm'),('mp3','Ovoz'),('wav','Ovoz'),('mp4','Video'),('txt','Oddiy matn'),('docx','Word hujjati'),('xlsx','Excel jadvali'),('pptx','PowerPoint taqdimoti'),('pdf','PDF hujjat'),('zip','Arxiv'),('html','Veb-sahifa'),('css','Veb-sahifa uslubi'),('js','JavaScript kodi'),('py','Python kodi'),('svg','Vektor rasm'),('webp','Rasm'),('csv','Jadval ma’lumoti'),('json','Tuzilgan ma’lumot')]
for ext,kind in exts:
 opts=[k for e,k in exts if k!=kind]
 for j in range(1):
  name=['dars','maktab','rasm','hisobot'][j]
  add(f'“{name}.{ext}” faylini ko‘rsangiz, uning turi nima?',kind,[opts[(j*3+k*4)%len(opts)] for k in range(3)],'Fayllar')
# Pattern & logic, enough to reach >=1000
for start in range(1,31):
 for step in [2,3,4,5,6,7,8,9,10,11]:
  answer=start+3*step
  add(f'Robot kodi ketma-ketlik berdi: {start}, {start+step}, {start+2*step}, ... Keyingi sonni toping.',answer,[answer+step,answer-step,answer+1],'Mantiq')
# Add any extra Scratch exercises to reach 1000, and deterministically truncate a balanced pool
for rep in range(2,14):
 for step in range(2,17):
  answer=rep*step
  add(f'Scratch: mushuk “repeat {rep}” ichida “turn {step} degrees” bajarsa, jami necha daraja buriladi?',answer,[answer+step,answer-step,rep+step],'Scratch')
if len(items)<1000: raise ValueError(f'Only {len(items)} distinct questions')
# Keep a balanced selection: all foundational, safety, keyboard then sample broad procedural questions.
selected=[]
for topic in ['Asosiy IT','Internet xavfsizligi','Klaviatura','Fayllar']:
 selected.extend([x for x in items if x['topic']==topic])
remaining=1000-len(selected)
other=[x for x in items if x['topic'] not in ['Asosiy IT','Internet xavfsizligi','Klaviatura','Fayllar']]
bytopic={t:[x for x in other if x['topic']==t] for t in sorted(set(x['topic'] for x in other))}
while remaining>0:
 for t in list(bytopic):
  if remaining==0: break
  if bytopic[t]:
   selected.append(bytopic[t].pop(0));remaining-=1
 assert any(bytopic.values()) or remaining==0
r.shuffle(selected)
assert len(selected)==1000 and len({x['q'] for x in selected})==1000
assert all(len(x['a'])==4 and len(set(x['a']))==4 and isinstance(x['correct'],int) and 0<=x['correct']<4 for x in selected)
# write lean JSON with no topic to minimize payload
bank=[{k:x[k] for k in ['q','a','correct']} for x in selected]
out=Path(__file__).parent/'server'/'quiz-bank.json'
out.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
from collections import Counter
print('GENERATED:',len(bank),'from',len(items),'candidates | topics:',dict(Counter(x['topic'] for x in selected)))
print('SAMPLE:',bank[0], 'SIZE KB:',round(out.stat().st_size/1024,1))