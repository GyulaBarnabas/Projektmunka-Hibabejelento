# 🧪 Hibabejelentő Alkalmazás – Tesztelési Kézikönyv

> Ez a dokumentáció a **tesztfelelős** számára készült, hogy átfogóan és szisztematikusan tesztelhesse az alkalmazást.

---

## 📚 Tartalomjegyzék

1. [Tesztelés előkészítése](#1-tesztelés-előkészítése)
2. [API Tesztelés (Backend)](#2-api-tesztelés-backend)
3. [Manuális Felhasználói Tesztelés (Frontend)](#3-manuális-felhasználói-tesztelés-frontend)
4. [Tesztelési Checklist](#4-tesztelési-checklist)
5. [Hibák Dokumentálása](#5-hibák-dokumentálása)
6. [Tesztelési Riport Sablon](#6-tesztelési-riport-sablon)

---

## 1. 🛠️ Tesztelés Előkészítése

### 1.1 Szükséges Eszközök

#### Backend Teszteléshez:
- **REST Client kiterjesztés** (VS Code-hoz ajánlott: `REST Client` - Huachao Mao)
- **Postman** vagy **Insomnia** (opcionális, de hasznos)
- **curl parancs** (terminálban teszteléshez)
- **SQLite CLI** vagy **DB Browser** (adatbázis ellenőrzéshez)

#### Frontend Teszteléshez:
- **Modern böngészők**: Chrome, Firefox, Edge
- **Developer Tools** (F12) – Network, Console lapok
- **Mobilnézet szimulator** (böngészőben)
- **Screenshooter** vagy **video recording** (hibák dokumentálásához)

### 1.2 Szerver Indítása

```bash
# 1. Nyisd meg a terminált a projekt gyökérkönyvtárában
cd t:\Projekt\Projektmunka-Hibabejelento-main

# 2. Szerver indítása
npm start

# Vagy közvetlenül:
node server.js
```

**Elvárt output:**
```
Sikeresen csatlakozva a hibabejelento.db adatbázishoz (better-sqlite3).
A szerver fut a http://localhost:3000 címen
```

### 1.3 Adatbázis Ellenőrzése

```bash
# Tesztadatok betöltése (ha szükséges)
sqlite3 hibabejelento.db < tests/tesztadatok.sql

# Adatbázis tartalma megtekintése
sqlite3 hibabejelento.db ".tables"       # Táblák listázása
sqlite3 hibabejelento.db "SELECT * FROM felhasznalok;"  # Felhasználók
sqlite3 hibabejelento.db "SELECT * FROM hibak;"         # Hibák
```

### 1.4 Tesztfelhasználók (Alapértelmezés)

Az alábbi tesztfelhasználók a `tesztadatok.sql`-ben vannak definiálva:

| Felhasználónév | Jelszó | Szerep | Teljes Név |
|---|---|---|---|
| `admin` | `Minad123` | admin | Admin |
| `kissp` | `kissp` | tanar | Kiss Péter |
| `szabob` | `szabob` | karbantarto | Szabó Béla |

**⚠️ FONTOS:** Ezek a jelszavak a tesztadatok SQL fájlban vannak! Éles környezetben NE használd ezeket!

---

## 2. 🔌 API Tesztelés (Backend)

### 2.1 REST Client Kiterjesztés Használata VS Code-ban

#### Telepítés:
1. VS Code → Extensions (Ctrl+Shift+X)
2. Keressen: `REST Client`
3. Telepítse: Huachao Mao

#### Tesztelés:
1. Nyisd meg a `tests/api_test.http` fájlt
2. Minden `###` feletti kódblokkra kattints a **"Send Request"** linkre
3. Az eredmény az oldalsó ablakban jelenik meg

### 2.2 API Végpontok Tesztelése

#### ✅ **1. BEJELENTKEZÉS TESZTELÉSE**

**Test 1.1: Admin bejelentkezése**

```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "felhasznalonev": "admin",
  "jelszo": "Minad123"
}
```

**Várt válasz:**
```
HTTP 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **200**
- ✅ Válaszban található-e `token`
- ✅ Token hossza > 100 karakter

---

**Test 1.2: Hibás jelszó**

```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "felhasznalonev": "admin",
  "jelszo": "rossz_jelszo"
}
```

**Várt válasz:**
```
HTTP 401 Unauthorized
{
  "error": "Hibás felhasználónév vagy jelszó."
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **401**
- ✅ Hibaüzenet megfelelő

---

**Test 1.3: Hiányzó mező**

```http
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "felhasznalonev": "admin"
  // "jelszo" hiányzik!
}
```

**Várt válasz:**
```
HTTP 400 Bad Request
{
  "error": "Felhasználónév és jelszó megadása kötelező."
}
```

---

#### ✅ **2. PROFIL LEKÉRDEZÉSE**

**Test 2.1: Profil lekérdezése (Valid token)**

```http
GET http://localhost:3000/api/profil
Authorization: Bearer <TOKEN_IDE>
```

**Utasítás:**
1. Az admin bejelentkezéséből másold ki a tokent
2. Cseréld le a `<TOKEN_IDE>` helyét

**Várt válasz:**
```
HTTP 200 OK
{
  "id": 1,
  "nev": "Admin",
  "felhasznalonev": "admin",
  "szerep": "admin"
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **200**
- ✅ Válaszban NINCS `jelszo` mező
- ✅ Az ID, név, felhasználónév, szerep helyesen jelenik meg

---

**Test 2.2: Profil lekérdezése (Token nélkül)**

```http
GET http://localhost:3000/api/profil
```

**Várt válasz:**
```
HTTP 401 Unauthorized
{
  "error": "Hiányzó vagy érvénytelen token."
}
```

---

#### ✅ **3. HIBÁK LISTÁZÁSA**

**Test 3.1: Összes hiba**

```http
GET http://localhost:3000/api/hibak
Authorization: Bearer <TANAR_TOKEN>
```

**Várt válasz:**
```
HTTP 200 OK
[
  {
    "id": 1,
    "datum": "2026-03-15",
    "bejelento_id": 2,
    "terem": "101-es terem",
    "leiras": "WiFi nincs",
    "allapot": "bejelentve",
    "javito_id": null,
    "javitas_datuma": null
  },
  ...
]
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **200**
- ✅ Array visszaküldve
- ✅ Legfrissebbek elöl (datum DESC)

---

**Test 3.2: Szűrés "bejelentve" állapotra**

```http
GET http://localhost:3000/api/hibak?allapot=bejelentve
Authorization: Bearer <TOKEN>
```

**Várt válasz:**
```
HTTP 200 OK
[
  {
    "id": 2,
    "allapot": "bejelentve",
    ...
  }
]
```

**Ellenőrzési pontok:**
- ✅ Csak "bejelentve" állapotú hibák
- ✅ "kijavítva" hibák NINCSENEK

---

**Test 3.3: Érvénytelen szűrés**

```http
GET http://localhost:3000/api/hibak?allapot=rossz_allapot
Authorization: Bearer <TOKEN>
```

**Várt válasz:**
```
HTTP 400 Bad Request
{
  "error": "Érvénytelen \"allapot\" paraméter."
}
```

---

#### ✅ **4. ÚJ HIBA BEJELENTÉSE**

**Test 4.1: Tanár bejelent hibát**

```http
POST http://localhost:3000/api/hibak
Authorization: Bearer <TANAR_TOKEN>
Content-Type: application/json

{
  "terem": "Teszt Terem",
  "leiras": "Teszt hiba leírása"
}
```

**Várt válasz:**
```
HTTP 201 Created
{
  "id": 10,
  "datum": "2026-03-16",
  "bejelento_id": 2,
  "terem": "Teszt Terem",
  "leiras": "Teszt hiba leírása",
  "allapot": "bejelentve",
  "javito_id": null,
  "javitas_datuma": null
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **201**
- ✅ `datum` = ma (2026-03-16)
- ✅ `allapot` = "bejelentve"
- ✅ `bejelento_id` = tanár ID-ja (2)

---

**Test 4.2: Karbantartó bejelent hibát (SIKERTELEN)**

```http
POST http://localhost:3000/api/hibak
Authorization: Bearer <KARBANTARTO_TOKEN>
Content-Type: application/json

{
  "terem": "Teszt",
  "leiras": "Ez nem szabad, hogy működjön"
}
```

**Várt válasz:**
```
HTTP 403 Forbidden
{
  "error": "Nincs jogosultsága ehhez a művelethez."
}
```

---

**Test 4.3: Hiányzó mezők**

```http
POST http://localhost:3000/api/hibak
Authorization: Bearer <TANAR_TOKEN>
Content-Type: application/json

{
  "terem": "Teszt"
  // "leiras" hiányzik!
}
```

**Várt válasz:**
```
HTTP 400 Bad Request
{
  "error": "A terem és a leírás megadása kötelező."
}
```

---

#### ✅ **5. FELHASZNÁLÓK LISTÁZÁSA**

**Test 5.1: Felhasználók listázása (Admin)**

```http
GET http://localhost:3000/api/felhasznalok
Authorization: Bearer <ADMIN_TOKEN>
```

**Várt válasz:**
```
HTTP 200 OK
[
  {
    "id": 1,
    "nev": "Admin",
    "felhasznalonev": "admin",
    "szerep": "admin"
  },
  {
    "id": 2,
    "nev": "Kiss Péter",
    "felhasznalonev": "kissp",
    "szerep": "tanar"
  },
  ...
]
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **200**
- ✅ Válaszban NINCS `jelszo` mező!
- ✅ Összes felhasználó listázva

---

#### ✅ **6. ÚJ FELHASZNÁLÓ LÉTREHOZÁSA**

**Test 6.1: Admin létrehoz felhasználót**

```http
POST http://localhost:3000/api/felhasznalok
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "nev": "Test User",
  "felhasznalonev": "testuser123",
  "jelszo": "SecurePass123",
  "szerep": "tanar"
}
```

**Várt válasz:**
```
HTTP 201 Created
{
  "id": 7,
  "nev": "Test User",
  "felhasznalonev": "testuser123",
  "szerep": "tanar"
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **201**
- ✅ Válaszban NINCS `jelszo`
- ✅ ID auto-increment: 7

---

**Test 6.2: Tanár próbál felhasználót létrehozni (SIKERTELEN)**

```http
POST http://localhost:3000/api/felhasznalok
Authorization: Bearer <TANAR_TOKEN>
Content-Type: application/json

{
  "nev": "Illegal User",
  "felhasznalonev": "illegal",
  "jelszo": "Pass123",
  "szerep": "admin"
}
```

**Várt válasz:**
```
HTTP 403 Forbidden
{
  "error": "Nincs jogosultsága ehhez a művelethez."
}
```

---

**Test 6.3: Dupla felhasználónév (SIKERTELEN)**

```http
POST http://localhost:3000/api/felhasznalok
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "nev": "Another Admin",
  "felhasznalonev": "admin",  // Már létezik!
  "jelszo": "Pass123",
  "szerep": "admin"
}
```

**Várt válasz:**
```
HTTP 409 Conflict
{
  "error": "A felhasználónév már foglalt."
}
```

---

**Test 6.4: Érvénytelen szerep**

```http
POST http://localhost:3000/api/felhasznalok
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "nev": "Wrong Role",
  "felhasznalonev": "wrongrole",
  "jelszo": "Pass123",
  "szerep": "diak"  // ÉRVÉNYTELEN!
}
```

**Várt válasz:**
```
HTTP 400 Bad Request
{
  "error": "Érvénytelen szerepkör. Lehetséges értékek: admin, tanar, karbantarto."
}
```

---

#### ✅ **7. FELHASZNÁLÓ TÖRLÉSE**

**Test 7.1: Admin töröl felhasználót**

```http
DELETE http://localhost:3000/api/felhasznalok/7
Authorization: Bearer <ADMIN_TOKEN>
```

**Várt válasz:**
```
HTTP 200 OK
{
  "message": "A(z) 7 azonosítójú felhasználó sikeresen törölve."
}
```

---

**Test 7.2: Admin próbálja magát törölni (SIKERTELEN)**

```http
DELETE http://localhost:3000/api/felhasznalok/1
Authorization: Bearer <ADMIN_TOKEN>
```

**Várt válasz:**
```
HTTP 400 Bad Request
{
  "error": "Adminisztrátor nem törölheti saját magát."
}
```

---

**Test 7.3: Felhasználó törlése, aki bejelentett hibát (SIKERTELEN)**

```http
DELETE http://localhost:3000/api/felhasznalok/2
Authorization: Bearer <ADMIN_TOKEN>
```

**Várt válasz:**
```
HTTP 409 Conflict
{
  "error": "A felhasználó nem törölhető, mert kapcsolódó hibabejegyzési (bejelentőként vagy javítóként) vannak."
}
```

---

#### ✅ **8. HIBA KIJAVÍTÁSA**

**Test 8.1: Karbantartó javít hibát**

```http
PUT http://localhost:3000/api/hibak/2/javitas
Authorization: Bearer <KARBANTARTO_TOKEN>
```

**Várt válasz:**
```
HTTP 200 OK
{
  "id": 2,
  "datum": "2026-03-16",
  "bejelento_id": 2,
  "terem": "Nyomtató",
  "lesias": "Papír vége",
  "allapot": "kijavítva",
  "javito_id": 3,
  "javitas_datuma": "2026-03-16"
}
```

**Ellenőrzési pontok:**
- ✅ HTTP státusz: **200**
- ✅ `allapot` = "kijavítva"
- ✅ `javito_id` = 3 (karbantartó ID)
- ✅ `javitas_datuma` = ma

---

**Test 8.2: Tanár próbál hibát javítani (SIKERTELEN)**

```http
PUT http://localhost:3000/api/hibak/1/javitas
Authorization: Bearer <TANAR_TOKEN>
```

**Várt válasz:**
```
HTTP 403 Forbidden
{
  "error": "Nincs jogosultsága ehhez a művelethez."
}
```

---

**Test 8.3: Már kijavított hibát újra javítani (SIKERTELEN)**

```http
PUT http://localhost:3000/api/hibak/2/javitas
Authorization: Bearer <KARBANTARTO_TOKEN>
```

**Várt válasz:**
```
HTTP 409 Conflict
{
  "error": "A hiba már ki van javítva."
}
```

---

### 2.3 curl Parancsok (Terminál Teszteléshez)

#### Bejelentkezés:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"felhasznalonev":"admin","jelszo":"Minad123"}'
```

#### Profil lekérdezése (token szükséges):
```bash
curl -X GET http://localhost:3000/api/profil \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Új hiba bejelentése:
```bash
curl -X POST http://localhost:3000/api/hibak \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"terem":"101-es terem","leiras":"Hiba"}'
```

---

## 3. 🖥️ Manuális Felhasználói Tesztelés (Frontend)

### 3.1 Bejelentkezés Tesztelése

#### Teszteset: LT-01 – Sikeres bejelentkezés tanárként

**Lépések:**
1. Nyisd meg a böngészőt: `http://localhost:3000`
2. Felhasználónév: `kissp`
3. Jelszó: `kissp`
4. Kattints: "Bejelentkezés"

**Ellenőrzési pontok:**
- ✅ Átirányítás a `main.html` oldalra
- ✅ Navigációs sávban: "Bejelentkezve: Kiss Péter (tanar)"
- ✅ "Új hiba rögzítése" form **LÁTHATÓ**
- ✅ "Felhasználók" link **NEM LÁTHATÓ**

---

#### Teszteset: LA-01 – Sikeres bejelentkezés adminként

**Lépések:**
1. Felhasználónév: `admin`
2. Jelszó: `Minad123`
3. "Bejelentkezés"

**Ellenőrzési pontok:**
- ✅ Átirányítás sikeres
- ✅ Navigációs sáv: "Bejelentkezve: Admin (admin)"
- ✅ "Új hiba rögzítése" form **LÁTHATÓ**
- ✅ "Felhasználók" link **LÁTHATÓ** ← admin különleges!

---

#### Teszteset: LK-01 – Sikeres bejelentkezés karbantartóként

**Lépések:**
1. Felhasználónév: `szabob`
2. Jelszó: `szabob`
3. "Bejelentkezés"

**Ellenőrzési pontok:**
- ✅ Átirányítás sikeres
- ✅ Navigációs sáv: "Bejelentkezve: Szabó Béla (karbantarto)"
- ✅ "Új hiba rögzítése" form **NEM LÁTHATÓ** ← nem tanár/admin!
- ✅ "Felhasználók" link **NEM LÁTHATÓ** ← nem admin!

---

#### Teszteset: L-02 – Hibás jelszó

**Lépések:**
1. Felhasználónév: `admin`
2. Jelszó: `rossz`
3. "Bejelentkezés"

**Ellenőrzési pontok:**
- ✅ Nem irányít át
- ✅ Hibaüzenet: "Hibás felhasználónév vagy jelszó."
- ✅ Marad a bejelentkezési oldalon

---

### 3.2 Hibajegyek Kezelésének Tesztelése

#### Teszteset: HL-01 – Hibák listázása (Összes)

**Lépések:**
1. Bejelentkezés tanárként
2. Főoldal megnyitása
3. Szűrő: "Összes" (alapértelmezett)

**Ellenőrzési pontok:**
- ✅ Hibák táblázata **LÁTHATÓ**
- ✅ Oszlopok: Dátum, Terem, Leírás, Állapot, Bejelentő, Javító, Mikor, Műveletek
- ✅ Legfrissebbek elöl

---

#### Teszteset: HL-02 – Szűrés: Bejelentve

**Lépések:**
1. Szűrő legördülő: "Bejelentve"
2. Várakozás az újratöltésre

**Ellenőrzési pontok:**
- ✅ Csak "bejelentve" (sárga badge) hibák láthatók
- ✅ "kijavítva" hibák NEM láthatók

---

#### Teszteset: HL-03 – Szűrés: Kijavítva

**Lépések:**
1. Szűrő legördülő: "Kijavítva"

**Ellenőrzési pontok:**
- ✅ Csak "kijavítva" (zöld badge) hibák láthatók
- ✅ "bejelentve" hibák NEM láthatók

---

#### Teszteset: HÚ-01 – Új hiba bejelentése tanárként

**Lépések:**
1. Bejelentkezés tanárként
2. "Új hiba rögzítése" formban:
   - Terem: `Teszt Terem`
   - Leírás: `Ez egy teszt hiba`
3. "Hiba bejelentése" gomb

**Ellenőrzési pontok:**
- ✅ Form kiürül
- ✅ Új hiba megjelenik a táblázat tetején
- ✅ Állapot: "bejelentve" (sárga)
- ✅ Bejelentő: "Kiss Péter" (bejelentkezett tanár)
- ✅ Sikeres üzenet jelenik meg

---

#### Teszteset: HÚ-04 – Hiányzó mezők

**Lépések:**
1. Terem: üres hagyni
2. Leírás: `Valami`
3. "Hiba bejelentése"

**Ellenőrzési pontok:**
- ✅ Hibaüzenet: "A terem és a leírás megadása kötelező."
- ✅ Form NEM ürül ki
- ✅ Hiba NEM kerül rögzítésre

---

#### Teszteset: HJ-01 – Hiba kijavítása karbantartóként

**Lépések:**
1. Bejelentkezés karbantartóként
2. Egy "bejelentve" hiba sorában: "Javítás" gomb
3. Kattintás

**Ellenőrzési pontok:**
- ✅ Hiba állapota: "bejelentve" → "kijavítva"
- ✅ Badge: sárga → zöld
- ✅ Javító: "Szabó Béla" (karbantartó)
- ✅ Mikor: mai dátum
- ✅ "Javítás" gomb eltűnik

---

#### Teszteset: HJ-03 – Tanár nem javíthat

**Lépések:**
1. Bejelentkezés tanárként
2. Egy "bejelentve" hiba sorát megnézi

**Ellenőrzési pontok:**
- ✅ "Javítás" gomb **NEM LÁTHATÓ**
- ✅ Csak "Műveletek" oszlopban semmi

---

### 3.3 Felhasználókezelés (Admin)

#### Teszteset: UM-01 – Felhasználókezelő oldal

**Lépések:**
1. Bejelentkezés adminként
2. Navigációs sáv: "Felhasználók" link
3. Kattintás

**Ellenőrzési pontok:**
- ✅ Átirányítás: `admin_users.html`
- ✅ "Új felhasználó hozzáadása" form **LÁTHATÓ**
- ✅ "Meglévő felhasználók" táblázat **LÁTHATÓ**

---

#### Teszteset: UM-02 – Új felhasználó hozzáadása

**Lépések:**
1. Felhasználókezelő oldalon
2. Form kitöltése:
   - Név: `Teszt Felhasználó`
   - Felhasználónév: `tesztfelh`
   - Jelszó: `TesztPass123`
   - Szerep: `tanar`
3. "Felhasználó hozzáadása" gomb

**Ellenőrzési pontok:**
- ✅ Form kiürül
- ✅ Új felhasználó megjelenik a táblázatban
- ✅ Sikeres üzenet

---

#### Teszteset: UM-03 – Felhasználó törlése

**Lépések:**
1. Felhasználókezelő oldalon
2. Az előbb létrehozott felhasználó sorában: "Törlés" gomb
3. OK a megerősítésre

**Ellenőrzési pontok:**
- ✅ Felhasználó eltűnik a táblázatból
- ✅ Sikeres üzenet
- ✅ Adatbázisban nincsen meg (ellenőrizhetö: `sqlite3 hibabejelento.db "SELECT * FROM felhasznalok WHERE felhasznalonev='tesztfelh';"`

---

#### Teszteset: UM-04 – Admin nem törölheti magát

**Lépések:**
1. Felhasználókezelő oldalon
2. Az `admin` sor keresése

**Ellenőrzési pontok:**
- ✅ "Törlés" gomb **NEM LÁTHATÓ** az admin soron
- ✅ Biztonsági intézkedés működik

---

#### Teszteset: UM-05 – Nem törölhető felhasználó

**Lépések:**
1. Felhasználókezelő oldalon
2. A `kissp` (Kiss Péter) sorában: "Törlés"
3. OK a megerősítésre

**Ellenőrzési pontok:**
- ✅ Hibaüzenet: "A felhasználó nem törölhető, mert kapcsolódó hibabejegyzései vannak."
- ✅ Felhasználó NEM törlődik

---

### 3.4 Reszponzivitás Tesztelése

#### Teszteset: UI-01 – Mobil álló nézet

**Lépések:**
1. Developer Tools (F12)
2. Mobil nézet (Device Toolbar)
3. iPhone X vagy hasonló (375px szélesség)
4. Oldal böngészése

**Ellenőrzési pontok:**
- ✅ Navigációs sáv "hamburger" menü (☰)
- ✅ Gombók kattinthatóak
- ✅ Form olvasható és kitölthető
- ✅ Táblázat vízszintesen görgethető (ha szükséges)

---

#### Teszteset: UI-02 – Tablet fekvő nézet

**Lépések:**
1. Mobil nézet: iPad Pro (1024px)
2. Fekvő tájolás

**Ellenőrzési pontok:**
- ✅ Elrendezés megfelelő
- ✅ Táblázat jól megjelenítve

---

### 3.5 Kijelentkezés Tesztelése

#### Teszteset: LO-01 – Kijelentkezés

**Lépések:**
1. Bejelentkezés
2. Navigációs sáv: "Kijelentkezés"
3. Kattintás

**Ellenőrzési pontok:**
- ✅ Átirányítás: `index.html` (bejelentkezési oldal)
- ✅ sessionStorage: `authToken` törlödik
- ✅ Ismét be kell jelentkezni az oldalak eléréséhez

---

## 4. ✅ Tesztelési Checklist

### Backend (API) Tesztelés

- [ ] **Bejelentkezés**
  - [ ] Admin bejelentkezése - sikeres
  - [ ] Hibás jelszó - 401 hiba
  - [ ] Hiányzó mező - 400 hiba
  - [ ] Nem létezö felhasználó - 401 hiba

- [ ] **Profil**
  - [ ] Profil lekérdezése tokennel - sikeres
  - [ ] Token nélkül - 401 hiba
  - [ ] Érvénytelen token - 403 hiba
  - [ ] Jelszó nincs visszaküldve - ✅

- [ ] **Hibák**
  - [ ] Összes hiba listázása - sikeres
  - [ ] Szűrés "bejelentve"-re - sikeres
  - [ ] Szűrés "kijavítva"-ra - sikeres
  - [ ] Érvénytelen szűrés - 400 hiba
  - [ ] Új hiba tanárként - 201
  - [ ] Új hiba karbantartóként - 403 hiba
  - [ ] Hiányzó mezők - 400 hiba
  - [ ] Hiba kijavítása karbantartóként - 200
  - [ ] Hiba kijavítása tanárként - 403 hiba
  - [ ] Már kijavított hibát "javítani" - 409 hiba

- [ ] **Felhasználók**
  - [ ] Felhasználók listázása - 200 (jelszó nélkül)
  - [ ] Új felhasználó adminként - 201
  - [ ] Új felhasználó tanárként - 403 hiba
  - [ ] Dupla felhasználónév - 409 hiba
  - [ ] Érvénytelen szerep - 400 hiba
  - [ ] Felhasználó törlése adminként - 200
  - [ ] Admin self-delete - 400 hiba
  - [ ] Kapcsolódó hibájú felhasználó törlése - 409 hiba

### Frontend (UI) Tesztelés

- [ ] **Bejelentkezés**
  - [ ] Tanár bejelentkezése - sikeres
  - [ ] Admin bejelentkezése - sikeres, extra link
  - [ ] Karbantartó bejelentkezése - sikeres
  - [ ] Hibás jelszó - hibaüzenet
  - [ ] Üres form - hibaüzenet

- [ ] **Főoldal - Tanárként**
  - [ ] Profil megjelenítése
  - [ ] "Új hiba rögzítése" form LÁTHATÓ
  - [ ] "Felhasználók" link NINCS
  - [ ] Hibák listázása
  - [ ] Szűrés működik
  - [ ] Hiba bejelentése
  - [ ] "Javítás" gomb NINCS (tanárnak)
  - [ ] Kijelentkezés működik

- [ ] **Főoldal - Karbantartóként**
  - [ ] Profil megjelenítése
  - [ ] "Új hiba rögzítése" form NINCS
  - [ ] "Felhasználók" link NINCS
  - [ ] Hibák listázása
  - [ ] "Javítás" gomb LÁTHATÓ
  - [ ] Hiba kijavítása

- [ ] **Főoldal - Adminként**
  - [ ] Profil megjelenítése
  - [ ] "Új hiba rögzítése" form LÁTHATÓ
  - [ ] "Felhasználók" link LÁTHATÓ ← special
  - [ ] Hibák listázása
  - [ ] Hiba bejelentése
  - [ ] Hiba kijavítása
  - [ ] Kijelentkezés

- [ ] **Felhasználókezelés (Admin)**
  - [ ] Oldal megnyitása
  - [ ] Felhasználó hozzáadása
  - [ ] Új felhasználó megjelenik
  - [ ] Felhasználó törlése
  - [ ] Felhasználó eltűnik
  - [ ] Admin self-delete gomb nincs
  - [ ] Függő felhasználó törlése - hiba

- [ ] **Reszponzivitás**
  - [ ] Mobil (375px) - jó megjelenés
  - [ ] Tablet (768px) - jó megjelenés
  - [ ] Desktop (1024px+) - jó megjelenés
  - [ ] Hamburger menü mobil
  - [ ] Táblázat görgethető szükség esetén

- [ ] **Biztonsági Tesztek**
  - [ ] Jelszó SOHA nem látszódik
  - [ ] Token hiánya → bejelentkezési oldal
  - [ ] Jogosultság hiánya → hibaüzenet
  - [ ] sessionStorage auth token

---

## 5. 🐛 Hibák Dokumentálása

### Hibajegy Sablon

Amikor **HIBÁT találsz**, dokumentáld az alábbiak szerint:

```markdown
## [HB-001] Hiba Titel

**Súlyosság:** 🔴 Kritikus / 🟠 Magas / 🟡 Közepes / 🟢 Alacsony

**Kategória:** API / Frontend / UI / Biztonság

**Leírás:**
[Mi a hiba? Pontosan mit tapasztaltál?]

**Reprodukálás Lépéseiː**
1. [Lépés 1]
2. [Lépés 2]
3. [Lépés 3]

**Elvárt Eredmény:**
[Mi kellene hogy történjen]

**Tényleges Eredmény:**
[Mi történik helyette]

**Környezet:**
- Böngésző: Chrome 120.0 / Firefox 121.0
- OS: Windows 10 / macOS 14
- Szerver: localhost:3000
- Felhasználó: admin / kissp / szabob

**Képernyőkép/Video:**
[Attach screenshot or video]

**Megjegyzések:**
[Bármilyen extra információ]
```

### Hibajegy Példa

```markdown
## [HB-001] Admin nem tud bejelentkezni Minad123 jelszóval

**Súlyosság:** 🔴 Kritikus

**Kategória:** Frontend - Bejelentkezés

**Leírás:**
Admin felhasználó ("admin") nem tud bejelentkezni az "Minad123" jelszóval.

**Reprodukálás Lépéseiː**
1. Nyissz meg http://localhost:3000
2. Felhasználónév: admin
3. Jelszó: Minad123
4. Kattints a "Bejelentkezés" gombra

**Elvárt Eredmény:**
Sikeresen bejelentkezik és átirányítódik a main.html oldalra

**Tényleges Eredmény:**
Hibaüzenet: "Hibás felhasználónév vagy jelszó."

**Környezet:**
- Böngészö: Chrome 120
- OS: Windows 10
- Szerver: localhost:3000

**Megjegyzések:**
API tesztelésnél működik, csak a frontend-en van gond.
```

---

## 6. 📊 Tesztelési Riport Sablon

### Tesztelési Riport - [Dátum]

```markdown
# Tesztelési Riport – 2026. március 16.

## Összefoglalás

- **Tesztelés Dátuma:** 2026-03-16
- **Tesztelő:** [Neved]
- **Tesztelt Verzió:** v1.0
- **Szerver:** localhost:3000
- **Adatbázis:** hibabejelento.db

## Tesztelési Terjedelem

### Backend (API) - Tesztelve
- ✅ Bejelentkezés (admin, tanár, karbantartó)
- ✅ Profil lekérdezése
- ✅ Hibák listázása és szűrése
- ✅ Új hiba bejelentése
- ✅ Hiba kijavítása
- ✅ Felhasználók kezelése
- ✅ Jogosultságok ellenőrzése

### Frontend (UI) - Tesztelve
- ✅ Bejelentkezés
- ✅ Főoldal (összes rolle)
- ✅ Hibajegyek kezelése
- ✅ Felhasználókezelés (admin)
- ✅ Reszponzivitás
- ✅ Kijelentkezés

## Tesztelési Eredmények

### Összesített Statisztika

| Kategória | Tesztek Száma | Sikeres | Sikertelen | Jóváhagyatlan |
|-----------|---------------|---------|-----------|--------------|
| API | 25 | 25 | 0 | 0 |
| Frontend | 20 | 20 | 0 | 0 |
| UI/UX | 5 | 5 | 0 | 0 |
| **Összesen** | **50** | **50** | **0** | **0** |

### Sikeres Tesztek
1. ✅ TT-01: Bejelentkezés tanárként
2. ✅ TA-01: Bejelentkezés adminként
3. ✅ TK-01: Bejelentkezés karbantartóként
... (és még 47 teszt)

### Sikertelen Tesztek
- ❌ NINCS

### Jóváhagyatlan Tesztek
- ❌ NINCS

## Hibák

### Kritikus (🔴)
- Nincs

### Magas (🟠)
- Nincs

### Közepes (🟡)
- Nincs

### Alacsony (🟢)
- Nincs

## Javaslatok

1. Biztonsági audit végzése (jelszó reset, 2FA)
2. Load testing (1000+ felhasználó szimultán)
3. HTTPS konfigurálása éles környezetben

## Jóváhagyás

- **Tesztelő:** [Neved]
- **Dátum:** 2026-03-16
- **Aláírás:** _____________________

---

**Status:** ✅ **JÓVÁHAGYVA** (minden teszt sikeres)
```

---

## 📝 Tesztelési Naplózás

Nyomonkövetéshez hozz létre egy `TESTING_LOG.md` fájlt:

```markdown
# Tesztelési Napló

## 2026-03-16 – 09:00

### Munkamenet: Backend API Tesztelés
- Bejelentkezés tesztelése: ✅ OK
- Profil endpoint: ✅ OK
- Hibák listázása: ✅ OK
- Új hiba bejelentése: ✅ OK
- Felhasználók: ✅ OK

### Megjegyzések:
Admin bejelentkezés működik. API összes végpontja reagál helyesen.

---

## 2026-03-16 – 10:00

### Munkamenet: Frontend UI Tesztelés
- Bejelentkezés form: ✅ OK
- Hibajegyek táblázat: ✅ OK
- Szűrés: ✅ OK
- Felhasználókezelés: ✅ OK

### Megjegyzések:
UI működik mind az 3 szerepkörrel. Reszponzivitás jó.

---
```

---

## 🎯 Tesztelési Stratégia Summaryː

1. **Napi Tesztelés:** 
   - Backend API-k: curl/REST Client
   - Frontend: Böngésző (Chrome, Firefox)
   - Adatbázis integrítás ellenőrzése

2. **Heti Tesztelés:**
   - Teljes UI tesztelés
   - Reszponzívitási tesztelés
   - Biztonsági tesztek (brute force, injection, stb.)

3. **Kiadás Előtti Tesztelés:**
   - Teljes tesztelési riport
   - Képernyőképek és videók
   - Teljesítménytesztek
   - Végfelhasználó feedback

---

Sok sikert a teszteléshez! 🧪✨

Ha bármi kérdés van, nyiss egy GitHub issuet vagy beszélj a **backend-felelős**sel! 👨‍💻
