# Makon — недвижимость по-новому

Premium green real estate marketplace for Uzbekistan. The frontend is built with React, TypeScript, and CSS; a built-in Node.js API stores shared listings and uploaded media on disk.

## Start locally

Install dependencies and start the Vite frontend and local API:

```bash
npm install
npm run dev
```

Create and run a production build with `npm run build` and `npm start`. The server requires Node.js 20 or newer. Set `PORT` to change the listening port and `DATA_DIR` to place persistent listing data and uploads on a mounted disk.

## Brand

Name ideas considered: **Makon**, **Nesto**, **Uya**, **Livora**, and **Domio**. **Makon** is the selected working name: a short Uzbek word associated with a place or space, used here as an independent product brand.

The visual system uses Makon green (`#087C55`), dark green (`#075B40`), soft green surfaces, Inter with a sans-serif fallback, rounded cards, fine borders, and restrained motion. The brand icon is in `assets/icons/makon-mark.svg`; the site logo and favicon use `logo/logo.png`.

## Project structure

```text
index.html
pages/
  ai-search.html
  catalog.html
  compare.html
  create-listing.html
  favorites.html
  login.html
  profile.html
  property.html
  valuation.html
assets/
  icons/makon-mark.svg
  images/property-contact-sheet.jpg
data/properties.json
src/
  main.tsx
scripts/
  ai-search.ts
  auth.ts
  catalog.ts
  comparison.ts
  dev.mjs
  favorites.ts
  home.ts
  icons.ts
  listing.ts
  maps.ts
  mock-data.ts
  phone.ts
  profile.ts
  property.ts
  store.ts
  types.ts
  ui.ts
  valuation.ts
server/
  index.mjs
logo/logo.png
package.json
tsconfig.json
vite.config.ts
styles/
  components.css
  global.css
  main.css
  pages.css
  reset.css
  typography.css
  variables.css
```

## Implemented

- Responsive home page, shared header/footer, mobile menu, category and city discovery.
- The catalog starts empty; newly published listings are shared through the Node API.
- Catalog search, deal/category/city/district/price/area/room/condition/floor filters, verification filter, sorting, grid/list/map views, and empty states.
- Map markers use property-type icons; listings without coordinates are spread around the city center and explicitly labeled approximate, while listings with coordinates use their selected location.
- Property detail pages selected with `?id=mak-001`, photo gallery/lightbox, features, contact actions, and similar listings.
- Favorites and up-to-four-object comparison saved in local storage.
- Property valuation form with category-dependent fields, illustrative range, comparables, history, and an explicit demo-only disclosure.
- Rule-based natural-language property matching for type, city, deal, budget, room count, and district. Commute preferences are collected but are not calculated.
- Ten-step listing form with per-step validation, draft saving, photo/video previews, and shared publication.
- Demo personal cabinet with profile, listing, favorite, valuation, collection, messages, and settings sections.
- Phone format validation, local profile photo upload/URL, Uzbek/Russian/English interface controls, and address lookup/map pin selection for listing submissions.
- Toast messages, loading shimmer styles, reduced-motion support, and responsive layouts.

## Demo data and images

`data/properties.json` is empty and no sample listings are preloaded. Visitor-submitted listings are saved by the Node API to `server-data/listings.json`, and their media is saved in `server-data/uploads/`; both are ignored by Git. The optimized local image sheet is an original generated visual with 24 different property scenes; cards and galleries crop individual cells with CSS.

Favorites, comparison, valuation history, profile, settings, and listing drafts use browser `localStorage`. Published listings and their media are stored by the Node API in `DATA_DIR` and shared with site visitors. Up to 10 media files can be attached to a listing; each video is limited to 10 MB and each photo to 15 MB.

Address lookup is requested explicitly by the listing author and sends the entered address to OpenStreetMap's Nominatim service. Map tiles are provided by OpenStreetMap. AI search, valuation, messages, and legal links remain front-end demonstrations. User sign-in/authentication is not connected; publishing is currently anonymous and rate-limited. The JSON-file API is intended for a single Node server with a persistent disk; multiple server instances require shared database and media storage.

## React + TypeScript

The existing page URLs and styles are retained; React mounts each page and TypeScript handles the app logic. The `data/properties.json` seed is empty so demo property cards do not appear in the catalog.
