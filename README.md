# uy-ol

Marketplace for buying and renting property in Uzbekistan. The frontend uses React, TypeScript, and Vite. The API is Java 21 (LTS) with Spring Boot and PostgreSQL.

## Start locally

Requirements: Node.js 22, Java 21+, and Docker Desktop (or a PostgreSQL 16+ instance). If Maven is not installed, the development scripts download Maven 3.9.9 into the ignored `node_modules/.cache` folder; Maven then downloads the Java dependencies.

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts the Docker PostgreSQL container automatically when `DATABASE_URL` is unset or points to port 5433. When `DATABASE_URL` points to another database, the API uses that database and skips the container. Open <http://127.0.0.1:5100>. Vite serves the website and proxies `/api` and `/uploads` to the Java service on port 4178. Docker PostgreSQL is exposed locally on port 5433; its data is kept in the `uyol-postgres-data` volume. Uploaded listing media is stored under `server-data/uploads`.

If PostgreSQL is hosted elsewhere, set `DATABASE_URL` in `.env` to its `postgres://` or `postgresql://` connection string. The Java API creates the required tables when it starts. Set `COOKIE_SECURE=true` when serving the API through HTTPS. `PORT` changes the API port, and `DATA_DIR` changes the local media directory.

The development server prints short Russian status messages. Set `LOG_STACKTRACE=true` in `.env` when you need detailed Java error logs for debugging.

## Build and run

```bash
npm run build
npm start
```

`npm run build` builds the frontend and packages the Spring Boot API at `backend/target/uyol-api-1.0.0.jar`. `npm start` runs the API; serve the generated `dist/` folder from a web server that proxies `/api` and `/uploads` to the Java service.

## Architecture

```text
Browser
  └── Vite frontend (React + TypeScript, port 5100)
        ├── /api/auth          registration, login, session
        ├── /api/user-data     account profile and saved preferences
        ├── /api/listings      listing catalog and multipart media upload
        ├── /api/support       separate support conversations and message polling
        ├── /api/geocode       OpenStreetMap Nominatim address lookup
        └── /uploads           listing photos and videos
                 └── Spring Boot API (Java, port 4178)
                       └── PostgreSQL
```

Java 21 source is in `backend/src/main/java/com/uyol/backend`. The database schema is in `backend/src/main/resources/schema.sql`. PostgreSQL keeps listing JSON, accounts, hashed sessions, and user data. Password hashing remains compatible with existing scrypt hashes. The frontend keeps its existing pages and communicates through the same `/api/*` paths.

## Project structure

```text
backend/       Spring Boot API and PostgreSQL schema
db/migrations/ Previous PostgreSQL schema steps kept for reference
scripts/       Vite + Java development and build launchers
src/           React application entry points
scripts/*.ts   Page logic and UI behavior
pages/         Catalog, listing, account, and property pages
styles/        Shared styles and page layouts
assets/        Brand marks and property imagery
docker-compose.yml  Local PostgreSQL service
```

The catalog starts empty. Accounts use an Uzbekistan phone number and password; SMS verification and password recovery are not connected. Publishing requires an account. Listing photos are limited to 15 MB, videos to 10 MB, and up to 10 media files can be attached. Geocoding sends the entered address to OpenStreetMap Nominatim. AI search and valuation remain frontend demonstrations.

## Technical support setup

The floating support chat is isolated from catalog and account flows. Support conversations are stored in separate PostgreSQL tables. The assistant calls an OpenAI-compatible Chat Completions endpoint from the Java server; without an API key, a small local FAQ answers common questions and unresolved requests link to `@Bredlyban2`.

Copy the values into the project-root `.env` file (do not commit it):

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SUPPORT_TELEGRAM_BOT_TOKEN=
SUPPORT_TELEGRAM_OPERATOR_CHAT_ID=
```

To find the operator chat ID, send `/start` to the bot, then inspect `result[0].message.chat.id` from `https://api.telegram.org/bot<TOKEN>/getUpdates` in a private terminal. New handoff requests wait for an operator decision. The configured Telegram chat gets **Accept** and **Decline** buttons; a request only switches to a human chat after acceptance. Once accepted, reply with `/reply <ticket-id> <message>`. Restart `npm run dev` after changing `.env`. Never put API keys or bot tokens in frontend code or commit them.

### Telegram Mini App for the operator

The operator panel lives at `/pages/operator-support.html`. It provides pending, active, and all conversation lists, transcript viewing, accept/decline controls, and replies. Every operator API request verifies Telegram Web App `initData` against the bot token and the configured operator Telegram user ID.

Set `SUPPORT_TELEGRAM_OPERATOR_USER_ID` to the operator's numeric Telegram user ID (for a private 1:1 bot chat, the chat ID is usually the same), and set `SUPPORT_TELEGRAM_WEBAPP_URL` to the publicly hosted HTTPS URL of `pages/operator-support.html`. Restart the backend, then send `/panel` to the support bot and open the panel using the button it sends. Telegram Mini Apps require HTTPS; the local Vite URL is useful for previewing the layout but cannot be opened as a Telegram Mini App from the internet. The panel remains a separate static page and does not change the customer site navigation.
