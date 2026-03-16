# Hibabejelentő Alkalmazás – Kérdéssor az Előadáshoz

## 🎯 Bevezető Kérdések (1-2 perc)

### 1. **Ismerik-e a problémát?**
> "Ki tudna felelni arra, hogy naponta hány hiba-bejelentés érkezik az iskolai IT-hez papír vagy szóban?"

**Célzat:** Bevezetés, közönség felkészítése az előadásra.

---

### 2. **Van-e jobb megoldás?**
> "Szerintetek mit lehetne csinálni, hogy az IT könnyebben nyomon követhesse a bejelentéseket?"

**Várható válaszok:**
- Digitalizálás
- Egy közös rendszer
- Email (❌ nem ideális)

**Zárszó:** "Pontosan ezért fejlesztettük ezt az alkalmazást!"

---

## 📋 Az Alkalmazás Céljáról (2-3 perc)

### 3. **Mi a fő probléma?**
> "Mit gondoltok, hogy mi a felhasználó szenzációja, ha papírra kell felírnia a hibákat?"
> - ❌ Papírcsik elvész
> - ❌ Nincs nyomon követés
> - ❌ Nem látjuk, hogy készül a javítás

**Helyes válasz:** "Mindegyik! Ezért van szüksége az embereknek egy integrált rendszerre."

---

### 4. **Ki használja ezt az alkalmazást?**
> "Milyen szerepkörök lehetnek egy iskolai hibakezelésben?"

**Lehetséges válaszok:**
- Tanárok (akik bejelentik)
- IT-sok (akik javítják)
- Admin (aki irányít)

**Megerősítés:** "Teljesen jó! Összesen 3 fő szerepkörünk van."

---

## 👥 Szereplőkről (2 perc)

### 5. **Mit tehet a tanár?**
> "Ha egy tanár észlel egy WiFi-s problémát, mit tehet az alkalmazásban?"

**Helyes válasz:**
- ✅ Bejelenthet egy hibát
- ❌ Nem javíthatja meg
- ❌ Nem vehet fel felhasználókat

---

### 6. **Mi a különbség a karbantartó és az admin között?**
> "Mi a fő eltérés az adminisztrátor és a karbantartó között?"

**Helyes válasz:**
- Karbantartó: csak **javít** (nem kezel felhasználókat)
- Admin: **kezel felhasználókat, javít és bejelent**

---

### 7. **Ki lehet admin?**
> "Szerintetek hány adminisztrátor legyen egy iskolában? 1? 5? 20?"

**Tanítás:** "Általában 1-2 fő az ideális, hogy ellenőrzhetőbb legyen a rendszer."

---

## 🖥️ Technikai Részről (2 perc)

### 8. **Miért Node.js?**
> "Hallottak már valaki Node.js-ről? Mit tudnak róla?"

**Válasz:** 
- JavaScript futtatókörnyezet szerveroldali kódhoz
- Gyors, könnyű, népszerű

---

### 9. **Miért SQLite?**
> "Melyik adatbázist ismeritek? (MySQL, PostgreSQL, Oracle, SQLite?)"

**Válasz:**
- SQLite: **könnyű, fájlalapú**, nem kell szerver
- Kis-közepesméretű alkalmazásoknak tökéletes

---

### 10. **Miért Bootstrap?**
> "Mi segít abban, hogy az alkalmazás szép és mobilbarárt legyen?"

**Helyes válasz:** Bootstrap CSS keretrendszer (reszponzív design)

---

## 🔐 Biztonságról (2-3 perc)

### 11. **Hogyan védjük a jelszavakat?**
> "Ha én vagyok a szerver adminisztrátor, látom-e a felhasználók jelszavait?"

**Helyes válasz:** ❌ **NEM!** 
- Jelszavak bcrypt-tel titkosítódnak (hash)
- Csak a hash tárolódik

---

### 12. **Mi a JWT Token?**
> "Miért nem egyszerűen elküldjük a felhasználónevet és jelszót minden API kérésnél?"

**Válasz:**
- ❌ Nem biztonságos (újra és újra nyílt szövegben)
- ✅ JWT: Egyszeri bejelentkezés után token jön létre
- ✅ Ez a token bizonyít helyettünk

---

### 13. **Lehet-e ezt interneten közzétenni?**
> "Szerintetek mit kellene csinálni, ha ezt az interneten szeretnénk üzemeltetni?"

**Helyes válaszok:**
- HTTPS szükséges (titkosított kapcsolat)
- Megfelelő szerver (AWS, Azure, Heroku)
- Rendszeres biztonsági audit

---

## 📱 UI/UX Kérdések (1-2 perc)

### 14. **Mobilos használhatóság**
> "Milyen eszközökön használhatnád az alkalmazást?"

