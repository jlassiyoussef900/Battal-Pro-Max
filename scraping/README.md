# Job Scraping Service - Sprout

Automated job scraping service that extracts job opportunities from the Sprout application and stores them in PostgreSQL database.

## Features

- 🤖 Automated job scraping from Sprout
- 🔄 Multiple scraping methods (API, Cheerio, Puppeteer)
- 💾 Automatic database storage
- ⏰ Scheduled scraping with cron jobs
- 🚀 REST API for manual triggers
- 📊 Statistics and monitoring
- 🔍 Duplicate detection
- 🧹 Data cleaning and validation

## Architecture

```
┌─────────────┐
│   Sprout    │
│  Website    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│   Scraper   │─────▶│  PostgreSQL  │
│  (Node.js)  │      │   Database   │
│  Port 3002  │      │              │
└─────────────┘      └──────────────┘
       │
       ▼
┌─────────────┐
│  REST API   │
│  Endpoints  │
└─────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd scraping
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
```

**Required Configuration:**

```env
# Scraping Service
PORT=3002

# Sprout URLs
SPROUT_URL=https://sprout.com/careers
SPROUT_API_URL=https://api.sprout.com/jobs

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battal_db
DB_USER=azer
DB_PASSWORD=your_password

# Scraping Settings
SCRAPE_INTERVAL=3600000
CRON_SCHEDULE=0 * * * *

# User Agent
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### 3. Verify Database

Make sure your PostgreSQL database has the required tables:

```sql
-- Check if tables exist
\dt

-- Should have: jobs, companies
```

### 4. Start the Service

```bash
# Start the server (with auto-scraping)
npm start

# Or run one-time scraping
npm run scrape
```

## Usage

### Option 1: Automated Service

Start the server for continuous operation with scheduled scraping:

```bash
npm start
```

The service will:
- Start REST API on port 3002
- Run scraping every hour (configurable)
- Store jobs in database automatically
- Provide monitoring endpoints

### Option 2: Manual Scraping

Run a one-time scraping operation:

```bash
npm run scrape
```

This will:
- Scrape jobs from Sprout
- Save to database
- Show statistics
- Exit when complete

### Option 3: API Trigger

Trigger scraping via API:

```bash
curl -X POST http://localhost:3002/api/scrape
```

## API Endpoints

### 1. Manual Scrape Trigger

**POST** `/api/scrape`

Manually trigger a scraping operation.

**Response:**
```json
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

### 2. Get Recent Jobs

**GET** `/api/jobs/recent?limit=10`

Get recently scraped jobs.

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Developer",
      "company_name": "Sprout",
      "location": "Remote",
      "description": "...",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "count": 10
}
```

### 3. Get Statistics

**GET** `/api/stats`

Get scraping and database statistics.

**Response:**
```json
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
    "lastResult": { ... },
    "nextRun": "2024-01-15T11:00:00.000Z"
  }
}
```

### 4. Get Scraping Status

**GET** `/api/status`

Get current scraping status.

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": false,
    "lastRun": "2024-01-15T10:00:00.000Z",
    "lastResult": {
      "scraped": 25,
      "saved": 15,
      "skipped": 10,
      "errors": 0
    },
    "nextRun": "2024-01-15T11:00:00.000Z"
  }
}
```

### 5. Health Check

**GET** `/health`

Check if service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "Job Scraping Service",
  "scraping": { ... }
}
```

## Scraping Methods

The scraper tries multiple methods in order:

### 1. API Scraping (Fastest)
- Attempts to fetch from Sprout API
- Best performance
- Requires API endpoint

### 2. Cheerio Scraping (Fast)
- Parses static HTML
- Low resource usage
- Works for server-rendered pages

### 3. Puppeteer Scraping (Comprehensive)
- Full browser automation
- Handles JavaScript-rendered content
- Slower but most reliable

## Configuration

### Cron Schedule

Default: Every hour (`0 * * * *`)

Change in `.env`:
```env
# Every 30 minutes
CRON_SCHEDULE=*/30 * * * *

# Every 6 hours
CRON_SCHEDULE=0 */6 * * *

# Daily at 9 AM
CRON_SCHEDULE=0 9 * * *

