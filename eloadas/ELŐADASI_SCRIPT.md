# Hibabejelentő Alkalmazás – Előadási Script

---

## 🎯 BEVEZETŐ (1-2 perc)

### Slide 1: Cím és Téma
**Amit mondani kell:**
- Jó napot! Ma a **Hibabejelentő alkalmazásunkat** szeretnénk bemutatni.
- Ez egy **webes rendszer**, amelyet az iskolánk számára fejlesztettünk.
- A cél: **egyszerű, gyors és intuitív** megoldást biztosítani az iskolai hálózati és rendszerhibák bejelentésére.
- Mobil és asztali gépen is használható.

---

## 📋 AZ ALKALMAZÁS CÉLJA (1 perc)

### Slide 2: Probléma és Megoldás

**Az ELŐZMÉNY – Mi volt a probléma?**
- Az iskolai rendszerkarbantartók eddig papíralapú vagy felületre aggatott jegyzeteket használtak.
- Hiányzott az olyan megoldás, amely:
  - Keskeny, elektronikus dokumentáció
  - Nyomon követés az első bejelentéstől a megoldásig
  - Hozzáférhető mobil eszközről is
  - Felhasználókon alapuló jogosultságkezelés

**A MEGOLDÁS:**
- A **Hibabejelentő** egy webes alkalmazás, amely:
  - ✅ Intuitív felületet biztosít hibák bejelentésére
  - ✅ Valós idejű nyomon követést tesz lehetővé
  - ✅ Felhasználói szerepkörök alapján különböző jogosultságokat kezel
  - ✅ Interneten keresztül elérhető (`localhost:3000` vagy a szerver IP-je)

---

## 👥 FELHASZNÁLÓI SZEREPKÖRÖK (1 perc)

### Slide 3: Ki mit tehet?

**1. TANÁROK**
- 📝 Új hibákat jelenthetnek be
- 👀 Megtekinthetik az összes hibabejelentést
- ❌ Nem módosíthatnak, nem vehetnek fel új felhasználókat

**2. KARBANTARTÓK / IT SZAKEMBEREK**
- 👀 Megtekinthetik az összes hibabejelentést
- ✅ Megjelölhetik a hibákat "kijavítva"-ként
- ❌ Nem jelenthetnek be új hibákat
- ❌ Nem vehetnek fel új felhasználókat

**3. ADMINISZTRÁTOROK**
- 📝 Bejelenthetnek új hibákat
- 👀 Megtekinthetik az összes hibabejelentést
- ✅ Kijavított-ként jelölhetnek meg hibákat
- 👤 **Kezelhetik a felhasználókat** (hozzáadás, törlés)

---

## 🖥️ A TECHNIKAI MEGOLDÁS (1 perc)

### Slide 4: Mi az "motorban"?

**BACKEND (a szerver)**
- **Node.js + Express.js** keretrendszer
- **SQLite adatbázis** – könnyű, megbízható, fájlalapú
- **REST API** – strukturált adatcsere
- **JWT (JSON Web Token)** – biztonságos bejelentkezés
- **bcrypt** – jelszavak titkosítása

**FRONTEND (a felhasználó által használt felület)**
- **HTML5 + CSS3 + Vanilla JavaScript**
- **Bootstrap 5** – szép, reszponzív design
- **Teljes mértékben mobilbarát**

**ADATBÁZIS SZERKEZETE**
- `users` tábla – felhasználók és jelszavak
- `faults` tábla – hibabejelentések (kik jelentették, ki javította, státusz)

---

## 🚀 DEMO / FUNKCIONALITÁSOK BEMUTATÁSA (3-4 perc)

### Slide 5: Bejelentkezés

**Mi történik:**
1. Szerver megnyitása: `npm start`
2. Böngészőben: `http://localhost:3000`
3. A **bejelentkezési oldal** jelenik meg (index.html)

**Demo során:**
- Felhasználónév és jelszó begépelése (pl. `tanar1` / `jelszo`)
- "Bejelentkezés" gomb megnyomása
- Backend ellenőrzésének folyamata: jelszó hashelésbe való bevitele és JWT token generálása
- ✅ Sikeres bejelentkezés → átirányítás a főoldalra

