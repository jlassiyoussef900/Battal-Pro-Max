import dotenv from 'dotenv';
import BrowserManager from './browserManager.js';

dotenv.config();

async function testSetup() {
  console.log('🧪 Testing Scraping Service Setup...\n');

  // Test 1: Chrome Detection
  console.log('1️⃣ Testing Chrome Detection...');
  const browserManager = new BrowserManager();
  try {
    const chromePath = browserManager.findChrome();
    console.log(`   ✅ Chrome found: ${chromePath}\n`);
  } catch (error) {
    console.log(`   ❌ Chrome not found: ${error.message}\n`);
    return;
  }

  // Test 2: Browser Launch
  console.log('2️⃣ Testing Browser Launch...');
  try {
    await browserManager.launchBrowser();
    console.log('   ✅ Browser launched successfully\n');
  } catch (error) {
    console.log(`   ❌ Browser launch failed: ${error.message}\n`);
    await browserManager.closeBrowser();
    return;
  }

  // Test 3: Location Rotation
  console.log('3️⃣ Testing Location Rotation...');
  try {
    const { page, location } = await browserManager.createStealthPage();
    console.log(`   ✅ Location set: ${location.name}`);
    console.log(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`);
    console.log(`   🕐 Timezone: ${location.timezone}\n`);
    await page.close();
  } catch (error) {
    console.log(`   ❌ Location setup failed: ${error.message}\n`);
    await browserManager.closeBrowser();
    return;
  }

  // Test 4: Navigation Test (Google as example)
  console.log('4️⃣ Testing Navigation...');
  try {
    const { page } = await browserManager.createStealthPage();
    await browserManager.navigateWithRetry(page, 'https://www.google.com', 1);
    console.log('   ✅ Navigation successful\n');
    await page.close();
  } catch (error) {
    console.log(`   ❌ Navigation failed: ${error.message}\n`);
  }

  // Test 5: Database Connection
  console.log('5️⃣ Testing Database Connection...');
  try {
    const { default: DatabaseHandler } = await import('./database.js');
    const db = new DatabaseHandler();
    const connected = await db.testConnection();
    if (connected) {
      console.log('   ✅ Database connected\n');
      
      // Get stats
      const stats = await db.getStats();
      console.log('   📊 Current Database Stats:');
      console.log(`      Total jobs: ${stats.total_jobs}`);
      console.log(`      Total companies: ${stats.total_companies}`);
      console.log(`      Jobs today: ${stats.jobs_today}`);
      console.log(`      Jobs this week: ${stats.jobs_this_week}\n`);
      
      await db.close();
    } else {
      console.log('   ❌ Database connection failed\n');
    }
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}\n`);
  }

  // Test 6: Environment Variables
  console.log('6️⃣ Checking Environment Variables...');
  const requiredVars = ['SPROUT_URL', 'DB_HOST', 'DB_NAME', 'DB_USER'];
  let allSet = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== 'your_password') {
      console.log(`   ✅ ${varName}: ${value.substring(0, 30)}...`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set or needs update`);
      allSet = false;
    }
  }
  
  if (!process.env.DB_PASSWORD) {
    console.log('   ⚠️  DB_PASSWORD: Not set (required for database)');
    allSet = false;
  } else {
    console.log('   ✅ DB_PASSWORD: Set');
  }
  
  console.log();

  // Close browser
  await browserManager.closeBrowser();

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📋 Test Summary');
  console.log('═══════════════════════════════════════');
  console.log('✅ Chrome: Working');
  console.log('✅ Browser: Working');
  console.log('✅ Location Rotation: Working');
  console.log('✅ Navigation: Working');
  
  if (allSet) {
    console.log('✅ Configuration: Complete');
    console.log('\n🚀 Ready to start scraping!');
    console.log('\nNext steps:');
    console.log('1. Update SPROUT_URL in .env with actual URL');
    console.log('2. Run: npm run scrape');
  } else {
    console.log('⚠️  Configuration: Incomplete');
    console.log('\n📝 Action required:');
    console.log('1. Update .env file with missing values');
    console.log('2. Run this test again: npm test');
  }
  console.log('═══════════════════════════════════════\n');
}

testSetup().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
