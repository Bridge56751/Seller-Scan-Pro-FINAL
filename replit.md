# ScanProfit - Replit Agent Guide

## Overview

ScanProfit is a mobile-first product scanning and profit analysis app for Amazon sellers. Users can scan product barcodes (or search by ASIN/UPC), view detailed product data (pricing, BSR rankings, competitor offers, alerts), and calculate profitability for reselling on Amazon FBA/FBM. The app uses Expo (React Native) for the frontend and Express.js for the backend API server.

The app integrates with **Rainforest API** for real-time Amazon product data (pricing, BSR, offers, alerts) and **Keepa API** for historical price/sales rank charts. Mock data (`lib/mock-data.ts`) still provides fallback interfaces and helper functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: `expo-router` with file-based routing. Tab navigation lives in `app/(tabs)/` with three tabs: Scan (barcode camera), Search, and History. Product detail pages are at `app/product/[asin].tsx`
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
- **Routes**: `server/routes.ts` - Empty scaffold. Active routes in `server/routes/rainforest.ts` (product lookup by ASIN/UPC/search) and `server/routes/keepa.ts` (historical charts). All prefixed with `/api`
- **Services**: `server/services/rainforest.ts` (Rainforest API integration with product transforms), `server/services/keepa.ts` (Keepa API with price/rank history parsing)
- **Storage**: `server/storage.ts` - In-memory storage implementation (`MemStorage`) with a `IStorage` interface. Currently only handles user CRUD operations
- **Build**: Server is bundled with esbuild for production (`server_dist/`)

### Data Layer

- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM with PostgreSQL dialect. Currently only has a `users` table (id, username, password). Uses `drizzle-zod` for validation schemas
- **Database**: PostgreSQL configured via `DATABASE_URL` environment variable. Drizzle Kit handles migrations (`drizzle.config.ts` outputs to `./migrations`)
- **Mock Data**: All product data currently comes from `lib/mock-data.ts` which exports interfaces, mock product databases, helper functions (`calculateProfit`, `formatCurrency`, `formatBSR`, `estimateSalesPerDay`), and lookup functions (`lookupByAsin`, `lookupByBarcode`, `searchProducts`)
- **Local Storage**: Scan history is persisted on-device using `AsyncStorage` (`lib/scan-history.ts`), capped at 100 items

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
- **Rainforest API**: Real-time Amazon product data (pricing, BSR, offers, alerts). Server-side cache: 30min for products, 10min for not-found. Env var: `RAINFOREST_API_KEY`
- **Keepa API**: Historical price and sales rank charts (180 days). Server-side cache: 24hr per ASIN. Budget: ~20 tokens/min, 1 token per product lookup. Env var: `KEEPA_API_KEY`
- **Caching Strategy**: Rainforest data cached 30min server-side + client-side product cache (`lib/product-cache.ts`). Keepa chart data cached 24hr server-side. Critical for supporting 1,000 users on limited API budgets