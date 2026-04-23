# Quick Start Guide - Job Matcher with Scraped Jobs

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Setup
```bash
verify-setup.bat
```

This will check:
- ✅ Database connection
- ✅ Jobs in database
- ✅ Companies in database
- ✅ Backend API
- ✅ Dependencies
- ✅ Configuration files

### Step 2: Add Jobs (If Needed)

If verification shows no jobs, run:
```bash
trigger-scrape.bat
```

This will scrape jobs from multiple sources and add them to the database.

### Step 3: Start All Services
```bash
start-all.bat
```

This starts:
- Backend API (Port 8000)
- AI Service (Port 3001)
- Scraping Service (Port 3002)
- Frontend App (Port 5173)

### Step 4: Open the App

Open your browser and go to:
```
http://localhost:5173
```

### Step 5: Login or Register

Use the test account or create a new one:
- Email: `alex@example.com`
- Password: `password`

### Step 6: Start Swiping!

Navigate to the Job Matcher and start swiping through real jobs!

## 📊 What You'll See

### Job Cards Display:
- ✅ Real job titles and descriptions
- ✅ Company names and logos
- ✅ Salary ranges
- ✅ Location (Remote/Hybrid/Onsite)
- ✅ Required skills
- ✅ Experience level
- ✅ Compatibility score

### Actions Available:
- ❤️ Swipe Right - Like the job
- ❌ Swipe Left - Pass on the job
- ↩️ Undo - Undo last swipe
- 📋 View Details - See full job description
- 📝 Apply - Submit application

## 🔧 Troubleshooting

### No Jobs Showing?

**Quick Fix:**
```bash
# 1. Check if jobs exist
psql -U azer -d battal_db -c "SELECT COUNT(*) FROM jobs;"

# 2. If zero, trigger scraping
trigger-scrape.bat

# 3. Restart frontend
# Close the frontend window and run: npm run dev
```

### Backend Not Working?

**Quick Fix:**
```bash
# Check if backend is running
curl http://127.0.0.1:8000/jobs

# If not, start it
start-backend.bat
```

### Scraping Service Issues?

**Quick Fix:**
```bash
# Check service status
curl http://localhost:3002/health

# If not running, start it
cd scraping
npm start
```

## 📁 Project Structure

```
app/
├── backend/          # PHP API (Port 8000)
├── scraping/         # Job scraper (Port 3002)
├── ai/              # AI service (Port 3001)
├── src/             # Frontend React app
│   ├── sections/
│   │   └── JobMatcher.tsx    # Main job swiping interface
│   ├── hooks/
│   │   └── useData.ts        # Data fetching logic
│   └── lib/
│       └── auth.ts           # API calls
└── start-all.bat    # Start everything
```

## 🎯 Key Features

### 1. Real Job Data
- Jobs scraped from Indeed, LinkedIn, Adzuna, Sprout
- Automatically updated every hour
- Stored in PostgreSQL database

### 2. Smart Matching
- Compatibility scores based on your skills
- Filter by location, salary, experience
- Personalized recommendations

### 3. Tinder-Style Interface
- Swipe right to like
- Swipe left to pass
- Undo last action
- View liked jobs
- Apply with one click

### 4. Company Information
- Company logos and descriptions
- Industry and size
- Benefits and culture

## 📝 Common Commands

### Start Services
```bash
start-all.bat              # Start everything
start-backend.bat          # Start backend only
cd scraping && npm start   # Start scraper only
npm run dev                # Start frontend only
```

### Trigger Scraping
```bash
trigger-scrape.bat         # Manual scrape
```

### Verify Setup
```bash
verify-setup.bat           # Check system status
```

### Database Queries
```bash
# Connect to database
psql -U azer -d battal_db

# View jobs
SELECT title, company_id FROM jobs LIMIT 10;

# View companies
SELECT name FROM companies;

# Count jobs
SELECT COUNT(*) FROM jobs WHERE status='active';
```

## 🔄 Data Flow

```
Job Sources → Scraper → Database → Backend API → Frontend
(Indeed,      (Port     (Postgres) (Port 8000)   (Port 5173)
LinkedIn,     3002)
etc.)
```

## 📚 Documentation

- `SCRAPED_JOBS_INTEGRATION.md` - Complete integration guide
- `SCRAPED_JOBS_SUMMARY.md` - Summary of changes
- `scraping/README.md` - Scraping service docs
- `scraping/SCRAPING_COMPLETE.md` - Implementation details

## 🆘 Need Help?

1. Run `verify-setup.bat` to diagnose issues
2. Check service logs in terminal windows
3. Review documentation files
4. Check database for data: `psql -U azer -d battal_db`

## ✨ Tips

1. **First Time Setup**: Run `trigger-scrape.bat` to populate jobs
2. **Regular Updates**: Scraper runs automatically every hour
3. **Manual Refresh**: Trigger scraping anytime with `trigger-scrape.bat`
4. **View Logs**: Keep terminal windows open to see service logs
5. **Database Access**: Use pgAdmin or psql for direct database access

## 🎉 You're Ready!

The app is now configured to use real scraped jobs. Start swiping and find your dream job!

```bash
# Quick start command
start-all.bat
```

Then open: http://localhost:5173

Happy job hunting! 🚀
