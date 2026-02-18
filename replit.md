# Seller Scan - Replit Agent Guide

## Overview

Seller Scan is a mobile-first product scanning and profit analysis app for Amazon sellers. Users can scan product barcodes (or search by ASIN/UPC), view detailed product data (pricing, BSR rankings, competitor offers, alerts), and calculate profitability for reselling on Amazon FBA/FBM. The app uses Expo (React Native) for the frontend and Express.js for the backend API server.

The app uses **Keepa API** as the sole data source for all Amazon product data (pricing, BSR, offers, alerts) and historical price/sales rank charts. The Rainforest API has been fully removed. `lib/mock-data.ts` provides TypeScript interfaces and helper functions (calculateProfit, formatCurrency, etc.) but no longer serves as a data fallback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
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
- **Local Storage**: Scan history is persisted on-device using `AsyncStorage` (`lib/scan-history.ts`), capped at 15 items

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
- **Caching Strategy**: Product+chart data cached 30min server-side (single unified cache), not-found cached 10min, search results cached 15min, plus client-side product cache (`lib/product-cache.ts`). Critical for supporting 1,000 users on limited API token budget