---

### Slide 6: Főoldal – A Hibajegyek Listája

**Amit látunk:**
1. **Navigációs sáv:**
   - Alkalmazás neve
   - "Hibajegyek" link (aktív)
   - "Felhasználók" link (csak adminoknak!)
   - "Súgó" link
   - Bejelentkezett felhasználó neve és szerepe
   - "Kijelentkezés" gomb

2. **Szűrési lehetőség:**
   - "Összes" hibajegyek
   - Csak "Bejelentve" status
   - Csak "Kijavítva" status

3. **Hibajegyek táblázata:**
   - **Bejelentés dátuma** – mikor jelentette fel
   - **Terem** – hol jelentkezik a probléma (pl. "101-es terem", "Szertár")
   - **Leírás** – mire panaszkodott a tanár
   - **Állapot** – "Bejelentve" (sárga badge) vagy "Kijavítva" (zöld badge)
   - **Bejelentő** – ki jelentette fel
   - **Javító** – ki javította meg (ha már megoldva)
   - **Javítás dátuma** – mikor volt kész
   - **Műveletek** – "Javítás" gomb (ha karbantartó/admin és a hiba még "bejelentve")

---

### Slide 7: Új Hiba Bejelentése (Tanár/Admin)

**Az "Új hiba rögzítése" űrlap:**
- 📝 **Terem mező:** Szöveg bevitele (pl. "Számítógép 5.", "Nyomtató a folyo")
- 📝 **Leírás mező:** Részletesebb szöveg a problémáról
- ➕ **"Hiba bejelentése" gomb**

**Amit automatikusan rögzít a rendszer:**
- ✅ Bejelentés dátuma (mai nap, YYYY-MM-DD formátumban)
- ✅ Bejelentő felhasználó (aktuálisan bejelentkezett tanár)
- ✅ Állapot: "Bejelentve"

**Demo során:**
- Kitöltjük az űrlapot (pl. "101-es terem", "Nem lehet internetre kapcsolódni")
- Kattintunk a "Hiba bejelentése" gombra
- Az API (POST /api/hibak) elmenti az adatbázisba
- Az új hiba megjelenik a táblázat tetején (legfrissebb előre)
- Üzenet: "Hiba sikeresen bejelentve!"

---

### Slide 8: Hiba Kijavítása (Karbantartó/Admin)

**Mi történik:**
1. A karbantartó/admin ráklikk a "Javítás" gombra az még "bejelentve" állapotú hibánál
2. Az API (PUT /api/hibak/:id/javitas) meghívódik
3. **Automatikusan rögzítésre kerül:**
   - ✅ Javító felhasználó (aktuálisan bejelentkezett admin/karbantartó)
   - ✅ Javítás dátuma (mai nap)
   - ✅ Állapot: "Kijavítva"
4. A táblázatban a hiba státusza `Kijavítva` (zöld badge) lesz
5. A "Javítás" gomb eltűnik (már nem szerkeszthető)

**Demo során:**
- Kiválasztunk egy "Bejelentve" állapotú hibát
- Megnyomjuk a "Javítás" gombot
- A hiba státusza azonnal frissül
- A karbantartó neve és dátuma megjelenik

---

### Slide 9: Felhasználókezelés (Adminok számára)

**Admin oldal elérése:**
- Csak adminoknak látható a "Felhasználók" link a navigációban
- Kattintunk rá → admin_users.html

**Új felhasználó hozzáadása:**
- 👤 **Név mező** – tanár teljes neve
- 🔤 **Felhasználónév mező** – egyedi azonosító (pl. "tanar1", "admin2")
- 🔐 **Jelszó mező** – a felhasználó jelszava (bcrypt-tel titkosítva kerül tárolásba)
- 👥 **Szerep legördülő:** "tanar", "karbantarto", "admin"
- ➕ **"Felhasználó hozzáadása" gomb**

**Meglévő felhasználók táblázata:**
- ID, Név, Felhasználónév, Szerep
- Minden sorban egy **"Törlés" gomb** (kivéve az admin saját magánál)

