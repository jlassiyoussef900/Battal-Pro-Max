import dotenv from 'dotenv';
import AdzunaScraper from './adzunaScraper.js';
import DatabaseHandler from './database.js';

dotenv.config();

async function main() {
  console.log('🚀 Starting Adzuna Job Scraper...\n');

  const scraper = new AdzunaScraper();
  const db = new DatabaseHandler();

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const connected = await db.testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Please check your .env configuration.');
      process.exit(1);
    }

    // Scrape jobs
    console.log('\n🔍 Scraping jobs from Adzuna API...');
    const keywords = process.env.ADZUNA_SEARCH_KEYWORDS || 'software developer';
    const location = process.env.ADZUNA_LOCATION || '';
    const jobs = await scraper.scrape(keywords, location, 5);

    if (jobs.length === 0) {
      console.log('⚠️  No jobs found. This might mean:');
      console.log('   - The API credentials are incorrect');
      console.log('   - The search parameters returned no results');
      console.log('\nPlease check your Adzuna credentials in .env file.');
      process.exit(0);
    }

    console.log(`✅ ${jobs.length} valid jobs found`);

    // Display sample job
    if (jobs.length > 0) {
      console.log('\n📋 Sample job:');
      console.log('─────────────────────────────────────');
      const sample = jobs[0];
      console.log(`Title: ${sample.title}`);
      console.log(`Company: ${sample.company.name}`);
      console.log(`Location: ${sample.city || sample.region || sample.country}`);
      console.log(`Type: ${sample.job_type}`);
      console.log(`Description: ${sample.description.substring(0, 100)}...`);
      console.log('─────────────────────────────────────\n');
    }

    // Save to database
    console.log('💾 Saving jobs to database...');
    const result = await db.saveJobs(jobs);

    // Display statistics
    console.log('\n📊 Final Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`Total scraped: ${jobs.length}`);
    console.log(`✅ Saved: ${result.saved}`);
    console.log(`⏭️  Skipped (duplicates): ${result.skipped}`);
    console.log(`❌ Errors: ${result.errors}`);
    console.log('═══════════════════════════════════════\n');

    // Get overall stats
    const stats = await db.getStats();
    console.log('📈 Database Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`Total jobs: ${stats.total_jobs}`);
    console.log(`Total companies: ${stats.total_companies}`);
    console.log(`Jobs added today: ${stats.jobs_today}`);
    console.log(`Jobs added this week: ${stats.jobs_this_week}`);
    console.log('═══════════════════════════════════════\n');

    // Close database connection
    await db.close();

    console.log('✅ Scraping completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    await db.close();
    process.exit(1);
  }
}

// Run the scraper
main();
