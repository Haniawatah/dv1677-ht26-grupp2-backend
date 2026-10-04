# Grupp 2 - Backend

## Gruppmedlemmar
* Hani Awatah (Github: Haniawatah)
* Tommy Johannesson (Github: tommy973)


## Projektval
Valet föll på **ssr-editor** som projekt.
Båda projekten verkade intressanta och innebär ju en möjlighet att få lära sig ett ramverk och dokumentbaserade databaser.
Efter att ha läst igenom baselinen och kraven för projektet så föll valet ganska enkelt för båda på editorn. Vi kände båda två att vi skulle vilja lära oss hur en webbaserad texteditor byggs upp och hur den fungerar, dels i bakgrunden men också på framsidan där användaren är.


## Teknikval
Ramverket vi valt för vårt projekt är **React**.
Dels har Hani vana av det ramverket då han använt det tidigare, och är då bekväm med strukturen inom React. Detta är ju också en trygghet i gruppen då Tommy inte arbetat med ramverk tidigare. För Tommys del så är uppfattningen att React är enklare att sätta sig in i än Vue för någon som är ny på området och det finns väldigt mycket resurser då det är ett av de största ramverken.


## Tillvägagångssätt

**Installation och uppstart (Vecka 1-2)**
Vi klonade ner startrepot och satte upp den lokala utvecklingsmiljön. Följande steg genomfördes för att få applikationen att fungera:

1. Vi säkerställde att Node.js version 22.23 (eller högre) användes enligt projektets krav.
2. Alla projektets beroenden installerades med kommandot `npm install`.
3. Vi skapade en lokal miljöfil genom att kopiera `.env.example` till `.env`.
4. Vi genomförde en säkerhetsgranskning och körde `npm audit fix` för att åtgärda eventuella sårbarheter.
5. Servern startades framgångsrikt lokalt via `npm start`.


## Skapa och uppdatera dokument (delad routing)

Lösning för Routing: Skapa vs Uppdatera

Under utvecklingen insåg vi att vi inte kunde lägga uppdateringslogiken direkt på rot-routen (POST /), eftersom vi då tappade funktionaliteten för att skapa helt nya dokument. Kraven för upgiften var tydliga med att båda delarna måste fungera. Vår lösning blev därför att separera ansvaret i två olika routes.

Vad vi har ändrat;

app.mjs, Vi lät den ursprungliga rot-routen  (POST /) vara kvar orörd för att hantera nyskapade dokument. Därefter lade vi till en ny route (POST  /:id) som enbart fångar upp och hanterar uppdateringar av befintliga dokument.

docs.mjs, För att kommunicera med databasen skapade vi funktionen updateOne. Den tar emot dokumentets ID och innehåll, och kör en standard UPDATE-fråga mot SQLite-databasen för att skriva över den gamla datan.

views/doc.ejs, För att formuläret ska skicka datan till rätt ställe, uppdaterade vi dess action-attribut. Istället för att posta till roten, skickar det nu dynamiskt datan till dokumentets URL baserat på dess ID.


## Backend-refaktorering (Vecka 3-5)

### Krav 1: Migrering: SQLite till MongoDB
Då textdokumentens innehåll och information framöver ska lagras i en dokumentbaserad databas med en JSON-liknande struktur behöver både lagringen i databasen och kommunikationen mot databasen ändras. Vi kör med samma grund i *database.mjs* som SQLite-databasen men bytt ut all kod så att det skapas en collection för alla textdokument och som sedan fylls på med lite exempeldata. När databasen väl var på plats så byttes kommunikationen mellan routesen och databasen ut så att användaren kunde läsa från och skriva till databasen via vyerna. Även de övriga sql- och bash-filerna är numera borta.

**Datamodell**

I nuläget så består vår databas enbart av en collection, **documents**, som utöver *objectID* innehåller två fält. Det är *title* som lagrar titeln på användarens dokument och *content* som är själva innehållet som användaren skrivit in.

Vi har valt att använda oss av en docker-container för att lagra databasen.

Startas genom
```bash
docker compose -f docker-compose.yml up -d mongodb
```

### Krav 2: JSON-API
Vi skapade en ny fil *routes/api_routes.mjs* som får hantera alla routes som hör till API:et. Här i byggdes ett fullständigt REST-API under /api/documents med GET, POST, PUT och DELETE. Alla anrop läser och skriver JSON och svarar med tydliga statuskoder (400 vid felaktigt id, 404 om dokumentet inte finns, 500 om det finns ett fel på servern och 200 om allt funkar ok).

### Krav 3: Påbörja frontend i Javascript-ramverk
Påbörjat och grunden lagd för en frontend byggd med React och Vite.

Länk till repo:

https://github.com/Haniawatah/dv1677-ht26-grupp2-frontend

### Krav 4: Driftsättning backend
De fyra filerna (*Dockerfile, docker-compose, ci och deploy*) finns på plats. Tillsammans med GitHub secrets och SSH-nyckelparet för kontakten mellan VPS:en och GitHub kan två images skapas och två Docker-containers startas som kör vår Express-backend och databas.

### Krav 5: Tester
Vi delade upp *app.mjs* och lade delar av koden i *server.mjs* så att Express-appen kan testas utan att starta en riktig server. Vi lade sedan till vitest, supertest och mongodb-memory-server och skrev tester i *tests*-mappen som täcker samtliga HTTP-metoder mot API:et. Både *ci.yml* och *deploy.yml* har uppdaterats för att testerna ska köras vid varje push.

Testerna som körs är:

**GET** : Testar att hämta alla document som finns i collectionen och att det returneras en OK statuskod. Sedan testas att hämta ett enskilt dokument med olika utfall. Vad händer om dokumentet finns respektive om dokumentet eller objectID:et inte existerar.

**POST** : Tester körs för att lägga till nya documents och kontrollerar så att det returnerar korrekta statuskoder för om ett dokument läggs till eller om något fel uppstår, exempelvis att det saknas någon attribut som behöver finnas för att dokumentet ska kunna skapas.

**PUT-DELETE** : Testar att uppdatera ett existerande dokument och utfallen att uppdateringen görs eller att uppdateringen försöker göras mot ett dokument som inte existerar. Samma utfall kontrolleras för att radera ett dokument i databasen.

Testerna kan köras med
```bash
npm test
```

### Krav 6: Dokumentation

**Länk till driftsatt backend** : https://dv1677-data.nplab.bth.se/api/documents
**Länk till driftsatt frontend** : https://Haniawatah.github.io/dv1677-ht26-grupp2-frontend/

För att köra backend lokalt:

**Backend:**

Klona repot
```bash
git clone https://github.com/Haniawatah/dv1677-ht26-grupp2-backend.git
```
Installera nödvändiga paket
```bash
npm install
```
Driftsätt backend
```bash
docker compose up -d
```

**Miljövariabler:**

| Miljövariabel | Förklaring | Exempel |
|---------------|------------|---------|
| MONGODB_URI | Adress till databasen | mongodb://root:secret@localhost:27017 |
| DB_NAME | Namnet på databasen | jsramverk |
| PORT | Port som backend körs på | 3000 |
