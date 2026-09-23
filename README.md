# Awesome Pizza – Angular Frontend

Web frontend for **Awesome Pizza**, built with Angular 20. The application lets customers browse the menu, create and track an order, and provides staff with an authenticated area for searching and processing orders.

## Features

### Customer area

- browse the available pizzas;
- compose and submit an order;
- receive a confirmation with the public order code;
- search for an order using its `orderCode`;
- track the `RECEIVED`, `IN_PREPARATION`, and `COMPLETED` states.

### Administration area

- username/password authentication with JWT;
- paginated order search;
- filters by order code, day, and status, combined by the backend with `AND`;
- filter persistence through page query parameters;
- complete order details;
- start order preparation;
- complete an order;
- enforcement of the one-order-at-a-time preparation workflow.

The frontend check for a single order in preparation improves the user experience, but the backend must enforce the actual invariant, including when multiple sessions operate concurrently.

## Technology stack

- Angular 20;
- TypeScript with strict configuration;
- Standalone Components;
- Angular Router and lazy loading;
- Angular Reactive Forms;
- Angular Signals;
- NgRx SignalStore;
- RxJS;
- Tailwind CSS 3;
- DaisyUI 4;
- Material Icons;
- ESLint with Angular configuration;
- Jasmine and Karma;
- multi-stage Docker build;
- Nginx for serving the production bundle and proxying API requests.

## Prerequisites

For local development:

- Node.js 22 recommended;
- npm;
- the Awesome Pizza backend available at `http://localhost:8080`.

For running the container:

- Docker Desktop or Docker Engine;
- Docker Compose;
- the Awesome Pizza backend available on the host machine on port `8080`.

## Local development with hot reload

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open:

```text
http://localhost:4200
```

In this mode Angular uses **hot reload**: changes to TypeScript and HTML files are automatically compiled and displayed in the browser.

The `proxy.conf.json` file forwards every `/api` request to the backend:

```text
Browser -> http://localhost:4200/api/**
        -> http://localhost:8080/api/**
```

## Running with Docker

The Docker configuration is designed to make the frontend easy to distribute and try. The container creates the production Angular bundle and serves it with Nginx.

First, make sure the backend is available at:

```text
http://localhost:8080
```

From the project root, run:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:4200
```

To start the container in the background:

```bash
docker compose up --build -d
```

To follow the logs:

```bash
docker compose logs -f frontend
```

To stop and remove the container:

```bash
docker compose down
```

After the initial build, when the source code has not changed, the existing image can be reused:

```bash
docker compose up -d
```

### Hot reload and Docker

The container uses a production bundle served by Nginx and **does not provide hot reload**. Rebuild the image after changing the source code:

```bash
docker compose up --build -d
```

Use `npm start` when developing with automatic browser updates.

Nginx forwards `/api/**` to `host.docker.internal:8080`. The `extra_hosts` configuration in `compose.yaml` makes this hostname available in Docker environments that require an explicit mapping.

## Administration credentials

The frontend does not contain default credentials. The administrative user is configured by the backend, typically through:

```text
ADMIN_USERNAME
ADMIN_PASSWORD
```

The login page is available at:

```text
http://localhost:4200/admin/login
```

## Application routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Menu and order creation |
| `/confirmation/:orderCode` | Public | Order confirmation |
| `/track` | Public | Order search |
| `/track/:orderCode` | Public | Direct tracking by order code |
| `/admin/login` | Public | Staff login |
| `/admin/orders` | Protected | Paginated order search and list |
| `/admin/orders/:orderCode` | Protected | Order details and processing actions |

## Architecture

The codebase is organized primarily by feature and domain. Cross-cutting application concerns live in `core`, while models and primitives genuinely shared by multiple features live in `shared`.

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

### Data flow

HTTP representations are kept separate from the models used by the UI:

```text
Backend DTO -> Mapper -> Frontend Model -> SignalStore -> Component
```

- `dto` files represent the backend JSON contract;
- `mapper` files convert DTOs and temporal values into frontend models;
- `service` files contain only HTTP communication;
- SignalStores manage application state, loading states, and errors;
- local form state remains in the relevant components through Reactive Forms.

## State management

### CustomerStore

Manages the pizza menu, selected quantities, cart, order creation, current order, order tracking, loading states, and errors for the Customer feature.

### AdminStore

Manages the order page, pagination, applied filters, selected details, the order currently known to be in preparation, loading states, and errors for the Admin feature.

The store is recreated after a browser refresh. Order states are reloaded from the backend, while Admin filters are restored from query parameters, for example:

```text
/admin/orders?day=2026-09-23&status=RECEIVED
```

## Authentication

The Admin authentication flow is:

```text
Login -> POST /api/v1/auth/login -> JWT -> AuthStore -> sessionStorage
```

- the token, token type, and expiration are stored in `sessionStorage`;
- `authGuard` protects `/admin/**` routes;
- `authInterceptor` adds `Authorization: Bearer <token>` to Admin API requests;
- a `401 Unauthorized` response clears the local session and redirects to the login page.

The guard protects UI navigation, but real security must always be enforced by the backend.

## Themes

The application provides two centralized DaisyUI themes in `tailwind.config.js`:

- `pizzalight`;
- `pizzadark`.

The preference is managed by `ThemeService`. Components use DaisyUI tokens and Tailwind utilities without depending on theme implementation details.

## API endpoints

### Public endpoints

```text
GET  /api/v1/pizzas
POST /api/v1/orders
GET  /api/v1/orders/{orderCode}
POST /api/v1/auth/login
```

### Protected endpoints

```text
GET   /api/v1/admin/orders
GET   /api/v1/admin/orders/{orderCode}
PATCH /api/v1/admin/orders/{orderCode}/start
PATCH /api/v1/admin/orders/{orderCode}/complete
```

### Admin order search

The order list uses zero-based Spring pagination:

```text
page=0
size=20
sort=createdAt,desc
orderCode=<uuid>       optional
day=2026-09-23         optional
status=RECEIVED        optional
```

Only populated filters are sent. The backend combines filters with `AND` and returns a `PageResponse` containing `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, and `last`.

The supported transitions are:

```text
RECEIVED -> IN_PREPARATION -> COMPLETED
```

When another order is already in preparation, the backend returns `409 Conflict`.

## Available commands

| Command | Description |
| --- | --- |
| `npm start` | Starts Angular in development mode with hot reload and API proxy |
| `npm run build` | Creates the production bundle |
| `npm run watch` | Rebuilds the development bundle when files change |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs the test suite once and exits |

## Pre-delivery checks

```bash
npm run lint
npm run build
npm test
```

## Troubleshooting

### The frontend opens, but API calls fail

Verify that the backend responds at `http://localhost:8080`. In local development, check `proxy.conf.json`; with Docker, check `docker/nginx/default.conf`.

### Source changes do not appear in the browser

With `npm start`, perform a hard refresh if the development server retains an old compilation error. With Docker, rebuild the image:

```bash
docker compose up --build -d
```

### Admin login returns 401

Verify the credentials configured by the backend and ensure the user has the `PIZZA_MAKER` role.