**Helyes válaszok:** Telefon, tablet, laptop, asztali gép

---

### 15. **Mi a szűrés célja?**
> "Miért jó, hogy szűrhetünk \"csak bejelentve\" vagy \"csak kijavítva\" hibákat?"

**Válasz:** 
- Tanár: csak az ő bejelentéseit szeretné látni
- IT: csak az elvégzendő munkákat szeretné látni
- Admin: mindent szeretne látni

---

## 💡 Demó-specifikus Kérdések (5-7 perc alatt)

### 16. **Bejelentkezés előtt**
> "Mit gondoltok, mi történik akkor, ha jó a felhasználónév és jelszó?"

**Válaszok:**
- ✅ JWT token generálódik
- ✅ Frontend elmenti a sessionStorage-ben
- ✅ Frontend átirányít a főoldalra

---

### 17. **Új hiba bejelentése közben**
> "Mit kell megadni egy új hibához?"

**Helyes válaszok:**
- Terem (beírás)
- Leírás (beírás)
- ✅ Dátum, bejelentő automatikus!

---

### 18. **Hiba kijavítása közben**
> "Mi történik akkor, amikor a karbantartó a \"Javítás\" gombra kattint?"

**Helyes válaszok:**
- ✅ Backend rögzíti az adatokat
- ✅ Javító felhasználó mentésre kerül
- ✅ Javítás dátuma automatikus
- ✅ Állapot: "kijavítva"

---

### 19. **Felhasználókezelés**
> "Ki férhet hozzá a \"Felhasználók\" oldalhoz?"

**Helyes válasz:** Csak **adminisztrátorok**

---

### 20. **Biztonsági szabály**
> "Mit gondoltok, lehet-e az admin önmagát törlésre jelölni?"

**Helyes válasz:** ❌ **NEM!** (Biztonsági szabály: adminisztrátor nem törölheti magát)

---

## ✨ Továbbfejlesztésről (1 perc)

### 21. **Mit lehetne még fejleszteni?**
> "Ha ezt az alkalmazást folytatni szeretné valaki, milyen funkciókat adna még hozzá?"

**Lehetséges válaszok:**
- 📧 E-mail értesítések
- 📷 Képfeltöltés
- 🎯 Prioritás szintek
- 💬 Megjegyzések / chat
- 📊 Statisztikák
- ⏱️ Deadline-ok

**Válaszok:** "Teljesen jó ötletek! Ezek közül több is a továbbfejlesztési listán van."

---

## 🏆 Zárókérdések (1-2 perc)

### 22. **Mi volt a tanulság?**
> "Mit gondoltok, milyen készségeket tanultunk meg ezzel a projekttel?"

**Lehetséges válaszok:**
- Webalkalmazás fejlesztés
- Backend API tervezése
- Adatbázis kezelés
- Biztonsági gondolkodásmód
- Frontend-backend integráció
- Csapatmunka

---

### 23. **Hogyan lehetne ezt kiterjeszteni?**
> "Ha ezt egy nagyobb intézménynek kellene készíteni (100+ felhasználó), mit kellene megváltoztatni?"

**Helyes válaszok:**
- PostgreSQL helyett SQLite
- Terheléselosztás
- Cache rendszer (Redis)
- Microservices architektúra
- Monitoring és logging

---

### 24. **Kérdések, megjegyzések?**
> "Van valakinek kérdése vagy megjegyzése?"

**Tips:**
- Legyen türelmes
- Nem szégyen, ha nem tudod a választ – ezek bonyolult témák
- "Érdekes kérdés! Ezt a projekt dokumentációjában lehet részletezni"

---

## 📊 Interaktív Kérdések (ha van idő)

### 25. **Múltipla választás – API Authentikáció**
> "Melyik a legjobb módszer az API-k védelméhez?"
> - A) Felhasználónév és jelszó minden kérésnél
> - B) JWT Token
> - C) IP cím engedélyezés
> - D) Nincs védelem

**Helyes válasz:** **B) JWT Token**

---

### 26. **Múltipla választás – Adatbázis Kiválasztása**
> "Melyik a legjobb adatbázis egy kis iskolai alkalmazáshoz?"
> - A) Oracle Database (túl nagy)
> - B) MongoDB (NoSQL, nem ideális hier)
> - C) **SQLite** (könnyű, fájlalapú) ✅
> - D) MySQL (működne, de bonyolultabb)

**Helyes válasz:** **C) SQLite**

---

### 27. **Párbajtípus Kérdés – Gyors Döntések**
> "Te vagy a tanár. Bejelentesz egy hibát. 2 perc alatt látni szeretnéd a karbantartót, hogyan halad a munka. Mit tennél?"

