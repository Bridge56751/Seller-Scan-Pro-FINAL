# Seller Scan - Replit Agent Guide

## Current scope override

The new product direction is a shopper-focused price comparison app: identify goods using native-camera photos (not barcodes), then compare real shopping prices. This supersedes the earlier seller-profit direction. Preserve the existing UI's visual style and mobile layout; the user explicitly said “BUT LEAVE THE UI.” The user has now approved SearchApi.io (not SerpApi). Do not invent prices or reconnect removed providers.

**Why:** The user changed course to AI/API-assisted photo scanning for shoppers finding the cheapest marketplace, and explicitly wants to keep the UI they like.

Keep the shopper experience narrowly focused: someone sees an item (for example, a water bottle), photographs it, learns what it is, and finds the cheapest listed marketplace offer with a link to buy. No shipping calculations, seller-profit tools, or extra shopping-management features. Preserve the UI; do not expand the flow into a detailed shopping questionnaire.

Shopping results should follow the user's supplied reference: compact rows with a product picture, price, marketplace/store, and View Listing action. Keep the existing app style and rank comparable matching offers by listed price; never fabricate missing product images or prices.

Results must stay focused on price and a buying link, with the photo/name/store identifying the listing. Do not show sales rank, BSR, sales estimates or reseller metrics, and avoid “ranked/unranked” jargon. **Why:** The user explicitly said sales rank does not matter and asked for “just ... price a link.”

For scan reliability, the user approved cleaning visual-match titles and at most one shorter-query fallback after an empty automatic shopping search. Never retry provider errors automatically or alter manually refined queries. Share one 60-second shopping budget across attempts; avoid extra ad-link resolution while loading results. Record only stage timings/counts/error codes, never product queries, images, provider responses, or photo URLs. **Why:** Scans were slow and sometimes empty; an additional lookup was explicitly approved only for an empty-result fallback.

“Price: Low to High” must sort every displayed price in the selected currency together, regardless of match confidence or promotional restrictions. Never split matching and related listings into separate price groups. Keep different currencies and unavailable amounts after that list; lowest-comparable-price eligibility is separate from display order. **Why:** The user corrected the previous grouped sorting because low-to-high did not actually display prices in order.

The user approved a Pocket Pricer-inspired, results-first scan flow: native capture → automatic identification and shopping search → dedicated Scan Results screen. Show the photo, likely product name and listings immediately. Refine Search / Wrong Item is optional after results, not a mandatory questionnaire. Keep Scan Again easy to reach. Auto-selected visual suggestions and their listings are possible matches, never falsely user-confirmed exact variants; no seller-profit or resale-estimate features.

The Scan tab is only a camera action, never a landing screen. Do not reintroduce the “See it. Scan it.” page or a second camera-launch button. Canceling capture leaves the shopper on their previous tab; accepting a photo opens results and saves history. The initial app destination is Search.

**Why:** The user explicitly corrected this: “the scan button should only be a camera get rid of that other screen.”

**Why:** The user explicitly corrected the scope: “just scan find and find the cheapest marketplace,” not shipping or everything else.

Geographic goal: support all countries, primarily the US. Build country-aware comparisons with US defaults; clearly disclose unavailable regional coverage rather than presenting US listings as local offers. This is a product goal, not a claim that any selected provider covers every country.

Provider setup is now approved using a dedicated SearchApi key stored server-side as SEARCHAPI_API_KEY. Leave the user's other app, its existing key, and account-wide settings untouched. The user is not concerned about shared usage limits; their concern is breaking the other integration.

**Why:** The user subsequently chose “Proceed with SearchApi” and supplied the key securely. The user explicitly removed the custom photo-sharing consent step. Keep only the OS camera permission before opening the camera; Scan-tab taps then open the native camera directly and accepted photos process automatically. Clearly disclose SearchApi/Google Lens processing without a blocking popup. Canceling the camera must never upload a photo. Preserve the existing visual style.

Permission presentation: no custom Allow / Don’t Allow popup. Keep full processing/privacy details in Photo & Shopping Privacy and a brief provider disclosure on the scan screen. Do not claim this implementation establishes legal compliance or App Store approval.

The user requested removal of Keepa, Amazon-hosted product images, and unpkg. Do not reconnect these providers or substitute mock data. Legacy product details/charts and new subscriptions remain paused; saved legacy history and subscription management remain available. Legacy product endpoints still return HTTP 503 without external calls. Provider descriptions below are historical and do not describe currently enabled functionality.

**Why:** The user explicitly chose to disable product-data features for now when removing these services. Removing code does not cancel provider billing or existing Apple subscriptions.

## Current shopping implementation