**Biztonsági szabályok:**
- ✅ Adminisztrátor nem törölheti magát
- ✅ Felhasználó nem törölhető, ha kapcsolódó hibabejegyzése van
- ✅ Jelszavak soha nem tárolódnak nyíltan, csak hashelésbe

**Demo során:**
- Új felhasználó hozzáadása (pl. "Tesi Jani", "tesi_jani", "jelszo", "tanar" szerep)
- A felhasználó megjelenik a táblázatban
- Törlés (pl. egy teszt felhasználót törlünk)
- Az "X" gomb a saját felhasználónál nem érhető el

---

### Slide 10: Súgó Oldal

**Mi van rajta:**
- Statikus információs oldal az alkalmazás használatáról
- Képek a főbb lépésekről
- "Bezárás" gomb (böngészőlapon)
- Elérhető linkről vagy a navigáció "Súgó" gombján keresztül

---

## 📊 ADATBÁZIS SZERKEZETE (1 perc)

### Slide 11: Adattárolás

**`users` tábla (felhasználók):**
```
id         | nev              | felhasznalonev | jelszo_hash | szerep
-----------|------------------|-----------------|-------------|----------
1          | Adminisztrátor   | admin1          | bcrypt      | admin
2          | Tanár 1          | tanar1          | bcrypt      | tanar
3          | Karbantartó 1    | karb1           | bcrypt      | karbantarto
```

**`faults` tábla (hibabejelentések):**
```
id | datum      | bejelento_id | terem     | leiras        | allapot   | javito_id | javitas_datuma
---|------------|--------------|-----------|---------------|-----------|-----------|---------------
1  | 2026-03-15 | 2            | 101-es t. | WiFi nincs    | kijavítva | 3         | 2026-03-16
2  | 2026-03-16 | 2            | Nyomtató  | Papír vége    | bejelentve| NULL      | NULL
```

---

## 🔐 BIZTONSÁG (30 másodperc)

### Slide 12: Hogyan védelmezünk?

✅ **Jelszavak titkosítása (bcrypt)**
- Soha nem tároljuk a jelszót nyíltan
- Csak a kivonat (hash) kerül adatbázisba
- Bejelentkezéskor a begépelt jelszót összehasonlítjuk a hashelésvel

✅ **JWT Token (JSON Web Token)**
- Sikeres bejelentkezés után token jön létre
- Frontend ezt tárja a sessionStorage-ben
- Minden API kérésnél a token kerül `Authorization` headerben

✅ **Jogosultságkezelés**
- Backend ellenőrzi az API-n minden kérésnél:
  - Van-e érvényes token?
  - Mi a felhasználó szerepe?
  - Jogosult-e az adott műveletre?

✅ **HTTPS előkészítés**
- A produkció során HTTPS szükséges (titkosított kapcsolat)

---

## 📱 RESZPONZIVITÁS (30 másodperc)

### Slide 13: Mobilbarátság

**Bootstrap 5 keretrendszer:**
- Automatikus reszponzív layoutok
- Mobilon, táblagépen, asztali gép – mindenhol jól néz ki

**Demo:**
- A böngészőt átméretezzük vagy a fejlesztői eszközöket megnyitjuk (F12)
- Mobilnézetben látszik, hogy az UI szép, rövid oszlopok, gombokra jó kattintani

---

## ✨ TOVÁBBFEJLESZTÉSI LEHETŐSÉGEK (30 másodperc)

### Slide 14: Mit lehetne még csinálni?

1. **📧 E-mail értesítések** – A karbantartókat e-mailben értesíteni az új hibákról
2. **📷 Képfeltöltés** – Fotók a problémáról (pl. törött kijelző)
3. **🎯 Prioritás** – "Magas", "Közepes", "Alacsony" prioritás
4. **⏱️ Deadlines** – Szükséges megoldási idő
5. **💬 Megjegyzések** – Tanár és karbantartó közötti kommunikáció
6. **📊 Analitika** – Statisztikák (legtöbb hiba szeptemberben? stb.)
7. **🔐 Jelszóváltoztatás** – Felhasználók saját jelszavukat módosíthatják
8. **📝 Részletesebb naplózás** – Ki amikor mit csinált

