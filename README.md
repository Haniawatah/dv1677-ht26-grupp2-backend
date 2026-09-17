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


## Instruktioner för att köra appen lokalt

Installera nödvändiga paket
```bash
npm install
```

Starta appllikationen på port 3000:
```bash
npm start
```