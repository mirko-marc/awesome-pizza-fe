# Awesome Pizza – Frontend Angular

Frontend web di **Awesome Pizza**, realizzato con Angular 20. L’applicazione permette al cliente di consultare il menu, creare e monitorare un ordine e mette a disposizione del personale un’area autenticata per cercare e lavorare gli ordini.

## Funzionalità

### Area cliente

- visualizzazione delle pizze disponibili;
- composizione e invio dell’ordine;
- conferma con codice pubblico dell’ordine;
- ricerca tramite `orderCode`;
- monitoraggio degli stati `RECEIVED`, `IN_PREPARATION` e `COMPLETED`.

### Area amministrativa

- autenticazione tramite username, password e JWT;
- ricerca paginata degli ordini;
- filtri per codice, giorno e stato, combinati dal backend con `AND`;
- persistenza dei filtri nei query parameter della pagina;
- visualizzazione del dettaglio dell’ordine;
- passaggio dell’ordine in lavorazione;
- completamento dell’ordine;
- gestione del vincolo di un solo ordine in lavorazione alla volta.

Il controllo frontend sul singolo ordine in lavorazione migliora l’esperienza utente, ma la garanzia effettiva deve essere applicata dal backend, anche in presenza di più sessioni concorrenti.

## Tecnologie utilizzate

- Angular 20;
- TypeScript con configurazione strict;
- Standalone Components;
- Angular Router e lazy loading;
- Angular Reactive Forms;
- Angular Signals;
- NgRx SignalStore;
- RxJS;
- Tailwind CSS 3;
- DaisyUI 4;
- Material Icons;
- ESLint con configurazione Angular;
- Jasmine e Karma;
- Docker multi-stage;
- Nginx per servire la build di produzione e inoltrare le API.

## Prerequisiti

Per lo sviluppo locale:

- Node.js 22 consigliato;
- npm;
- backend Awesome Pizza disponibile su `http://localhost:8080`.

Per l’avvio tramite container:

- Docker Desktop oppure Docker Engine;
- Docker Compose;
- backend Awesome Pizza disponibile sulla macchina host alla porta `8080`.

## Avvio locale con hot reload

Installare le dipendenze:

```bash
npm install
```

Avviare il development server:

```bash
npm start
```

Aprire:

```text
http://localhost:4200
```

In questa modalità Angular usa il **hot reload**: le modifiche ai file TypeScript e HTML vengono ricompiliate e mostrate automaticamente nel browser.

Il file `proxy.conf.json` inoltra tutte le richieste `/api` al backend:

```text
Browser -> http://localhost:4200/api/**
        -> http://localhost:8080/api/**
```

## Avvio con Docker

La configurazione Docker è pensata per distribuire e provare facilmente il frontend. Il container genera la build Angular di produzione e la serve con Nginx.

Assicurarsi prima che il backend sia raggiungibile su:

```text
http://localhost:8080
```

Dalla cartella principale del progetto eseguire:

```bash
docker compose up --build
```

Aprire quindi:

```text
http://localhost:4200
```

Per avviare il container in background:

```bash
docker compose up --build -d
```

Per visualizzare i log:

```bash
docker compose logs -f frontend
```

Per arrestare e rimuovere il container:

```bash
docker compose down
```

Dopo la prima build, se il codice non è cambiato, è possibile riutilizzare l’immagine esistente:

```bash
docker compose up -d
```

### Hot reload e Docker

Il container usa una build di produzione servita da Nginx e **non include hot reload**. Dopo una modifica al codice è necessario ricostruire l’immagine:

```bash
docker compose up --build -d
```

Per sviluppare con aggiornamento automatico utilizzare `npm start`.

Nginx inoltra `/api/**` verso `host.docker.internal:8080`; la configurazione `extra_hosts` in `compose.yaml` rende disponibile questo nome anche negli ambienti Docker che richiedono il mapping esplicito.

## Credenziali amministrative

Il frontend non contiene credenziali predefinite. L’utente amministrativo è configurato dal backend, normalmente tramite:

```text
ADMIN_USERNAME
ADMIN_PASSWORD
```

La pagina di accesso è disponibile su:

```text
http://localhost:4200/admin/login
```

## Rotte applicative

| Rotta | Accesso | Descrizione |
| --- | --- | --- |
| `/` | Pubblico | Menu e creazione ordine |
| `/confirmation/:orderCode` | Pubblico | Conferma dell’ordine |
| `/track` | Pubblico | Ricerca ordine |
| `/track/:orderCode` | Pubblico | Tracking diretto tramite codice |
| `/admin/login` | Pubblico | Login del personale |
| `/admin/orders` | Protetto | Ricerca e lista paginata degli ordini |
| `/admin/orders/:orderCode` | Protetto | Dettaglio e lavorazione ordine |

## Architettura

Il codice è organizzato principalmente per feature/domain. Le dipendenze trasversali vivono in `core`, mentre modelli e primitive realmente condivisi sono in `shared`.