The user clarified that scanning should not ask for country: scan a product, show comparable listings, and help find the cheapest place to buy the same item. Use US listings by default in the scan flow and label the market, without a country-selection step. Keep the product-match check lightweight; detailed corrections are optional.

- Scan uses SearchApi's Google Lens `visual_matches`, followed automatically by a Google Shopping query for the leading usable suggestion. These are labeled possible matches with optional refinement. The user removed the standalone Search tab without a replacement; keep refinement inside scan results. History is the starting screen, and Scan remains a camera-only action.
- Supported countries are the initial Lens/Shopping intersection in `shared/shopping.ts`; US is the default. Unsupported countries return an explicit error without a US fallback. Country targeting is not a shipping guarantee.
- Prices are actual provider results, not checkout totals. Only matching-title prices in the regional currency without detected financing/bundle conditions are sorted. All titles/conditions must still be checked at the retailer; results are not exhaustive or verified seller endorsements.
- Photos are resized/re-encoded locally and server-side; server-side metadata is stripped. An AES-GCM encrypted temporary database record supports fetching across replicas. A random capability URL includes the decryption key; it is never stored alongside the ciphertext. Links expire after 2 minutes, records are deleted after processing and expired records are swept. Database backups and third-party retention are disclosed.
- Settings has a Photo & Shopping Privacy disclosure with provider links. Accepted camera photos trigger identification without a separate consent screen. Native permission-string changes require a new native build. The existing hosted general privacy policy is external to this repository.
- `shopping_photos` is defined in `shared/schema.ts`. Post-merge setup installs dependencies and applies the development schema. No production DDL runs on application startup.
- `npm run test:shopping` covers schema validation, result normalization and API guardrails. Use real development API smoke checks for provider compatibility; do not log keys, image URLs or provider bodies.

## Overview

Seller Scan is a mobile-first product scanning and profit analysis app for Amazon sellers. Users can scan product barcodes (or search by ASIN/UPC), view detailed product data (pricing, BSR rankings, competitor offers, alerts), and calculate profitability for reselling on Amazon FBA/FBM. The app uses Expo (React Native) for the frontend and Express.js for the backend API server.

The app uses **Keepa API** as the sole data source for all Amazon product data (pricing, BSR, offers, alerts) and historical price/sales rank charts. The Rainforest API has been fully removed. `lib/mock-data.ts` provides TypeScript interfaces and helper functions (calculateProfit, formatCurrency, etc.) but no longer serves as a data fallback.

## User Preferences

Preferred communication style: Simple, everyday language.

Preserve the user's existing Expo CLI login during startup, dependency installs, merges, and maintenance. Do not run Expo logout, replace the session with a managed account, delete Expo authentication state, or change its home directory without asking the user first. Never copy authentication files into the project or Git.

**Why:** The user explicitly asked not to be logged out again after repeated Expo Go sign-in problems. If Expo requires fresh authentication, explain that rather than silently switching accounts.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 58 with React Native 0.88 (New Architecture is mandatory). Preview with stock Expo Go 58.
- **Routing**: `expo-router` with file-based routing. No auth gate — users go straight to the app. Tab navigation lives in `app/(tabs)/` with four tabs: Scan (barcode camera), Search, History, and Settings. Product detail pages are at `app/product/[asin].tsx`. Paywall is at `app/paywall.tsx` (modal)
- **No User Accounts**: No sign-in, no user accounts. The app is fully anonymous. Subscription status is managed via Apple's non-consumable/subscription purchases (StoreKit/RevenueCat). Auth context (`lib/auth-context.tsx`) manages device state only (isPaid, scanCount, freeScansLeft)
- **Anti-Abuse**: Device fingerprint via `lib/device-id.ts` stored in SecureStore (persists across app reinstalls on iOS). Device ID sent with scan recording. Server tracks scans per device in `device_scans` table, preventing users from getting more free scans by reinstalling the app
- **State Management**: `@tanstack/react-query` for server state (configured in `lib/query-client.ts`), React `useState` for local UI state, and `AsyncStorage` for persisting scan history locally on-device
- **UI**: Custom components with no external UI library. Light theme with a clean, professional color system defined in `constants/colors.ts`. Uses `expo-camera` for barcode scanning, `expo-haptics` for tactile feedback, `expo-image` for optimized image rendering, and `react-native-reanimated` for animations
- **Fonts**: Inter font family (400, 500, 600, 700 weights) loaded via `@expo-google-fonts/inter`
- **Key Components**:
  - `QuickInfoPanel` - Product overview with cost input
  - `ProfitCalculatorPanel` - Detailed profit/ROI/margin breakdown
  - `AlertsPanel` - Eligibility, hazmat, IP, oversize warnings
  - `OffersPanel` - Competitor seller listings
  - `ChartsPanel` - Price and rank history charts (SVG-based)
  - `RanksPricesPanel` - BSR and pricing across time ranges
  - `CollapsiblePanel` - Reusable accordion container

