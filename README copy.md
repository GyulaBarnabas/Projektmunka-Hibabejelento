# BugsBegone™ 
Elege van abból, hogy jelentenie kell egy problémát az iskolai személyzetnek, majd ők teljesen elfelejtik?
Vagy talán Ön a másik oldalon áll, és Önnek kell megoldania a szóban forgó problémákat, és modern megközelítésre vágyik?
Akárhogy is, többé nem kell aggódnia. A BugsBegone™ azért van itt, hogy mindkét fél számára megkönnyítse a dolgokat egy letisztult és naprakész weboldalon keresztül.
* * *
## Hogyan állítsam ezt be?
Egyszerű! Csak kövesd az alábbi utasításokat, és pillanatok alatt működni fog a rendszer!

### Requirements

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

### Indítás

* A szerver indítása: `npm start` (újra kell indítani ha változtatni akarsz valamit)
 vagy `node server.js` (automatikusan újraindítja)
* Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

## Dokumentáció

* A specifikáció, valamint a frontend és a backend dokumentációja a [docs mappában](docs) található.

## Tesztelés

* A manuális teszteket a [tests mappában](tests) találhatja.