---

## 🚀 TELEPÍTÉS ÉS INDÍTÁS (1 perc)

### Slide 15: Hogyan lehet ezt futtatni?

**Szükséges szoftverek:**
- Node.js (LTS verzió) https://nodejs.org
- npm (Node Package Manager – Node.js-sel együtt jön)
- Git (verziókezeléshez)

**Telepítési lépések:**
1. **Repository klónozása:**
   ```bash
   git clone <repo-url>
   cd Projektmunka-Hibabejelento-main
   ```

2. **Szükséges csomag telepítése:**
   ```bash
   npm install
   ```

3. **.env fájl létrehozása:**
   ```
   JWT_SECRET=generalt_eros_titkos_kulcs_legyen_itt
   DB_PATH=./hibabejelento.db
   PORT=3000
   ```

4. **Tesztadatok betöltése (első futtatáskor):**
   ```bash
   sqlite3 hibabejelento.db < tests/tesztadatok.sql
   ```

5. **Szerver indítása:**
   ```bash
   npm start
   ```

6. **Böngészőben:**
   ```
   http://localhost:3000
   ```

---

## 📁 A PROJEKT SZERKEZETE (30 másodperc)

### Slide 16: Mappa és fájlok

```
Projektmunka-Hibabejelento-main/
├── server.js                    # Backend Express szerver
├── hash.js                      # Jelszó hasheléshez és ellenőrzéshez
├── hibabejelento.db             # SQLite adatbázis
├── package.json                 # Node.js függőségek
├── .env                         # Szekrét konfigurációk (nem GitHub-on)
│
├── public/                      # Frontend fájlok
│   ├── index.html               # Bejelentkezési oldal
│   ├── main.html                # Hibajegyek főoldal
│   ├── admin_users.html         # Felhasználókezelés (adminok)
│   ├── help.html                # Súgó
│   ├── login.js                 # Bejelentkezési logika
│   ├── main-app.js              # Főoldal logikája
│   ├── admin_users.js           # Felhasználókezelés logikája
│   └── style.css                # Stílusok
│
├── docs/                        # Dokumentáció
│   ├── specifkacio.md           # Részletes funkcionális spec
│   ├── frontend.md              # Frontend fejlesztői dok.
│   ├── backend.md               # Backend fejlesztői dok.
│   ├── adatbázis.md             # DB szerkezet
│   └── flowcharts/              # Diagramok
│
└── tests/                       # Tesztelési fájlok
    ├── api_test.http            # API tesztek
    ├── tesztadatok.sql          # Minta adatok az adatbázisba
    └── e2etests.md              # End-to-end tesztek
```

---

## 🎬 DEMÓ SZCENÁRIO (5-7 perc)

### Slide 17: Lépésenkénti Demo

**LÉPÉS 1: Bejelentkezés tanárként**
- Bejelentkezés: tanar1 / jelszo
- Megmutaljuk a tanár interface-ét

**LÉPÉS 2: Hiba bejelentése**
- "Új hiba rögzítése" és egy valódi hibát bejelentünk
- Megmutaljuk, hogyan jelenik meg azonnal a listában

**LÉPÉS 3: Kijelentkezés és bejelentkezés adminként**
- Kijelentkezünk, admin-ként bejelentkezünk (admin / admin)
- Megmutaljuk az admin interface-et (Felhasználók link!)

**LÉPÉS 4: Felhasználókezelés**
- Bemutatjuk a "Felhasználók" oldalt
- Hozzáadunk egy teszt felhasználót

**LÉPÉS 5: Hiba kijavítása**
- Kijelentkezünk, karbantartóként bejelentkezünk
- Rákattintunk a "Javítás" gombra egy "bejelentve" hibánál
- Megmutaljuk, hogyan frissül a státusz és a dátum

**LÉPÉS 6: Szűrés**
- Visszatérünk a hibajegyekhez
- Szűrünk "csak kijavítva"-ra
- Szűrünk "csak bejelentve"-re

