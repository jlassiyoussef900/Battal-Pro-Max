import puppeteer from 'puppeteer-core';

class BrowserManager {
  constructor() {
    this.browser = null;
    this.currentLocationIndex = 0;
    
    // Chrome executable paths for Windows
    this.chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH || ''
    ].filter(Boolean);
    
    // List of locations to rotate through
    this.locations = [
      {
        name: 'New York, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        locale: 'en-US'
      },
      {
        name: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
        locale: 'en-GB'
      },
      {
        name: 'San Francisco, USA',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        locale: 'en-US'
      },
      {
        name: 'Toronto, Canada',
        latitude: 43.6532,
        longitude: -79.3832,
        timezone: 'America/Toronto',
        locale: 'en-CA'
      },
      {
        name: 'Sydney, Australia',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 'Australia/Sydney',
        locale: 'en-AU'
      },
      {
        name: 'Berlin, Germany',
        latitude: 52.5200,
        longitude: 13.4050,
        timezone: 'Europe/Berlin',
        locale: 'de-DE'
      },
      {
        name: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        locale: 'fr-FR'
      },
      {
        name: 'Tokyo, Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
        locale: 'ja-JP'
      },
      {
        name: 'Singapore',
        latitude: 1.3521,
        longitude: 103.8198,
        timezone: 'Asia/Singapore',
        locale: 'en-SG'
      },
      {
        name: 'Dubai, UAE',
        latitude: 25.2048,
        longitude: 55.2708,
        timezone: 'Asia/Dubai',
        locale: 'ar-AE'
      }
    ];

