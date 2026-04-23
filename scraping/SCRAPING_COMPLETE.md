# Job Scraping Service - Complete Implementation

## Overview

Advanced job scraping service with headless browser automation, location rotation, and stealth features to scrape job opportunities from Sprout application.

## Key Features

### 🌍 Location Rotation
- **10 Global Locations**: Rotates through New York, London, San Francisco, Toronto, Sydney, Berlin, Paris, Tokyo, Singapore, and Dubai
- **Geolocation Spoofing**: Sets accurate latitude/longitude for each location
- **Timezone Emulation**: Matches timezone to location
- **Locale Settings**: Adjusts language and regional settings

### 🕵️ Stealth Features
- **User Agent Rotation**: 8+ different user agents
- **Screen Resolution Variation**: 6 different resolutions
- **WebDriver Detection Bypass**: Hides automation indicators
- **Human-like Behavior**: Random delays, scrolling, mouse movements
- **Browser Fingerprint Randomization**: Changes fingerprint each scrape

### 🤖 Multiple Scraping Methods
1. **API Scraping** - Fastest, direct API calls
2. **Cheerio Scraping** - Fast, static HTML parsing
3. **Headless Browser** - Most reliable, handles JavaScript

### 💾 Database Integration
- Automatic storage in PostgreSQL
- Duplicate detection (30-day window)
- Company management
- Job normalization

### ⏰ Automated Scheduling
- Cron-based scheduling
- Configurable intervals
- Manual trigger via API
- Status monitoring

## Architecture

```
┌─────────────────────────────────────────┐
│         Browser Manager                 │
│  - Location Rotation (10 locations)     │
│  - User Agent Rotation (8 agents)       │
│  - Stealth Features                     │
│  - Human-like Behavior                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Sprout Scraper                  │
│  - API Scraping                         │
│  - Cheerio Scraping                     │
│  - Browser Scraping                     │
│  - Data Cleaning                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Database Handler                   │
│  - PostgreSQL Storage                   │
│  - Duplicate Detection                  │
│  - Company Management                   │
│  - Statistics                           │
└─────────────────────────────────────────┘
```

## Location Rotation Details

### Available Locations

| Location | Timezone | Locale | Coordinates |
|----------|----------|--------|-------------|
| New York, USA | America/New_York | en-US | 40.7128, -74.0060 |
| London, UK | Europe/London | en-GB | 51.5074, -0.1278 |
| San Francisco, USA | America/Los_Angeles | en-US | 37.7749, -122.4194 |
| Toronto, Canada | America/Toronto | en-CA | 43.6532, -79.3832 |
| Sydney, Australia | Australia/Sydney | en-AU | -33.8688, 151.2093 |
| Berlin, Germany | Europe/Berlin | de-DE | 52.5200, 13.4050 |
| Paris, France | Europe/Paris | fr-FR | 48.8566, 2.3522 |
| Tokyo, Japan | Asia/Tokyo | ja-JP | 35.6762, 139.6503 |
| Singapore | Asia/Singapore | en-SG | 1.3521, 103.8198 |
| Dubai, UAE | Asia/Dubai | ar-AE | 25.2048, 55.2708 |

### How It Works

1. **First Scrape**: Uses New York location
2. **Second Scrape**: Rotates to London
3. **Third Scrape**: Rotates to San Francisco
4. **...continues rotating through all 10 locations**
5. **After 10th**: Returns to New York

Each scrape uses:
- Different geolocation
- Different timezone
- Different locale
- Random user agent
- Random screen resolution

## Setup

### 1. Install Dependencies

```bash
cd scraping
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Service
PORT=3002

# Sprout URLs
SPROUT_URL=https://sprout.com/careers
SPROUT_API_URL=https://api.sprout.com/jobs

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battal_db
DB_USER=azer
DB_PASSWORD=your_password

# Scheduling
CRON_SCHEDULE=0 * * * *
```

### 3. Start Service

```bash
# Start server with auto-scraping
npm start

# Or run one-time scrape
npm run scrape
```

## Usage Examples

### Manual Scraping

```bash
# Run once
npm run scrape

# Output:
# 🚀 Starting Sprout Job Scraper...
# 📡 Testing database connection...
# ✅ Database connected
# 🔍 Scraping jobs from Sprout...
# 🌍 Location rotation enabled - 10 locations available
# 📍 Setting location: New York, USA
# 🖥️  Resolution: 1920x1080
# 🌐 Navigating to https://sprout.com/careers...
# ✅ Navigation successful
# 📜 Scrolling page to load dynamic content...
# ✅ Found jobs using selector: .job-card
# ✅ Found 25 jobs from Sprout
# 💾 Saving 25 jobs to database...
# ✅ Saved: 15
# ⏭️  Skipped (duplicates): 10
```

### API Trigger

```bash
# Trigger scraping
curl -X POST http://localhost:3002/api/scrape

# Response:
{
  "success": true,
  "message": "Scraping completed",
  "result": {
    "scraped": 25,
    "saved": 15,
    "skipped": 10,
    "errors": 0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Recent Jobs

```bash
curl http://localhost:3002/api/jobs/recent?limit=5
```

### Get Statistics

```bash
curl http://localhost:3002/api/stats