# Every Monday at 8 AM
CRON_SCHEDULE=0 8 * * 1
```

### Scraping Interval

For manual interval (milliseconds):
```env
SCRAPE_INTERVAL=3600000  # 1 hour
SCRAPE_INTERVAL=1800000  # 30 minutes
SCRAPE_INTERVAL=7200000  # 2 hours
```

### Sprout URLs

Update these based on actual Sprout application:

```env
# Main careers page
SPROUT_URL=https://sprout.com/careers

# API endpoint (if available)
SPROUT_API_URL=https://api.sprout.com/jobs
```

## Data Flow

1. **Scraping**
   - Fetch jobs from Sprout
   - Extract: title, company, location, description, etc.
   - Clean and validate data

2. **Processing**
   - Normalize job types (full-time, part-time, etc.)
   - Determine experience levels (junior, mid, senior)
   - Parse salary ranges
   - Extract skills/requirements

3. **Storage**
   - Check for duplicates
   - Create/find company
   - Insert job into database
   - Link skills and requirements

4. **Monitoring**
   - Track scraping status
   - Log results
   - Update statistics

## Database Schema

### Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    job_type VARCHAR(50),
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level VARCHAR(50),
    remote BOOLEAN,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Companies Table
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Troubleshooting

### No Jobs Found

**Possible causes:**
- Incorrect SPROUT_URL
- Website structure changed
- Website blocking scraping
- Network issues

**Solutions:**
1. Verify URL in browser
2. Check website HTML structure
3. Update selectors in `sproutScraper.js`
4. Try different user agent

### Database Connection Failed

**Error:** "Database connection failed"

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection: `psql -U azer -d battal_db`
4. Check firewall settings

### Puppeteer Issues

**Error:** "Failed to launch browser"

**Solutions:**
1. Install Chromium: `npx puppeteer browsers install chrome`
2. Check system dependencies
3. Try headless: false for debugging

### Duplicate Jobs

The scraper automatically detects duplicates based on:
- Same title
- Same company
- Created within last 30 days

## Testing

### Test Scraping
```bash
npm run scrape
```

### Test API
```bash
# Health check
curl http://localhost:3002/health

# Trigger scraping
curl -X POST http://localhost:3002/api/scrape

# Get recent jobs
curl http://localhost:3002/api/jobs/recent?limit=5

# Get stats
curl http://localhost:3002/api/stats
```

### Test Database
```bash
psql -U azer -d battal_db

# Check jobs
SELECT COUNT(*) FROM jobs;

# Check recent jobs
SELECT title, company_id, created_at 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10;
```

## Monitoring

### Logs

The service logs:
- Scraping start/end
- Jobs found/saved
- Errors and warnings
- Database operations

### Statistics

Check stats via API:
```bash
curl http://localhost:3002/api/stats
```

Or in database:
```sql
SELECT 
  COUNT(*) as total_jobs,
  COUNT(DISTINCT company_id) as companies,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today
FROM jobs;
```

## Production Deployment

### Recommendations

1. **Use PM2** for process management
```bash
npm install -g pm2
pm2 start server.js --name job-scraper
pm2 save
pm2 startup
```

2. **Set up logging**
```bash
pm2 logs job-scraper
```

3. **Monitor resources**
```bash
pm2 monit
```

4. **Configure alerts**
- Set up email notifications for errors
- Monitor scraping success rate
- Track database growth

5. **Optimize scraping**
- Adjust cron schedule based on job posting frequency
- Use API method when available
- Cache results to reduce load

## File Structure

```
scraping/
├── server.js              # Express server with API
├── scraper.js            # Standalone scraper script
├── sproutScraper.js      # Sprout scraping logic
├── database.js           # Database operations
├── package.json          # Dependencies
├── .env                  # Configuration (create this)
├── .env.example          # Example configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3002 | No |
| `SPROUT_URL` | Sprout careers page | - | Yes |
| `SPROUT_API_URL` | Sprout API endpoint | - | No |
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | Yes |
| `DB_NAME` | Database name | battal_db | Yes |
| `DB_USER` | Database user | azer | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `CRON_SCHEDULE` | Cron schedule | 0 * * * * | No |
| `USER_AGENT` | Browser user agent | Mozilla/5.0... | No |

## Support

For issues:
1. Check logs for errors
2. Verify configuration
3. Test database connection
4. Check Sprout URL accessibility

## License

MIT