```text
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.store.ts
│   │   ├── auth.interceptor.ts
│   │   ├── auth.guard.ts
│   │   └── auth-session.storage.ts
│   └── theme/
│       └── theme.service.ts
├── features/
│   ├── customer/
│   │   ├── components/
│   │   ├── data-access/
│   │   │   ├── dto/
│   │   │   ├── mapper/
│   │   │   └── service/
│   │   ├── models/
│   │   ├── pages/
│   │   └── store/
│   └── admin/
│       ├── data-access/
│       │   ├── dto/
│       │   ├── mapper/
│       │   └── service/
│       ├── models/
│       ├── pages/
│       └── store/
└── shared/
    ├── dto/
    ├── mapper/
    ├── model/
    └── ui/
```

### Flusso dei dati

Le rappresentazioni HTTP sono separate dai modelli utilizzati dall’interfaccia:

```text
Backend DTO -> Mapper -> Frontend Model -> SignalStore -> Component
```

- i `dto` rappresentano il contratto JSON del backend;
- i `mapper` convertono DTO e valori temporali nei modelli frontend;
- i `service` contengono esclusivamente le chiamate HTTP;
- i SignalStore gestiscono stato applicativo, caricamenti ed errori;
- lo stato locale dei form rimane nei componenti tramite Reactive Forms.

## Gestione dello stato

### CustomerStore

Gestisce menu, quantità selezionate, carrello, creazione dell’ordine, ordine corrente, tracking, caricamenti ed errori della feature Customer.

### AdminStore

Gestisce pagina degli ordini, paginazione, filtri applicati, dettaglio selezionato, ordine conosciuto come attualmente in lavorazione, caricamenti ed errori della feature Admin.

Dopo un refresh lo store viene ricreato. Gli stati degli ordini vengono ricaricati dal backend, mentre i filtri Admin vengono recuperati dai query parameter, per esempio:

```text
/admin/orders?day=2026-09-23&status=RECEIVED
```

## Autenticazione

Il flusso Admin è il seguente:

```text
Login -> POST /api/v1/auth/login -> JWT -> AuthStore -> sessionStorage
```

- il token, il tipo e la scadenza vengono conservati in `sessionStorage`;
- `authGuard` protegge le rotte `/admin/**`;
- `authInterceptor` aggiunge `Authorization: Bearer <token>` alle API Admin;
- una risposta `401 Unauthorized` elimina la sessione locale e riporta alla pagina di login.

Il guard protegge la navigazione dell’interfaccia, ma la sicurezza reale deve essere sempre applicata dal backend.

## Temi

L’applicazione include due temi DaisyUI centralizzati in `tailwind.config.js`:

- `pizzalight`;
- `pizzadark`.

La preferenza viene gestita dal `ThemeService`; i componenti utilizzano token DaisyUI e utility Tailwind senza dipendere dalla logica del tema.

## API utilizzate

### Pubbliche

```text
GET  /api/v1/pizzas
POST /api/v1/orders
GET  /api/v1/orders/{orderCode}
POST /api/v1/auth/login
```

### Protette

```text
GET   /api/v1/admin/orders
GET   /api/v1/admin/orders/{orderCode}
PATCH /api/v1/admin/orders/{orderCode}/start
PATCH /api/v1/admin/orders/{orderCode}/complete
```

### Ricerca Admin

La lista usa paginazione Spring zero-based:

```text
page=0
size=20
sort=createdAt,desc
orderCode=<uuid>       opzionale
day=2026-09-23         opzionale
status=RECEIVED        opzionale
```

Vengono inviati solo i filtri valorizzati. Il backend combina i filtri con `AND` e restituisce un `PageResponse` contenente `content`, `page`, `size`, `totalElements`, `totalPages`, `first` e `last`.

Le transizioni previste sono:

```text
RECEIVED -> IN_PREPARATION -> COMPLETED
```

Se un altro ordine è già in lavorazione, il backend restituisce `409 Conflict`.

## Comandi disponibili

| Comando | Descrizione |
| --- | --- |
| `npm start` | Avvia Angular in sviluppo con hot reload e proxy API |
| `npm run build` | Genera la build di produzione |
| `npm run watch` | Ricompila la build di sviluppo quando cambiano i file |
| `npm run lint` | Esegue ESLint |
| `npm test` | Esegue i test una volta e termina |

## Verifiche prima della consegna

```bash
npm run lint
npm run build
npm test
```

## Risoluzione dei problemi

### Il frontend si apre ma le API non funzionano

Verificare che il backend risponda su `http://localhost:8080`. In sviluppo controllare `proxy.conf.json`; con Docker controllare `docker/nginx/default.conf`.

### Le modifiche non appaiono nel browser

Con `npm start` eseguire un refresh completo se il server mantiene un vecchio errore di compilazione. Con Docker ricostruire l’immagine:

```bash
docker compose up --build -d
```

### L’accesso Admin restituisce 401

Verificare le credenziali configurate dal backend e che l’utente possieda il ruolo `PIZZA_MAKER`.
