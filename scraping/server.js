import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import IndeedScraper from './indeedScraper.js';
import DatabaseHandler from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize services
const scraper = new IndeedScraper();
const db = new DatabaseHandler();

// Middleware
app.use(cors());
app.use(express.json());

// Store scraping status
let scrapingStatus = {
  isRunning: false,
  lastRun: null,
  lastResult: null,
  nextRun: null
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Job Scraping Service',
    scraping: scrapingStatus
  });
});

// Manual scrape endpoint
app.post('/api/scrape', async (req, res) => {
  if (scrapingStatus.isRunning) {
    return res.status(409).json({ 
      error: 'Scraping already in progress',
      status: scrapingStatus
    });
  }

  try {
    scrapingStatus.isRunning = true;
    scrapingStatus.lastRun = new Date().toISOString();

    console.log('\n🚀 Manual scraping triggered...');
    
    // Scrape jobs
    const jobs = await scraper.scrape();
    const cleanedJobs = scraper.cleanJobs(jobs);

    // Save to database
    const result = await db.saveJobs(cleanedJobs);

    scrapingStatus.isRunning = false;
    scrapingStatus.lastResult = {
      scraped: cleanedJobs.length,
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Scraping completed',
      result: scrapingStatus.lastResult
    });

  } catch (error) {
    scrapingStatus.isRunning = false;
    console.error('❌ Scraping error:', error);
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message
    });
  }
});

// Get recent jobs endpoint
app.get('/api/jobs/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const jobs = await db.getRecentJobs(limit);
    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

// Get scraping statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      success: true,
      stats: stats,
      scrapingStatus: scrapingStatus
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// Get scraping status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: scrapingStatus
  });
});

// Automated scraping function
async function runScheduledScraping() {
  if (scrapingStatus.isRunning) {
    console.log('⏭️  Skipping scheduled scraping - already in progress');
    return;
  }

  try {
    scrapingStatus.isRunning = true;
    scrapingStatus.lastRun = new Date().toISOString();

    console.log('\n⏰ Scheduled scraping started...');
    
    // Scrape jobs
    const jobs = await scraper.scrape();
    const cleanedJobs = scraper.cleanJobs(jobs);

    // Save to database
    const result = await db.saveJobs(cleanedJobs);

    scrapingStatus.isRunning = false;
    scrapingStatus.lastResult = {
      scraped: cleanedJobs.length,
      saved: result.saved,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Scheduled scraping completed');

  } catch (error) {
    scrapingStatus.isRunning = false;
    console.error('❌ Scheduled scraping error:', error);
  }
}

// Setup cron job for automated scraping
// Default: Every hour
const cronSchedule = process.env.CRON_SCHEDULE || '0 * * * *';
cron.schedule(cronSchedule, () => {
  console.log('\n⏰ Cron job triggered');
  runScheduledScraping();
});

// Calculate next run time
function calculateNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 1);
  next.setMinutes(0);
  next.setSeconds(0);
  return next.toISOString();
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🤖 Job Scraping Service running on port ${PORT}`);
  console.log(`📝 Endpoints:`);
  console.log(`   - POST /api/scrape (manual trigger)`);
  console.log(`   - GET /api/jobs/recent`);
  console.log(`   - GET /api/stats`);
  console.log(`   - GET /api/status`);
  console.log(`   - GET /health`);
  console.log(`\n⏰ Automated scraping: ${cronSchedule}`);
  
  // Test database connection
  const dbConnected = await db.testConnection();
  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Check your .env configuration.');
  }

  scrapingStatus.nextRun = calculateNextRun();
  console.log(`📅 Next scheduled run: ${scrapingStatus.nextRun}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await db.close();
  process.exit(0);
});
