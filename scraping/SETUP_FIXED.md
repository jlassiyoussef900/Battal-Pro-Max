# Quick Setup Guide - Scraping Service

## Issue Fixed

The original installation failed due to:
1. **Disk space** - Puppeteer was trying to download Chromium (~300MB)
2. **Solution** - Now uses your system's Chrome instead

## Setup Steps

### 1. Dependencies are already installed ✅

The scraping service now uses `puppeteer-core` which doesn't download Chromium.

### 2. Configure Environment

Edit `scraping/.env` file:

```env
# REQUIRED: Update these
SPROUT_URL=https://your-sprout-url.com/careers
DB_PASSWORD=your_database_password

# OPTIONAL: Chrome path (auto-detected if not set)
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

# OPTIONAL: Adjust scraping schedule
CRON_SCHEDULE=0 * * * *  # Every hour
```

### 3. Test the Service

```bash
cd scraping

# Test scraping (one-time)
npm run scrape

# Or start the API server
npm start
```

## What Changed

### Before (Failed):
```json
"puppeteer": "^21.6.1"  // Downloads 300MB Chromium
```

### After (Works):
```json
"puppeteer-core": "^21.6.1"  // Uses system Chrome
```

## Chrome Detection

The service automatically finds Chrome at:
1. `C:\Program Files\Google\Chrome\Application\chrome.exe`
2. `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
3. Custom path from `CHROME_PATH` env variable

## Verify Installation

```bash
# Check if Chrome is found
node -e "const fs = require('fs'); const path = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe'; console.log(fs.existsSync(path) ? '✅ Chrome found' : '❌ Chrome not found');"
```

## Next Steps

1. **Update SPROUT_URL** in `.env` with actual Sprout careers page
2. **Set DB_PASSWORD** in `.env`
3. **Run test scrape**: `npm run scrape`
4. **Start service**: `npm start`

## Troubleshooting

### Chrome Not Found

If you get "Chrome not found" error:

**Option 1: Set CHROME_PATH**
```env
CHROME_PATH=C:\Path\To\Your\chrome.exe
```

**Option 2: Install Chrome**
Download from: https://www.google.com/chrome/

**Option 3: Use Edge (Chromium-based)**
```env
CHROME_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

### Module Not Found

If you get module errors, reinstall:
```bash
rmdir /s /q node_modules
set PUPPETEER_SKIP_DOWNLOAD=true
npm install
```

### Database Connection Failed

Check PostgreSQL is running:
```bash
psql -U azer -d battal_db -c "SELECT 1"
```

## Testing

### Test Database Connection
```bash
node -e "import('pg').then(({default:pg})=>{const c=new pg.Pool({host:'localhost',database:'battal_db',user:'azer'});c.query('SELECT NOW()').then(r=>console.log('✅ DB OK:',r.rows[0])).catch(e=>console.log('❌ DB Error:',e.message))})"
```

### Test Scraping
```bash
npm run scrape
```

Expected output:
```
🚀 Starting Sprout Job Scraper...
📡 Testing database connection...
✅ Database connected
🔍 Scraping jobs from Sprout...
🌍 Location rotation enabled - 10 locations available
✅ Found Chrome at: C:\Program Files\Google\Chrome\Application\chrome.exe
📍 Setting location: New York, USA
...
```

## API Endpoints

Once running (`npm start`):

```bash
# Health check
curl http://localhost:3002/health

# Trigger scraping
curl -X POST http://localhost:3002/api/scrape

# Get recent jobs
curl http://localhost:3002/api/jobs/recent?limit=5

# Get statistics
curl http://localhost:3002/api/stats
```

## All Services

To start all services (backend, AI, scraping, frontend):

```bash
# From app root directory
start-all.bat
```

This will start:
- Backend: http://127.0.0.1:8000
- AI Service: http://localhost:3001
- Scraping: http://localhost:3002
- Frontend: http://localhost:5173