### Backend (Express.js)

- **Framework**: Express 5 running on Node.js
- **Entry Point**: `server/index.ts` - Sets up CORS (supports Replit domains and localhost), JSON parsing, and serves static web builds in production
- **Routes**: `server/routes/device.ts` handles device status (`POST /api/device/status`) and scan recording (`POST /api/device/record-scan`). `server/routes/keepa.ts` handles product lookup by ASIN, UPC, search, chart data, and token status. All prefixed with `/api`
- **Services**: `server/services/keepa.ts` (Keepa API integration - full product data, chart history, search, UPC/barcode lookup, transformation to ProductData format. Note: `fetchKeepaOffers` exists but current API plan doesn't support detailed seller listings)
- **Storage**: `server/storage.ts` - PostgreSQL-backed `DatabaseStorage` using Drizzle ORM. Handles device scan count tracking via `device_scans` table
- **Build**: Server is bundled with esbuild for production (`server_dist/`)

### Data Layer

- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL dialect. `device_scans` table tracks scan counts per device ID. `users` table exists but is no longer used for authentication. Uses `drizzle-zod` for validation schemas
- **Database**: PostgreSQL configured via `DATABASE_URL` environment variable. Drizzle Kit handles migrations (`drizzle.config.ts` outputs to `./migrations`)
- **Mock Data**: `lib/mock-data.ts` exports TypeScript interfaces (ProductData, PricePoint, RankPoint, Competitor, Alert) and helper functions (`calculateProfit`, `formatCurrency`, `formatBSR`, `estimateSalesPerDay`). Product data now comes entirely from Keepa API
- **Local Storage**: Photo scans are automatically saved locally in History, including failed/no-match scans, a small photo copy, and result snapshots. Latest 50 scans, newest first; refinements update the same entry. Reopening does not re-query providers; saved price timestamps remain visible. Legacy ASIN history storage is preserved separately.

### API Communication

- `lib/query-client.ts` provides `apiRequest()` for making authenticated API calls to the Express backend. The base URL is derived from `EXPO_PUBLIC_DOMAIN` environment variable
- The query client includes a `getQueryFn` factory for TanStack Query with configurable 401 handling

### Build & Development

- **Dev Mode**: Two processes run simultaneously - Expo dev server (`expo:dev`) and Express API server (`server:dev` via tsx)
- **Production Build**: Custom build script (`scripts/build.js`) starts Metro bundler, fetches the web bundle, and saves static files. Server is built with esbuild
- **Deployment Scripts**: `db:push` for pushing schema changes to PostgreSQL

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` env var. Used with Drizzle ORM for schema management and queries
- **Expo Services**: Camera permissions, haptic feedback, image handling, splash screen, fonts - all via Expo SDK modules
- **AsyncStorage**: `@react-native-async-storage/async-storage` for on-device persistence of scan history
- **TanStack React Query**: Server state management and caching
- **Replit Environment**: The app is designed to run on Replit, using `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and `REPLIT_INTERNAL_APP_DOMAIN` environment variables for URL configuration and CORS
- **Keepa API**: Sole data source for all Amazon product data (pricing, BSR, alerts, images, UPC) and historical price/sales rank charts (180 days). Budget: ~20 tokens/min (€49/month plan), **1 token per product lookup** (optimized from 3). Detailed seller listings not available on current plan (`offersSuccessful: false`); seller counts come from stats data in base call. ~28,800 lookups/day capacity. Env var: `KEEPA_API_KEY`
- **RevenueCat**: Subscription management via `react-native-purchases` SDK. Works in Expo Go (Preview API Mode). API key served from backend endpoint `GET /api/config/revenuecat` (reads `REVENUECAT_API_KEY` secret). SDK initialized in `lib/auth-context.tsx` on app startup. Purchase/restore flows in `lib/revenuecat.ts`. Entitlement name: "pro" or "Pro". Paywall at `app/paywall.tsx`, restore also in `app/(tabs)/settings.tsx`
- **Caching Strategy**: Product+chart data cached 30min server-side (single unified cache), not-found cached 10min, search results cached 15min, plus client-side product cache (`lib/product-cache.ts`). Critical for supporting 1,000 users on limited API token budget
- **Rate Limiting**: Global token bucket in `server/routes/keepa.ts` — rolling 60s window, max 18 API calls/min (2 token buffer below Keepa's 20/min limit). Requests that exceed the limit queue and wait (up to 15s) instead of being rejected. Cache hits bypass the limiter entirely. Rate limiter status exposed via `/api/keepa/tokens` endpoint