**A válasz:** Az alkalmazás "Szűrés" funkciója

---

## 🎮 Gamification Kérdések

### 28. **Szerep-játék: Tanár vagyok**
> "Tanárként mit tudnék csinálni, amit az IT-s nem?"

**Helyes válasz:** Új hibákat bejelenteni (az IT csak javíthat, nem jelenthet be)

---

### 29. **Szerep-játék: Admin vagyok**
> "Adminként mit tudnék csinálni, amit a tanár és az IT-s nem?"

**Helyes válasz:** Felhasználókat kezelni (hozzáadás, törlés)

---

### 30. **"Igaz vagy Hamis?" - Biztonsági Kérdések**

**Kérdés 1:** "Az adminisztrátor kényszerítő módon megnézheti az összes felhasználó jelszavát."
> **Válasz:** ❌ **Hamis** (Jelszavak hashelésbe vannak)

**Kérdés 2:** "A kijavított hibákat később lehet módosítani."
> **Válasz:** ❌ **Hamis** (Csak a \"bejelentve\" statuszú hibákat lehet javítani)

**Kérdés 3:** "Az alkalmazás mobilon is működik teljesen."
> **Válasz:** ✅ **Igaz** (Bootstrap responsive design)

**Kérdés 4:** "Az adminisztrátor kitörölheti magát az alkalmazásból."
> **Válasz:** ❌ **Hamis** (Biztonsági szabály)

---

## 📝 Vita-Induló Kérdések (opciónal, ha van idő)

### 31. **Adatvédelem**
> "Mit gondol a GDPR-ről? Hogyan kell kezelni a felhasználói adatokat egy iskolai alkalmazásban?"

---

### 32. **Skálázhatóság**
> "Ez a rendszer működne-e 1000 iskolában egyidejűleg?"

**Válasz:** "Nem közvetlenül. Kellene: cloud infrastruktúra, load balancer, cache, stb."

---

### 33. **Felhasználói Élmény**
> "Mit gondolsz, a tanároknak könnyű-e használni ezt az alkalmazást? Mi lehetne jobb?"

---

## 🎯 Válaszok Gyors Referencia (Előadónak)

| Kérdés | Válasz | Díja |
|--------|--------|------|
| JWT Token mire jó? | Biztonságos bejelentkezés, nem kell jelszó minden kérésnél | 2 pont |
| SQLite miért? | Könnyű, fájlalapú, kis alkalmazásokhoz tökéletes | 2 pont |
| Admin jogok? | Felhasználókezelés, bejelentés, javítás | 2 pont |
| Jelszó biztonság? | bcrypt hash, soha nem nyílt szöveg | 3 pont |
| Mobilok? | Bootstrap responsive, teljes mértékben | 1 pont |
| Szerep-alapú jogok? | Backend ellenőrzés minden API kérésnél | 2 pont |

---

## 💬 Tippek az Előadónak

✅ **JÓK:**
- Várd meg a teljes kérdést, mielőtt válaszolsz
- Dicsérj meg minden helyes választ
- Ha rosszul válaszol valaki, gentilül korrigálj
- Számozd a kérdéseket (engagement nő)
- Legyen szünet a Q&A előtt (felkészülés)

❌ **KERÜLENDŐ:**
- Ne viccelsz a rossz válaszokkal
- Ne mondd meg egyből a választ (hagyd gondolkodni)
- Ne ugorj át kérdéseket (lehet később is jók)
- Ne beszélj túl technikai jellegűen (zavaróban vagyok)

---

## ⏱️ Időmenet Javasolt Kérdések

| Szakasz | Ideális Kérdések | Idő |
|---------|------------------|-----|
| Bevezető | 1-2 | 2 perc |
| Cél/Probléma | 3-4 | 2 perc |
| Szereplők | 5-7 | 3 perc |
| Technikai | 8-10 | 2 perc |
| Demo közben | 16-20 | 5 perc |
| Q&A | 21-33 (szabad választás) | 5-10 perc |

---

## 🚀 Bónusz Kérdések (Ha már haladtok)

### B1. **Microservices vs Monolith**
> "Ez az alkalmazás egy monolitikus alkalmazás. Mit jelent ez?"

---

### B2. **CI/CD Pipeline**
> "Hogyan lehet automatizálni az alkalmazás tesztelését és telepítését?"

---

### B3. **API Rate Limiting**
> "Mit lehetne csinálni, ha valaki túl sok kéréssel támad az API-ra?"

---

### B4. **Notification System**
> "Hogyan lehetne a karbantartókat értesíteni új hibákról?"

---

Remélem, hogy ez a kérdéssor segít az interaktív és érdekes előadásban! 🎉
