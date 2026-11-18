# uy-ol

Marketplace for buying and renting property in Uzbekistan. The frontend uses React, TypeScript, and Vite. The API is Java 25 (LTS) with Spring Boot and PostgreSQL.

## Start locally

Requirements: Node.js 22, Java 25+, and Docker Desktop (or a PostgreSQL 16+ instance). If Maven is not installed, the development scripts download Maven 3.9.9 into the ignored `node_modules/.cache` folder; Maven then downloads the Java dependencies.

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts the Docker PostgreSQL container automatically when `DATABASE_URL` is unset or points to port 5433. When `DATABASE_URL` points to another database, the API uses that database and skips the container. Open <http://127.0.0.1:5100>. Vite serves the website and proxies `/api` and `/uploads` to the Java service on port 4178. Docker PostgreSQL is exposed locally on port 5433; its data is kept in the `uyol-postgres-data` volume. Uploaded listing media is stored under `server-data/uploads`.

If PostgreSQL is hosted elsewhere, set `DATABASE_URL` in `.env` to its `postgres://` or `postgresql://` connection string. The Java API creates the required tables when it starts. Set `COOKIE_SECURE=true` when serving the API through HTTPS. `PORT` changes the API port, and `DATA_DIR` changes the local media directory.

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
        ├── /api/geocode       OpenStreetMap Nominatim address lookup
        └── /uploads           listing photos and videos
                 └── Spring Boot API (Java, port 4178)
                       └── PostgreSQL
```

Java 25 source is in `backend/src/main/java/com/uyol/backend`. The database schema is in `backend/src/main/resources/schema.sql`. PostgreSQL keeps listing JSON, accounts, hashed sessions, and user data. Password hashing remains compatible with existing scrypt hashes. The frontend keeps its existing pages and communicates through the same `/api/*` paths.

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

The catalog starts empty. Accounts use an Uzbekistan phone number and password; SMS verification and password recovery are not connected. Publishing requires an account. Listing photos are limited to 15 MB, videos to 10 MB, and up to 10 media files can be attached. Geocoding sends the entered address to OpenStreetMap Nominatim. AI search, valuation, and messaging remain frontend demonstrations.