    // List of user agents to rotate through
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];

    // Screen resolutions to rotate
    this.screenResolutions = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 },
      { width: 2560, height: 1440 },
      { width: 1280, height: 720 }
    ];
  }

  /**
   * Get next location in rotation
   */
  getNextLocation() {
    const location = this.locations[this.currentLocationIndex];
    this.currentLocationIndex = (this.currentLocationIndex + 1) % this.locations.length;
    return location;
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Get random screen resolution
   */
  getRandomResolution() {
    return this.screenResolutions[Math.floor(Math.random() * this.screenResolutions.length)];
  }

  /**
   * Find Chrome executable
   */
  findChrome() {
    const fs = require('fs');
    for (const path of this.chromePaths) {
      try {
        if (fs.existsSync(path)) {
          console.log(`✅ Found Chrome at: ${path}`);
          return path;
        }
      } catch (error) {
        // Continue to next path
      }
    }
    throw new Error('Chrome not found. Please install Chrome or set CHROME_PATH environment variable.');
  }

  /**
   * Launch browser with advanced stealth settings
   */
  async launchBrowser() {
    console.log('🚀 Launching headless browser with stealth mode...');

    const executablePath = this.findChrome();

    this.browser = await puppeteer.launch({
      executablePath,
      headless: false, // Use visible browser to avoid detection
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--start-maximized',
        '--disable-infobars',
        '--disable-notifications',
        '--disable-popup-blocking',
        '--disable-save-password-bubble',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-extensions-except',
        '--disable-default-apps'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: null
    });

    console.log('✅ Browser launched successfully');
    return this.browser;
  }

  /**
   * Create a new page with location and stealth settings
   */
  async createStealthPage() {
    if (!this.browser) {
      await this.launchBrowser();
    }

    const page = await this.browser.newPage();
    const location = this.getNextLocation();
    const userAgent = this.getRandomUserAgent();
    const resolution = this.getRandomResolution();

    console.log(`📍 Setting location: ${location.name}`);
    console.log(`🖥️  Resolution: ${resolution.width}x${resolution.height}`);

    // Set user agent
    await page.setUserAgent(userAgent);

    // Set viewport
    await page.setViewport({
      width: resolution.width,
      height: resolution.height,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false
    });

    // Set geolocation
    await page.setGeolocation({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: 100
    });

    // Set timezone
    await page.emulateTimezone(location.timezone);

    // Set locale
    await page.setExtraHTTPHeaders({
      'Accept-Language': location.locale
    });

    // Inject advanced stealth scripts to avoid detection
    await page.evaluateOnNewDocument(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      // Override the navigator.plugins property
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format"},
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          },
          {
            0: {type: "application/pdf", suffixes: "pdf", description: ""},
            description: "",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            length: 1,
            name: "Chrome PDF Viewer"
          },
          {
            0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable"},
            1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable"},
            description: "",
            filename: "internal-nacl-plugin",
            length: 2,
            name: "Native Client"
          }
        ]
      });

      // Override the navigator.languages property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });

      // Override chrome property
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Mock battery API
      Object.defineProperty(navigator, 'getBattery', {
        get: () => () => Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        })
      });

      // Override connection property
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: 50,
          downlink: 10,
          saveData: false
        })
      });

      // Override hardwareConcurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8
      });

      // Override deviceMemory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8
      });

      // Override platform
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32'
      });

      // Override vendor
      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.'
      });

      // Add missing window properties
      window.outerWidth = window.innerWidth;
      window.outerHeight = window.innerHeight;

      // Override toString methods
      const originalToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        if (this === navigator.permissions.query) {
          return 'function query() { [native code] }';
        }
        return originalToString.call(this);
      };
    });

    // Add extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': location.locale,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    });

    // Add random delays to mimic human behavior
    await this.addRandomDelay(1000, 3000);

    return { page, location };
  }

  /**
   * Navigate to URL with retry logic
   */
  async navigateWithRetry(page, url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🌐 Navigating to ${url} (attempt ${i + 1}/${maxRetries})...`);
        
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });

        console.log('✅ Navigation successful');
        return true;

      } catch (error) {
        console.error(`❌ Navigation failed (attempt ${i + 1}): ${error.message}`);
        
        if (i < maxRetries - 1) {
          console.log('⏳ Retrying in 5 seconds...');
          await this.addRandomDelay(5000, 7000);
        }
      }
    }

    throw new Error('Failed to navigate after multiple retries');
  }

  /**
   * Scroll page to load dynamic content
   */
  async scrollPage(page) {
    console.log('📜 Scrolling page to load dynamic content...');

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await this.addRandomDelay(1000, 2000);
  }

  /**
   * Wait for selector with timeout
   */
  async waitForSelector(page, selector, timeout = 10000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⚠️  Selector not found: ${selector}`);
      return false;
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(page, filename = 'screenshot.png') {
    try {
      await page.screenshot({ 
        path: filename,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error.message);
    }
  }

  /**
   * Add random delay to mimic human behavior
   */
  async addRandomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Extract text safely
   */
  async extractText(page, selector) {
    try {
      return await page.$eval(selector, el => el.textContent?.trim() || '');
    } catch (error) {
      return '';
    }
  }

  /**
   * Extract attribute safely
   */
  async extractAttribute(page, selector, attribute) {
    try {
      return await page.$eval(selector, (el, attr) => el.getAttribute(attr) || '', attribute);
    } catch (error) {
      return '';
    }
  }

  /**
   * Click element with retry
   */
  async clickElement(page, selector, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.click(selector);
        await this.addRandomDelay(500, 1500);
        return true;
      } catch (error) {
        if (i < maxRetries - 1) {
          await this.addRandomDelay(1000, 2000);
        }
      }
    }
    return false;
  }

  /**
   * Type text with human-like speed
   */
  async typeText(page, selector, text) {
    await page.click(selector);
    await page.type(selector, text, { delay: 100 + Math.random() * 100 });
    await this.addRandomDelay(500, 1000);
  }

  /**
   * Get current location info
   */
  getCurrentLocation() {
    const index = (this.currentLocationIndex - 1 + this.locations.length) % this.locations.length;
    return this.locations[index];
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      console.log('🔌 Closing browser...');
      await this.browser.close();
      this.browser = null;
      console.log('✅ Browser closed');
    }
  }

  /**
   * Get browser status
   */
  isRunning() {
    return this.browser !== null;
  }
}

export default BrowserManager;
