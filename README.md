# Hibabejelentő

## Vizsgaremek (2026. május)

Iskolánk számára készítettünk egy hálózati hibabejelentő rendszert. Ebben a felületen a tanárok rögzíthetik az iskolában tapasztalt hálózati vagy rendszerszintű hibákat, amelyeket ezt követően a rendszergazda javít.

A projekt célja egy olyan webes hibabejelentő és hibanyilvántartó rendszer létrehozása, amely számítógépről és mobilról is könnyen elérhető. 

Az adatok egy adatbázisban kerülnek tárolásra, amelyhez egy API-n keresztül lehet hozzáférni. Az elkészült alkalmazás ezen az API-n keresztül tölti le és jeleníti meg a szükséges információkat.

* * *

## Telepítés és futtatás

### Szükséges szoftverek

* Node.js v22.22.2 LTS verzió
* npm (Node.js-sel együtt települ)

### Konfiguráció

1. Klónozd a projekt repository-t.

2. Navigálj a projekt gyökérkönyvtárába.

3. Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő tartalommal (Cseréld le a `JWT_SECRET` értékét egy titkos kulcsra):
   
   ```
   JWT_SECRET=generalt_eros_titkos_kulcs_legyen_itt
   DB_PATH=./hibabejelento.db
   PORT=3000
   ```

4. Telepítsd a függőségeket: `npm install`

5. Hozz létre felhasználókat az adatbázisban. Ezt a legegyszerűbben a `tesztadatok.sql` fájlban lévő parancsok futtatásával tudod megtenni:
   `sqlite3 hibabejelento.db < tests/tesztadatok.sql`
   A tesztadatokban nem csak felhasználók vannak, hanem néhány bejelentett/kijavított hiba is a teszteléshez.

### Indítás

* A szerver indítása: `npm start` vagy `node server.js`
* Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

## Dokumentáció

* A specifikáció, valamint a frontend és a backend dokumentációja a [docs mappában](docs) található.

## Tesztelés

* A manuális teszteket a [tests mappában](tests) találhatja.