**LÉPÉS 7: Mobilnézet**
- Megnyitjuk a fejlesztői eszközöket (F12)
- Mobilnézetre váltunk
- Megmutaljuk, hogy mobilon is teljesen használható

---

## ❓ GYAKORI KÉRDÉSEK (1 perc)

### Slide 18: Q&A

**K: Miért SQLite és nem egy "igazi" adatbázis?**
- V: Egyszerű, könnyű, helyi fájl → nincs szükség külön szerverre. Kis iskolához tökéletes. Skálázódás után áttérhetünk PostgreSQL-re.

**K: A jelszavak biztonságban vannak-e?**
- V: Igen! bcrypt-tel hashelésbe tesszük őket. Soha nem tároljuk nyíltan.

**K: Mit jelent a "JWT Token"?**
- V: Titkosított bizonylat, amely bizonyítja, hogy az adott felhasználó bejelentkezett. Minden API kérésnél elküldjük.

**K: Miért van szükség Node.js-re?**
- V: Az alkalmazás szervere JavaScript-ben írott, és a Node.js futtatja azt.

**K: Lehet-e ezt interneten közzétenni?**
- V: Igen, de entonces HTTPS szükséges és megfelelő szerver (heroku, Azure, AWS, stb.).

---

## 🎓 TANULSÁGOK ÉS ZÁRSZÓ (1 perc)

### Slide 19: Mit tanultunk?

Ebben a projektben:
✅ Teljes fullstack webalkalmazás fejlesztése
✅ Backend API tervezése és implementálása
✅ Frontend és backend integrálása
✅ Adatbázis tervezése és kezelése
✅ Felhasználói hitelesítés és jogosultságkezelés
✅ Reszponzív UI-tervezés

**A projekt jól mutatja:**
- Hogyan dolgozunk csapatban (Git, verziókezelés)
- Hogyan dokumentálunk
- Hogyan tesztelünk
- Hogyan gondolkodunk felhasználóközpontúan

---

## 📞 KONTAKT ÉS KÉRDÉSEK (30 másodperc)

### Slide 20: Vége

**Köszönjük a figyelmet!**

Kérdések?

---

## 📝 ELŐADÓ Jegyzetek

### Gyakorlatok:
- **Mindig indítsd el az alkalmazást az előadás előtt** (`npm start`)
- **Tesztadatok ellenőrzése** – van-e legalább 1 tanár, 1 karbantartó, 1 admin, és néhány hibajegy
- **Internetes kapcsolat** – ha van szükség API demóhoz
- **Böngészőt maximalizálj** – a közönség jobban lássa
- **Mobilt vagy fejlesztői nézetet** a végén mutasd be

### Időmenet:
- Bevezető: 2 perc
- Célja/Probléma: 1 perc
- Szereplők: 1 perc
- Technikai: 1 perc
- Demo: 7 perc (ez a leglényegesebb!)
- Q&A: 2 perc
- **Összesen: ~15-20 perc**

### Tippek:
- Legyen egy **biztonsági másolat script** az előadáshoz (mentett demo-adatok)
- Ha hiba lép fel az előadás közben, maradj nyugodt – éppen ezt demonstrálod: egy valós rendszert
- Hanyagolj el néhány részletet az előadás során, de a Q&A-nál legyél teljesen felkészülve
- A demó a legfontosabb – ezt emeld ki, ne a technikai részleteket

---

## 🎯 DEMO CHECKLIST (az előadás előtt!)

- [ ] Node.js szerver indítva (`npm start`)
- [ ] Böngésző nyitva az `http://localhost:3000`-en
- [ ] Teszt felhasználók léteznek az adatbázisban (tanar, karb, admin)
- [ ] Legalább 2-3 hibajegy van az adatbázisban
- [ ] WiFi stabil, internet elérhető
- [ ] Telefon/tablet kéznél van a mobilnézet demózásához
- [ ] Fejlesztői eszközök (F12) elérhetőek
- [ ] .pptx fájl nyitva és kész az előadásra
- [ ] Hang és video tesztelve (ha szükséges)
