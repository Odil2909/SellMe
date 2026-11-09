# Makon — недвижимость по-новому

Premium green real estate marketplace prototype for Uzbekistan. Built with React, TypeScript, CSS, JSON demo listings, and `localStorage`.

## Start locally

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Brand

Name ideas considered: **Makon**, **Nesto**, **Uya**, **Livora**, and **Domio**. **Makon** is the selected working name: a short Uzbek word associated with a place or space, used here as an independent product brand.

The visual system uses Makon green (`#087C55`), dark green (`#075B40`), soft green surfaces, Inter with a sans-serif fallback, rounded cards, fine borders, and restrained motion. The compact house mark is in `assets/icons/makon-mark.svg`. The five PNGs originally in the project root are design reference screenshots, so they were left in place and are not used as listing photos.

## Project structure

```text
index.html
pages/
  ai-search.html
  catalog.html
  compare.html
  create-listing.html
  favorites.html
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
  catalog.ts
  comparison.ts
  favorites.ts
  home.ts
  icons.ts
  listing.ts
  mock-data.ts
  profile.ts
  property.ts
  store.ts
  types.ts
  ui.ts
  valuation.ts
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
- Twenty-four varied listings in Tashkent, Samarkand, Bukhara, Andijan, Namangan, Fergana, and Nukus.
- Catalog search, deal/category/city/district/price/area/room/condition/floor filters, verification filter, sorting, grid/list/map demo views, and empty states.
- Map markers use property-type icons; listings without coordinates are spread around the city center and explicitly labeled approximate, while listings with coordinates use their selected location.
- Property detail pages selected with `?id=mak-001`, photo gallery/lightbox, features, contact actions, and similar listings.
- Favorites and up-to-four-object comparison saved in local storage.
- Property valuation form with category-dependent fields, illustrative range, comparables, history, and an explicit demo-only disclosure.
- Rule-based natural-language property matching for type, city, deal, budget, room count, and district. Commute preferences are collected but are not calculated.
- Ten-step listing form with per-step validation, draft saving, local photo-name selection, preview, and demo publication.
- Demo personal cabinet with profile, listing, favorite, valuation, collection, messages, and settings sections.
- Phone format validation, local profile photo upload/URL, Uzbek/Russian/English interface controls, and an OpenStreetMap location picker for listing submissions.
- Toast messages, loading shimmer styles, reduced-motion support, and responsive layouts.

## Demo data and images

`data/properties.json` is the single listing source. Listings are not current offers and their prices are illustrative USD values. The optimized local image sheet is an original generated visual with 24 different property scenes; cards and galleries crop individual cells with CSS. No user-supplied files were moved or deleted.

Favorites, comparison, valuation history, profile, settings, and listing drafts/publications use browser `localStorage`. They are local to the browser and are not sent to a server. Listing photo selection is a UI demonstration; image files are not uploaded.

AI search, valuation, map placement, messages, legal links, and language selection are front-end demonstrations. There is no AI service, geocoding, live market data, authentication, server, or database.

## React + TypeScript

The existing page URLs and styles are retained; React mounts each page and TypeScript handles the app logic. `data/properties.json` remains the demo listing source with a shared TypeScript model. This migration does not add a backend, authentication, or new product behavior.
