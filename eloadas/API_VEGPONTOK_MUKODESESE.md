# API Végpontok Részletes Működése

> Ez a dokumentáció részletezően leírja, hogy az egyes API végpontok hogyan működnek, mi történik a háttérben, és milyen lépésekkel dolgoznak a bejelentkezéstől a hibák kezeléséig.

---

## 📚 Tartalomjegyzék

1. [Bejelentkezés (Login)](#1-bejelentkezés---post-apilogin)
2. [Profil Lekérdezése](#2-profil-lekérdezése---get-apiprofil)
3. [Hibák Listázása](#3-hibák-listázása---get-apihibak)
4. [Új Hiba Bejelentése](#4-új-hiba-bejelentése---post-apihibak)
5. [Felhasználók Listázása](#5-felhasználók-listázása---get-apifelhasznalok)
6. [Új Felhasználó Létrehozása](#6-új-felhasználó-létrehozása---post-apifelhasznalok)
7. [Felhasználó Törlése](#7-felhasználó-törlése---delete-apifelhasznalokid)
8. [Hiba Kijavítása](#8-hiba-kijavítása---put-apihibakidjavitas)

---

## 🔐 Általános Működés

### API Alapok
- **Alap URL:** `http://localhost:3000/api`
- **Adatformátum:** JSON
- **Autentikáció:** JWT (JSON Web Token) – az összes végpontnál, kivéve a `/login`

### JWT Token
A sikeres bejelentkezés után a szerver egy **JWT tokent** generál, amely:
- ✅ Tartalmazza a felhasználó ID-ját, felhasználónevét és szerepét
- ✅ 1 órás érvényességgel rendelkezik
- ✅ A frontend ezt a `sessionStorage`-ben tárja
- ✅ Minden további kérésben `Authorization: Bearer <token>` headerben kerül elküldésre

---

## 1. 🔑 Bejelentkezés - `POST /api/login`

### Mi történik?
Ez az **első lépés** – a felhasználó bejelentkezik a rendszerbe.

### Lépésről Lépésre

```
1. Kérés érkezik
   ↓
2. Felhasználónév és jelszó ellenőrzése
   ↓
3. Jelszó hash-ének összehasonlítása
   ↓
4. JWT token generálása (1 órás lejárattal)
   ↓
5. Token visszaküldése a kliensnek
```

### Részletes folyamat

**Kérés:**
```json
POST /api/login
Content-Type: application/json

{
  "felhasznalonev": "tanar1",
  "jelszo": "jelszo"
}
```

**Mi történik a szerveren:**

```javascript
// 1. Felhasználónév és jelszó ellenőrzése
const { felhasznalonev, jelszo } = req.body;

// 2. Ha nem adtak meg egyiket sem → 400 hiba
if (!felhasznalonev || !jelszo) {
  return res.status(400).json({ 
    error: 'Felhasználónév és jelszó megadása kötelező.' 
  });
}

// 3. Felhasználó keresése az adatbázisban
const user = dbGet('SELECT * FROM felhasznalok WHERE felhasznalonev = ?', [felhasznalonev]);

// 4. Ha nem található → 401 hiba (Unauthorized)
if (!user) {
  return res.status(401).json({ 
    error: 'Hibás felhasználónév vagy jelszó.' 
  });
}

// 5. Jelszó ellenőrzése (bcrypt hash összehasonlítás)
const validPassword = await bcrypt.compare(jelszo, user.jelszo);

// 6. Ha a jelszó hibás → 401 hiba
if (!validPassword) {
  return res.status(401).json({ 
    error: 'Hibás felhasználónév vagy jelszó.' 
  });
}

// 7. JWT Token generálása
const accessTokenPayload = {
  id: user.id,
  felhasznalonev: user.felhasznalonev,
  szerep: user.szerep
};

const token = jwt.sign(accessTokenPayload, JWT_SECRET, { 
  expiresIn: '1h'  // 1 órán belül lejár
});

// 8. Token visszaküldése
res.json({ token });
```

**Sikeres válasz (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZmVsaGFzenphbG9uZXYiOiJ0YW5hcjEiLCJzemVyZXAiOiJ0YW5hciIsImlhdCI6MTY3ODg4NjQwMCwiZXhwIjoxNjc4ODkwMDAwfQ..."
}
```

**Mi történik után (kliens oldalon):**
```javascript
// 1. Token mentése
sessionStorage.setItem('authToken', token);

// 2. Átirányítás a főoldalra
window.location.href = 'main.html';
```

### Hibalehetőségek

| Hiba | HTTP Kód | Oka |
|------|----------|-----|
| `Felhasználónév és jelszó megadása kötelező.` | 400 | Üres mező |
| `Hibás felhasználónév vagy jelszó.` | 401 | Nem létezik felhasználó VAGY jelszó hibás |
| Szerverhiba | 500 | Adatbázis vagy egyéb technikai probléma |

---

## 2. 👤 Profil Lekérdezése - `GET /api/profil`

### Mi történik?
A bejelentkezett felhasználó **saját adatait** lekéri a szervertől.

### Lépésről Lépésre

```
1. Kérés érkezik JWT tokennel
   ↓
2. Token validálása
   ↓
3. Felhasználó keresése az adatbázisban
   ↓
4. Adatok visszaküldése (jelszó NÉLKÜL!)
```

### Részletes folyamat

**Kérés:**
```
GET /api/profil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Mi történik a szerveren:**

```javascript
// 1. Middleware: Token validálása
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Token hiányzik
  if (!token) return res.status(401).json({ error: 'Hiányzó vagy érvénytelen token.' });
  
  // Token validálása
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Érvénytelen token vagy lejárt munkamenet.' });
    req.user = user;  // Felhasználó info beillesztése a requestbe
    next();
  });
}

// 2. Végpont logika
const userProfile = dbGet('SELECT id, nev, felhasznalonev, szerep FROM felhasznalok WHERE id = ?', 
                          [req.user.id]);

// 3. Ha nem található → 404 hiba
if (!userProfile) {
  return res.status(404).json({ error: "Felhasználó nem található." });
}

// 4. Adatok visszaküldése
res.json(userProfile);
```

**Sikeres válasz (200 OK):**
```json
{
  "id": 2,
  "nev": "Kiss Péter",
  "felhasznalonev": "tanar1",
  "szerep": "tanar"
}
```

### Biztonsági aspektusok

✅ **Mi NEM kerül vissza:** Jelszó hash (soha!)  
✅ **Mi kerül vissza:** Csak publikus adat (név, szerep)  
✅ **Ki elérheti:** Csak a bejelentkezett felhasználó saját adatait

---

## 3. 📋 Hibák Listázása - `GET /api/hibak`

### Mi történik?
Az alkalmazás **lekéri az összes bejelentett hibát**, opcionálisan szűrt állapot szerint.

### Lépésről Lépésre

```
1. Kérés érkezik (opcionális ?allapot paraméterrel)
   ↓
2. Token validálása
   ↓
3. SQL lekérdezés szerkesztése (szűrés esetén)
   ↓
4. Adatok lekérése az adatbázisból
   ↓
5. Hibák listája visszaküldése (legfrissebbek elöl)
```

### Részletes folyamat

**Kérések példái:**

```
// Összes hiba
GET /api/hibak
Authorization: Bearer <token>

// Csak bejelentve hibák
GET /api/hibak?allapot=bejelentve
Authorization: Bearer <token>

// Csak kijavítva hibák
GET /api/hibak?allapot=kijavítva
Authorization: Bearer <token>
```

**Mi történik a szerveren:**

```javascript
// 1. Paraméter kiolvasása
const { allapot } = req.query;

// 2. SQL lekérdezés alapja
let sql = 'SELECT * FROM hibak';
const params = [];

// 3. Szűrés (ha megadott az allapot)
if (allapot) {
  // Érvénytelen érték ellenőrzése
  if (['bejelentve', 'kijavítva'].includes(allapot)) {
    sql += ' WHERE allapot = ?';
    params.push(allapot);
  } else {
    return res.status(400).json({ 
      error: 'Érvénytelen "allapot" paraméter.' 
    });
  }
}

// 4. Rendezés: legfrissebbek elöl
sql += ' ORDER BY datum DESC, id DESC';

// 5. Adatok lekérése
const hibak = dbAll(sql, params);

// 6. Válasz
res.json(hibak);
```

**Sikeres válasz (200 OK):**
```json
[
  {
    "id": 2,
    "datum": "2026-03-16",
    "bejelento_id": 2,
    "terem": "Nyomtató",
    "leiras": "Papír vége",
    "allapot": "bejelentve",
    "javito_id": null,
    "javitas_datuma": null
  },
  {
    "id": 1,
    "datum": "2026-03-15",
    "bejelento_id": 2,
    "terem": "101-es terem",
    "leiras": "WiFi nincs",
    "allapot": "kijavítva",
    "javito_id": 3,
    "javitas_datuma": "2026-03-16"
  }
]
```

### Mit jelent az egyes mező?

| Mező | Jelent | Ki tölti? |
|------|--------|----------|
| `id` | Hiba egyedi azonosítója | Adatbázis automatikus |
| `datum` | Bejelentés dátuma (YYYY-MM-DD) | Szerver automatikus |
| `bejelento_id` | Ki jelentette be (felhasználó ID) | JWT tokenből |
| `terem` | Hol van a probléma | Tanár/Admin beírása |
| `leiras` | Mi a probléma | Tanár/Admin beírása |
| `allapot` | "bejelentve" vagy "kijavítva" | Szerver (bejelentéskor "bejelentve") |
| `javito_id` | Ki javította (felhasználó ID) | Karbantartó/Admin szerepkörtől |
| `javitas_datuma` | Javítás dátuma (YYYY-MM-DD) | Szerver automatikus |

---

## 4. ➕ Új Hiba Bejelentése - `POST /api/hibak`

### Ki?
Csak **tanárok** és **adminisztrátorok**

### Mi történik?
Az alkalmazás egy **új hiba bejegyzést** hoz létre az adatbázisban.

### Lépésről Lépésre

```
1. Kérés érkezik (terem + leírás)
   ↓
2. Token validálása
   ↓
3. Jogosultság ellenőrzése (tanár vagy admin?)
   ↓
4. Kötelező mezők ellenőrzése
   ↓
5. Új hiba beszúrása az adatbázisba
   ↓
6. Létrehozott hiba visszaküldése
```

### Részletes folyamat

**Kérés:**
```json
POST /api/hibak
Authorization: Bearer <token>
Content-Type: application/json

{
  "terem": "101-es terem",
  "leiras": "Nem lehet internetre kapcsolódni"
}
```

**Mi történik a szerveren:**

```javascript
// 1. Adatok kiolvasása
const { terem, leiras } = req.body;
const currentUser = req.user;  // JWT tokenből

// 2. Jogosultság ellenőrzése
if (currentUser.szerep !== 'tanar' && currentUser.szerep !== 'admin') {
  return res.status(403).json({ 
    error: 'Nincs jogosultsága ehhez a művelethez.' 
  });
}

// 3. Automatikus mezők
const bejelento_id = currentUser.id;           // JWT-ből
const datum = new Date().toISOString().split('T')[0];  // Ma (YYYY-MM-DD)
const allapot = 'bejelentve';                  // Mindig "bejelentve"

// 4. Kötelező mezők ellenőrzése
if (!terem || !leiras) {
  return res.status(400).json({ 
    error: 'A terem és a leírás megadása kötelező.' 
  });
}

// 5. Hiba beszúrása
const result = dbRun(
  'INSERT INTO hibak (datum, bejelento_id, terem, leiras, allapot) VALUES (?, ?, ?, ?, ?)',
  [datum, bejelento_id, terem, leiras, allapot]
);

// 6. Beszúrt hiba lekérése
const ujHiba = dbGet('SELECT * FROM hibak WHERE id = ?', [result.lastInsertRowid]);

// 7. Válasz
res.status(201).json(ujHiba);
```

**Sikeres válasz (201 Created):**
```json
{
  "id": 3,
  "datum": "2026-03-16",
  "bejelento_id": 2,
  "terem": "101-es terem",
  "leiras": "Nem lehet internetre kapcsolódni",
  "allapot": "bejelentve",
  "javito_id": null,
  "javitas_datuma": null
}
```

### Mit csinál a frontend?

```javascript
// 1. Új hibák megjelenítése a táblázatban
// 2. "Hiba sikeresen bejelentve!" üzenet
// 3. Ürítés az input mezőkből
// 4. Oldal frissítése (loadFaults() hívása)
```

---

## 5. 👥 Felhasználók Listázása - `GET /api/felhasznalok`

### Ki?
**Minden hitelesített felhasználó** (tanár, karbantartó, admin)

### Mi történik?
Az alkalmazás **lekéri az összes felhasználó listáját**.

### Lépésről Lépésre

```
1. Kérés érkezik JWT tokennel
   ↓
2. Token validálása
   ↓
3. Felhasználók lekérése az adatbázisból
   ↓
4. Lista visszaküldése (jelszó NÉLKÜL!)
```

### Részletes folyamat

**Kérés:**
```
GET /api/felhasznalok
Authorization: Bearer <token>
```

**Mi történik a szerveren:**

```javascript
// 1. Token ellenőrzése (middleware)
// (már korábban végrehajtva)

// 2. Felhasználók lekérése (jelszó NÉ LKÜL!)
const users = dbAll('SELECT id, nev, felhasznalonev, szerep FROM felhasznalok');

// 3. Válasz
res.json(users);
```

**Sikeres válasz (200 OK):**
```json
[
  {
    "id": 1,
    "nev": "Adminisztrátor",
    "felhasznalonev": "admin",
    "szerep": "admin"
  },
  {
    "id": 2,
    "nev": "Kiss Péter",
    "felhasznalonev": "tanar1",
    "szerep": "tanar"
  },
  {
    "id": 3,
    "nev": "Karbantartó János",
    "felhasznalonev": "karb1",
    "szerep": "karbantarto"
  }
]
```

### Biztonsági megjegyzés

⚠️ **Figyelem:** A jelszó SOHA nem kerül vissza!
- ✅ Visszaadott mezők: `id`, `nev`, `felhasznalonev`, `szerep`
- ❌ NEM adott vissza: `jelszo` (hash)

---

## 6. ➕ Új Felhasználó Létrehozása - `POST /api/felhasznalok`

### Ki?
Csak **adminisztrátorok**

### Mi történik?
Az admin **új felhasználót hoz létre** az alkalmazásban.

### Lépésről Lépésre

```
1. Kérés érkezik (név, felhasználónév, jelszó, szerep)
   ↓
2. Token validálása
   ↓
3. Jogosultság ellenőrzése (admin?)
   ↓
4. Kötelező mezők és szerep ellenőrzése
   ↓
5. Jelszó bcrypt-tel hashelésbe
   ↓
6. Felhasználó beszúrása az adatbázisba
   ↓
7. Létrehozott felhasználó visszaküldése
```

### Részletes folyamat

**Kérés:**
```json
POST /api/felhasznalok
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "nev": "Tesi Jani",
  "felhasznalonev": "tesi_jani",
  "jelszo": "SecurePassword123!",
  "szerep": "tanar"
}
```

**Mi történik a szerveren:**

```javascript
// 1. Token és jogosultság ellenőrzése
const currentUser = req.user;
if (currentUser.szerep !== 'admin') {
  return res.status(403).json({ 
    error: 'Nincs jogosultsága ehhez a művelethez.' 
  });
}

// 2. Adatok kiolvasása
const { nev, felhasznalonev, jelszo, szerep } = req.body;

// 3. Kötelező mezők ellenőrzése
if (!nev || !felhasznalonev || !jelszo || !szerep) {
  return res.status(400).json({ 
    error: 'Minden mező (név, felhasználónév, jelszó, szerep) kitöltése kötelező.' 
  });
}

// 4. Szerep érvényességének ellenőrzése
const validRoles = ['admin', 'tanar', 'karbantarto'];
if (!validRoles.includes(szerep)) {
  return res.status(400).json({ 
    error: `Érvénytelen szerepkör. Lehetséges értékek: ${validRoles.join(', ')}.` 
  });
}

// 5. Jelszó hashelésbe
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

// 6. Felhasználó beszúrása
const result = dbRun(
  'INSERT INTO felhasznalok (nev, felhasznalonev, jelszo, szerep) VALUES (?, ?, ?, ?)',
  [nev, felhasznalonev, hashedPassword, szerep]
);

// 7. Beszúrt felhasználó lekérése (jelszó NÉLKÜL!)
const ujFelhasznalo = dbGet(
  'SELECT id, nev, felhasznalonev, szerep FROM felhasznalok WHERE id = ?',
  [result.lastInsertRowid]
);

// 8. Válasz
res.status(201).json(ujFelhasznalo);
```

**Sikeres válasz (201 Created):**
```json
{
  "id": 7,
  "nev": "Tesi Jani",
  "felhasznalonev": "tesi_jani",
  "szerep": "tanar"
}
```

### Hibalehetőségek

| Hiba | HTTP Kód | Oka |
|------|----------|-----|
| `Nincs jogosultsága...` | 403 | Nem admin a felhasználó |
| `Minden mező... kitöltése kötelező` | 400 | Valami üres |
| `Érvénytelen szerepkör...` | 400 | Szerep nem admin/tanar/karbantarto |
| `A felhasználónév már foglalt.` | 409 | UNIQUE constraint – már létezik |

### A jelszó biztonsága

```javascript
// bcrypt: iteratív hashelés (10 salt round)
// Erre a jelszóra: "SecurePassword123!"

// Szerveren tárolt hash: 
// $2a$10$2i3f8j2L9k...w9j2f93jf92 (60 karakter)

// Bejelentkezéskor:
bcrypt.compare('SecurePassword123!', 
               '$2a$10$2i3f8j2L9k...w9j2f93jf92')
// Eredmény: true vagy false
```

---

## 7. 🗑️ Felhasználó Törlése - `DELETE /api/felhasznalok/:id`

### Ki?
Csak **adminisztrátorok** – de **NEM saját magát**

### Mi történik?
Az admin **kitöröl egy felhasználót** az adatbázisból.

### Lépésről Lépésre

```
1. Kérés érkezik (törlendő felhasználó ID)
   ↓
2. Token validálása
   ↓
3. Jogosultság ellenőrzése (admin?)
   ↓
4. Self-delete ellenőrzése (admin nem törölheti magát)
   ↓
5. Felhasználó létezésének ellenőrzése
   ↓
6. Felhasználó törlése az adatbázisból
   ↓
7. Megerősítés visszaküldése
```

### Részletes folyamat

**Kérés:**
```
DELETE /api/felhasznalok/7
Authorization: Bearer <admin-token>
```

**Mi történik a szerveren:**

```javascript
// 1. Paraméter kiolvasása
const idToDelete = parseInt(req.params.id, 10);

// 2. ID érvényességének ellenőrzése
if (isNaN(idToDelete)) {
  return res.status(400).json({ 
    error: 'Érvénytelen felhasználói ID.' 
  });
}

// 3. Jogosultság ellenőrzése
const currentUser = req.user;
if (currentUser.szerep !== 'admin') {
  return res.status(403).json({ 
    error: 'Nincs jogosultsága ehhez a művelethez.' 
  });
}

// 4. Self-delete ellenőrzése
if (currentUser.id === idToDelete) {
  return res.status(400).json({ 
    error: 'Adminisztrátor nem törölheti saját magát.' 
  });
}

// 5. Felhasználó keresése
const userToDelete = dbGet('SELECT * FROM felhasznalok WHERE id = ?', [idToDelete]);
if (!userToDelete) {
  return res.status(404).json({ 
    error: 'A megadott ID-val nem létezik felhasználó.' 
  });
}

// 6. Felhasználó törlése
const result = dbRun('DELETE FROM felhasznalok WHERE id = ?', [idToDelete]);

// 7. Ellenőrzés: sikeres volt-e a törlés?
if (result.changes === 0) {
  return res.status(404).json({ 
    error: 'A felhasználó törlése nem sikerült, vagy nem található.' 
  });
}

// 8. Megerősítés
res.status(200).json({ 
  message: `A(z) ${idToDelete} azonosítójú felhasználó sikeresen törölve.` 
});
```

**Sikeres válasz (200 OK):**
```json
{
  "message": "A(z) 7 azonosítójú felhasználó sikeresen törölve."
}
```

### Biztonsági szabályok

⚠️ **Admin nem törölheti magát:**
- Ha az admin ID = 1, és admin1 próbál magát törölni:
  - Válasz: `400 Bad Request` – "Adminisztrátor nem törölheti saját magát."

⚠️ **Foreign Key Constraint:**
- Ha a felhasználónak vannak kapcsolódó hibabejegyzései (bejelentő vagy javító):
  - Válasz: `409 Conflict` – "A felhasználó nem törölhető, mert kapcsolódó hibabejegyzései vannak."

---

## 8. ✅ Hiba Kijavítása - `PUT /api/hibak/:id/javitas`

### Ki?
Csak **karbantartók** és **adminisztrátorok**

### Mi történik?
A karbantartó/admin **megjelöli a hibát kijavítottként**, és automatikusan rögzítésre kerülnek az adatok.

### Lépésről Lépésre

```
1. Kérés érkezik (javítandó hiba ID)
   ↓
2. Token validálása
   ↓
3. Jogosultság ellenőrzése (karbantartó vagy admin?)
   ↓
4. Hiba keresése az adatbázisban
   ↓
5. Státusz ellenőrzése (még bejelentve? vagy már kijavítva?)
   ↓
6. Hiba frissítése (státusz, javító, dátum)
   ↓
7. Frissített hiba visszaküldése
```

### Részletes folyamat

**Kérés:**
```
PUT /api/hibak/2/javitas
Authorization: Bearer <karbantarto-token>
```

**Mi történik a szerveren:**

```javascript
// 1. Paraméter kiolvasása
const { id } = req.params;
const currentUser = req.user;

// 2. Automatikus mezők
const javitas_datuma = new Date().toISOString().split('T')[0];  // Ma (YYYY-MM-DD)
const allapot = 'kijavítva';

// 3. Jogosultság ellenőrzése
if (currentUser.szerep !== 'karbantarto' && currentUser.szerep !== 'admin') {
  return res.status(403).json({ 
    error: 'Nincs jogosultsága ehhez a művelethez.' 
  });
}

// 4. Javító ID (JWT-ből)
const javito_id = currentUser.id;

// 5. Hiba keresése
const hiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);

// 6. Ha nem létezik
if (!hiba) {
  return res.status(404).json({ 
    error: 'A megadott ID-val nem létezik hiba.' 
  });
}

// 7. Státusz ellenőrzése (már kijavítva?)
if (hiba.allapot === 'kijavítva') {
  return res.status(409).json({ 
    error: 'A hiba már ki van javítva.' 
  });
}

// 8. Hiba frissítése
dbRun(
  'UPDATE hibak SET allapot = ?, javito_id = ?, javitas_datuma = ? WHERE id = ?',
  [allapot, javito_id, javitas_datuma, id]
);

// 9. Frissített hiba lekérése
const frissitettHiba = dbGet('SELECT * FROM hibak WHERE id = ?', [id]);

// 10. Válasz
res.json(frissitettHiba);
```

**Sikeres válasz (200 OK):**
```json
{
  "id": 2,
  "datum": "2026-03-16",
  "bejelento_id": 2,
  "terem": "Nyomtató",
  "leiras": "Papír vége",
  "allapot": "kijavítva",
  "javito_id": 3,
  "javitas_datuma": "2026-03-16"
}
```

### Mit jeleníti meg a frontend?

```javascript
// 1. A hiba státusza: "Bejelentve" → "Kijavítva" (zöld badge)
// 2. Javító neve: "Karbantartó János" (a felhasználók listájából)
// 3. Javítás dátuma: "2026-03-16"
// 4. A "Javítás" gomb eltűnik (már nem szerkeszthető)
```

### Hibalehetőségek

| Hiba | HTTP Kód | Oka |
|------|----------|-----|
| `Nincs jogosultsága...` | 403 | Nem karbantartó/admin |
| `A megadott ID-val nem létezik hiba` | 404 | Hiba nem található |
| `A hiba már ki van javítva.` | 409 | Kétszer próbál javítani |

---

## 🔄 Teljes Munkafolyamat Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BEJELENTKEZÉS                                                │
│    POST /api/login (felhasználónév + jelszó)                   │
│    → JWT token válasz                                            │
│    → Frontend: sessionStorage-ba mentés                          │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. PROFIL ÉS HIBÁK LEKÉRÉSE                                    │
│    GET /api/profil (bejelentkezett felhasználó adatai)         │
│    GET /api/hibak (összes hiba)                                 │
│    GET /api/felhasznalok (összes felhasználó)                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ↓
       ┌───────┴───────┐
       │ TANÁR / ADMIN │
       └───────┬───────┘
               │
               ↓
   ┌───────────────────────┐
   │ 3. ÚJ HIBA BEJELENTÉS │
   │ POST /api/hibak       │
   │ (terem + leírás)      │
   │ → Új hiba jön létre   │
   └───────┬───────────────┘
           │
           ↓
   ┌────────────────────────────────┐
   │ 4. HIBA LISTÁJÁBAN MEGJELENIK  │
   │    (legfrissebbek elöl)        │
   │    Állapot: "BEJELENTVE"       │
   └────────┬───────────────────────┘
            │
            ├─────────────────────────┐
            │                         │
            ↓                         ↓
   ┌──────────────────┐    ┌──────────────────────┐
   │ KARBANTARTÓ / A  │    │ ADMIN                │
   │                  │    │                      │
   │ 5. HIBA JAVÍTÁSA │    │ 5. FELHASZNÁLÓK      │
   │ PUT /hibak/id/   │    │ POST/DELETE /api/    │
   │ javitas          │    │ felhasznalok         │
   │                  │    │                      │
   │ → Állapot:       │    │ → Új felhasználó     │
   │ "KIJAVÍTVA"      │    │ → Felhasználó törlés │
   │ → Javító: current│    └──────────────────────┘
   │ → Dátum: ma      │
   └──────────┬───────┘
              │
              ↓
   ┌──────────────────────────────┐
   │ 6. HIBA MEGJELENÍTÉSE         │
   │    - Állapot: "KIJAVÍTVA"    │
   │    - Javító neve              │
   │    - Javítás dátuma           │
   │    - "Javítás" gomb: ELTŰNIK │
   └──────────────────────────────┘
```

---

## 📊 Adatbázis Séma

### `felhasznalok` tábla
```sql
CREATE TABLE felhasznalok (
  id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Egyedi ID
  nev TEXT NOT NULL,                         -- Felhasználó teljes neve
  felhasznalonev TEXT UNIQUE NOT NULL,       -- Unique login név
  jelszo TEXT NOT NULL,                      -- bcrypt hash
  szerep TEXT NOT NULL                       -- 'admin', 'tanar', 'karbantarto'
);
```

### `hibak` tábla
```sql
CREATE TABLE hibak (
  id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Egyedi hiba ID
  datum TEXT NOT NULL,                       -- Bejelentés dátuma (YYYY-MM-DD)
  bejelento_id INTEGER NOT NULL,             -- Ki jelentette (FK → felhasznalok)
  terem TEXT NOT NULL,                       -- Hol van a hiba
  leiras TEXT NOT NULL,                      -- Mi a hiba
  allapot TEXT NOT NULL,                     -- 'bejelentve' vagy 'kijavítva'
  javito_id INTEGER,                         -- Ki javította (FK → felhasznalok)
  javitas_datuma TEXT,                       -- Javítás dátuma (YYYY-MM-DD)
  FOREIGN KEY (bejelento_id) REFERENCES felhasznalok(id),
  FOREIGN KEY (javito_id) REFERENCES felhasznalok(id)
);
```

---

## 🔐 Jogosultságkezelés Táblázat

| Végpont | HTTP | Tanár | Karbantartó | Admin | Token szükséges |
|---------|------|-------|-------------|-------|-----------------|
| `/api/login` | POST | ✅ | ✅ | ✅ | ❌ |
| `/api/profil` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/hibak` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/hibak` | POST | ✅ | ❌ | ✅ | ✅ |
| `/api/felhasznalok` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/felhasznalok` | POST | ❌ | ❌ | ✅ | ✅ |
| `/api/felhasznalok/:id` | DELETE | ❌ | ❌ | ✅ | ✅ |
| `/api/hibak/:id/javitas` | PUT | ❌ | ✅ | ✅ | ✅ |

---

## 🚨 HTTP Státuszkódok

| Kód | Jelentés | Mikor? |
|-----|----------|--------|
| `200` | OK | Sikeres GET, PUT |
| `201` | Created | Sikeres POST (új erőforrás) |
| `400` | Bad Request | Érvénytelen adat vagy paraméter |
| `401` | Unauthorized | Token hiányzik vagy érvénytelen |
| `403` | Forbidden | Jogosultság hiánya |
| `404` | Not Found | Erőforrás nem található |
| `409` | Conflict | Már létezik (pl. dupla felhasználónév) |
| `500` | Server Error | Szerverhiba |

---

## 💡 Tippek a Fejlesztéshez

### API Tesztelés
A `tests/api_test.http` fájl segítségével tesztelhetsz API hívásokat VS Code REST Client kiterjesztéssel.

### Error Handling
```javascript
// Kliens oldalon (frontend)
fetch(url, options)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .catch(error => {
    // Hiba kezelése
    alert(`Hiba: ${error.message}`);
  });
```

### Token Refresh
A jelenlegi implementáció 1 órás lejáratú tokent használ. Hosszú munkameneteknél szükséges lehet:
- Token refresh endpoint (`POST /api/refresh`)
- Bejelentkezés ismétlése

---

Remélem, ez a részletes dokumentáció segít megérteni az API működését! 🚀