# Response:
{
  "success": true,
  "stats": {
    "total_jobs": "150",
    "total_companies": "5",
    "jobs_today": "25",
    "jobs_this_week": "80"
  },
  "scrapingStatus": {
    "isRunning": false,
    "lastRun": "2024-01-15T10:00:00.000Z",
    "nextRun": "2024-01-15T11:00:00.000Z"
  }
}
```

## Stealth Features Explained

### 1. WebDriver Detection Bypass

```javascript
// Hides navigator.webdriver
Object.defineProperty(navigator, 'webdriver', {
  get: () => false
});
```

### 2. Plugin Spoofing

```javascript
// Adds fake plugins
Object.defineProperty(navigator, 'plugins', {
  get: () => [1, 2, 3, 4, 5]
});
```

### 3. Chrome Object

```javascript
// Adds chrome object
window.chrome = { runtime: {} };
```

### 4. Random Delays

```javascript
// Mimics human behavior
await addRandomDelay(1000, 3000); // 1-3 seconds
```

### 5. Scrolling

```javascript
// Scrolls page naturally
await scrollPage(page);
```

## Browser Manager API

### Create Stealth Page

```javascript
const { page, location } = await browserManager.createStealthPage();
// Returns page with rotated location and stealth settings
```

### Navigate with Retry

```javascript
await browserManager.navigateWithRetry(page, url, maxRetries);
// Navigates with automatic retries
```

### Scroll Page

```javascript
await browserManager.scrollPage(page);
// Scrolls to load dynamic content
```

### Take Screenshot

```javascript
await browserManager.takeScreenshot(page, 'debug.png');
// Saves screenshot for debugging
```

### Extract Text

```javascript
const text = await browserManager.extractText(page, '.selector');
// Safely extracts text from element
```

## Monitoring

### Check Status

```bash
curl http://localhost:3002/api/status
```

### View Logs

```bash
# If using PM2
pm2 logs job-scraper

# Or check console output
```

### Database Stats

```sql
-- Total jobs
SELECT COUNT(*) FROM jobs;

-- Jobs by location
SELECT location, COUNT(*) 
FROM jobs 
GROUP BY location 
ORDER BY COUNT(*) DESC;

-- Recent jobs
SELECT title, company_id, created_at 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10;
```

## Troubleshooting

### No Jobs Found

**Check:**
1. Verify SPROUT_URL is correct
2. Check website is accessible
3. Review screenshot: `sprout-page.png`
4. Update selectors in `sproutScraper.js`

### Browser Launch Failed

**Solutions:**
```bash
# Install Chromium
npx puppeteer browsers install chrome

# Check system dependencies
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

### Location Not Changing

**Verify:**
- Check logs for "Setting location: ..."
- Each scrape should show different location
- Location rotates automatically

### Detection Issues

**If website detects automation:**
1. Increase random delays
2. Add more user agents
3. Use residential proxies
4. Reduce scraping frequency

## Performance

### Resource Usage

- **Memory**: ~200-500 MB per browser instance
- **CPU**: Moderate during scraping
- **Network**: Depends on page size
- **Disk**: Minimal (logs only)

### Optimization Tips

1. **Close browser after scraping**
   ```javascript
   await browserManager.closeBrowser();
   ```

2. **Use Cheerio when possible**
   - Faster than browser
   - Less resource intensive

3. **Adjust cron schedule**
   - Don't scrape too frequently
   - Respect website resources

4. **Cache results**
   - Store in database
   - Avoid duplicate scrapes

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start service
pm2 start server.js --name job-scraper

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs job-scraper
```

### Docker Deployment

```dockerfile
FROM node:18

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3002
CMD ["npm", "start"]
```

## File Structure

```
scraping/
├── server.js              # Express API server
├── scraper.js            # Standalone scraper
├── sproutScraper.js      # Sprout scraping logic
├── browserManager.js     # Browser with location rotation
├── database.js           # PostgreSQL operations
├── package.json          # Dependencies
├── .env                  # Configuration
├── .env.example          # Example config
├── .gitignore           # Git ignore
└── README.md            # Documentation
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Trigger manual scrape |
| GET | `/api/jobs/recent` | Get recent jobs |
| GET | `/api/stats` | Get statistics |
| GET | `/api/status` | Get scraping status |
| GET | `/health` | Health check |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3002) |
| `SPROUT_URL` | Sprout careers page | Yes |
| `SPROUT_API_URL` | Sprout API endpoint | No |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `CRON_SCHEDULE` | Cron schedule | No (default: hourly) |

## Next Steps

1. **Add More Sources**: Extend to scrape from LinkedIn, Indeed, etc.
2. **Proxy Support**: Add rotating proxies for better anonymity
3. **Rate Limiting**: Implement intelligent rate limiting
4. **Error Recovery**: Better error handling and recovery
5. **Notifications**: Alert on scraping failures
6. **Analytics**: Track scraping success rates

## License

MIT
