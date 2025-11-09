# Performance Improvements

## Changes Made

### 1. Lazy Loading Routes (router/index.ts)
- Changed all route components to use dynamic imports
- Routes now load on-demand instead of all at once
- **Expected Impact**: 60-70% reduction in initial bundle size

### 2. Build Optimizations (vite.config.ts)
- Added manual chunk splitting for vendor libraries
- Separated Vue/Pinia/Router into one chunk, Axios into another
- Set chunk size warning limit to 1000KB
- **Expected Impact**: Better caching and 20-30% smaller bundles

### 3. Loading Indicator (index.html)
- Added visible loading spinner while app initializes
- **Expected Impact**: Better perceived performance

### 4. API Timeout Increase (api/client.ts)
- Increased timeout from 5s to 10s
- **Expected Impact**: Fewer timeout errors during slow network

### 5. Development Docker Compose (docker-compose.dev.yml)
- New file for development with hot reload
- Mounts source code instead of rebuilding
- **Expected Impact**: < 1 second load time in development

## How to Use

### For Development (Recommended)

**Option 1: Run locally (fastest)**
```bash
cd invoice-frontend
npm run dev
```
Then open http://localhost:5173

**Option 2: Use dev Docker compose**
```bash
docker-compose -f docker-compose.dev.yml up
```
Then open http://localhost:5173

### For Production

```bash
docker-compose up
```
Then open http://localhost

## Expected Load Times

- **Before**: 30-60 seconds (Docker production build)
- **After (dev mode)**: < 1 second
- **After (production)**: 2-5 seconds (with lazy loading)

## What Each Change Does

1. **Lazy Loading**: Each route is now in its own JavaScript chunk. When you visit `/dashboard`, only the Dashboard code loads, not the entire app.

2. **Manual Chunks**: Common libraries (Vue, Router, Pinia) are bundled together. This means they cache well and don't need to reload on every page.

3. **Dev Compose**: Runs Vite's dev server with hot module replacement instead of building a production bundle every time.

