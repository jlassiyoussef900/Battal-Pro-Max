# Using Scraped Jobs in the App

## Overview

The app now integrates with the job scraping service to display real jobs from various sources (Indeed, LinkedIn, Adzuna, Sprout) in the Tinder-style job matcher.

## How It Works

1. **Scraping Service** (`scraping/` folder)
   - Scrapes jobs from multiple sources
   - Stores jobs in PostgreSQL database
   - Runs automatically on a schedule (hourly by default)
   - Can be triggered manually via API

2. **Backend API** (`backend/` folder)
   - Provides REST API endpoints to fetch jobs
   - Returns jobs with company information
   - Handles job applications

3. **Frontend App** (`src/` folder)
   - Fetches jobs from backend API
   - Displays jobs in Tinder-style interface
   - Shows company logos and details
   - Allows swiping and applying

## Setup Instructions

### 1. Start the Scraping Service

```bash
cd scraping
npm install
npm start
```

The service will:
- Start on port 3002
- Run scheduled scraping every hour
- Store jobs in the database

### 2. Trigger Initial Scrape (Optional)

To immediately scrape jobs without waiting for the schedule:

**Option A: Use the batch script**
```bash
# From the app root directory
trigger-scrape.bat
```

**Option B: Use curl**
```bash
curl -X POST http://localhost:3002/api/scrape
```

**Option C: Use the scraper directly**
```bash
cd scraping
npm run scrape
```

### 3. Start the Backend API

```bash
cd backend
php -S localhost:8000 -t public
```

The backend will serve jobs from the database on port 8000.

### 4. Start the Frontend App

```bash
# From the app root directory
npm install
npm run dev
```

The app will start on port 5173 and fetch jobs from the backend.

## Verifying Jobs Are Loaded

### Check Database

```sql
-- Connect to PostgreSQL
psql -U azer -d battal_db

-- Count total jobs
SELECT COUNT(*) FROM jobs;

-- View recent jobs
SELECT j.title, c.name as company, j.location, j.salary_min, j.created_at 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
ORDER BY j.created_at DESC 
LIMIT 10;

-- View jobs by source
SELECT c.name, COUNT(*) as job_count 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
GROUP BY c.name 
ORDER BY job_count DESC;
```

### Check Scraping Service

```bash
# Get scraping statistics
curl http://localhost:3002/api/stats

# Get recent jobs
curl http://localhost:3002/api/jobs/recent?limit=5

# Check service status
curl http://localhost:3002/api/status
```

### Check Backend API

```bash
# Get all jobs
curl http://localhost:8000/jobs

# Get all companies
curl http://localhost:8000/companies

# Get specific job
curl http://localhost:8000/jobs/{job-id}
```

## Data Flow

```
┌─────────────────────┐
│  Job Sources        │
│  - Indeed           │
│  - LinkedIn         │
│  - Adzuna           │
│  - Sprout           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Scraping Service   │
│  (Port 3002)        │
│  - Scrapes jobs     │
│  - Cleans data      │
│  - Stores in DB     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL DB      │
│  - jobs table       │
│  - companies table  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend API        │
│  (Port 8000)        │
│  - GET /jobs        │
│  - GET /companies   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Frontend App       │
│  (Port 5173)        │
│  - Job Matcher      │
│  - Swipe Interface  │
│  - Applications     │
└─────────────────────┘
```

## Features

### Job Matcher
- Displays real jobs from database
- Shows company logos and information
- Calculates compatibility scores
- Allows swiping (like/dislike)
- Tracks applications

### Job Details
- Full job description
- Requirements and responsibilities
- Salary information
- Location (remote/hybrid/onsite)
- Company details
- Apply button

### Filtering
- Filter by location
- Filter by job type
- Filter by experience level
- Filter by salary range
- Filter by remote/hybrid

## Troubleshooting

### No Jobs Showing

1. **Check if scraping service is running**
   ```bash
   curl http://localhost:3002/health
   ```

2. **Check if jobs exist in database**
   ```sql
   SELECT COUNT(*) FROM jobs WHERE status = 'active';
   ```

3. **Trigger manual scrape**
   ```bash
   curl -X POST http://localhost:3002/api/scrape
   ```

4. **Check backend API**
   ```bash
   curl http://localhost:8000/jobs
   ```

5. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for API errors
   - Check Network tab

### Scraping Fails

1. **Check database connection**
   - Verify `.env` in `scraping/` folder
   - Test connection: `psql -U azer -d battal_db`

2. **Check website accessibility**
   - Some sites may block automated scraping
   - Try different scraping methods (API, Cheerio, Browser)

3. **Review scraper logs**
   - Check console output
   - Look for error messages

### Backend API Errors

1. **Check PHP is running**
   ```bash
   php -v
   ```

2. **Check database connection**
   - Verify `.env` in `backend/` folder
   - Test connection from PHP

3. **Check CORS settings**
   - Backend should allow requests from frontend

## Customization

### Add More Job Sources

Edit `scraping/scraper.js` to add new scrapers:

```javascript
import NewSiteScraper from './newSiteScraper.js';

const newScraper = new NewSiteScraper();
const newJobs = await newScraper.scrape();
```

### Adjust Scraping Schedule

Edit `scraping/server.js`:

```javascript
// Change from hourly to every 6 hours
const cronSchedule = '0 */6 * * *';
```

### Customize Job Matching

Edit `src/hooks/useData.ts` in the `getJobMatches` function to adjust compatibility scoring.

## Next Steps

1. **Add more job sources** - Integrate additional job boards
2. **Improve matching algorithm** - Use AI/ML for better compatibility scores
3. **Add job alerts** - Notify users of new matching jobs
4. **Implement saved searches** - Let users save filter preferences
5. **Add company reviews** - Integrate Glassdoor or similar data

## Support

For issues or questions:
1. Check the logs in each service
2. Review the API documentation
3. Check database for data integrity
4. Verify all services are running
