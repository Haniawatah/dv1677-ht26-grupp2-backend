# Grupp 2 - Backend

## Gruppmedlemmar
* Hani Awatah (GitHub: Haniawatah)
*  Tommy JOHANNESSON (GitHub: [Tommys-nick])


## Projektval
Vi har valt att utgå från startrepot **ssr-editor-ht26**. 
[Här fyller vi på varför, kanske imorgon?]


## Teknikval
[Här fyller vi på om React imorgon]



## Tillvägagångssätt
**Installation och uppstart (Vecka 1-2)**

När vi först klonade ner startrepot och försökte köra `npm start` stötte vi på ett problem där applikationen kraschade med felmeddelandet "Segmentation fault (core dumped)". Efter lite felsökning insåg vi att detta berodde på paketet 

`better-sqlite3`, som använder nativa binärer och kräver Node.js version 22.23 eller högre. Den lokala versionen var för gammal (v20).

För att lösa detta och få igång koden gjorde vi följande steg:
1. Vi uppdaterade Node.js med hjälp av NVM genom att köra `nvm install 22.23` och därefter `nvm use 22.23`.


2. För att säkerställa att inga felkompilerade filer låg kvar raderade vi den gamla installationen: `rm -rf node_modules package-lock.json`.


3. Vi installerade om alla beroenden mot den nya Node-versionen: `npm install`.


4. Vi körde `npm audit fix för att täppa till eventuella säkerhetsbrister i paketen.


5. Kopierade miljövariablerna via `cp .env.example .env`.


6. Slutligen startades servern framgångsrikt med `npm start`. 


## PUT-route
we have not started the part yet...