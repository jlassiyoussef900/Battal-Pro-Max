import BrowserManager from './browserManager.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

class SproutScraper {
  constructor(config = {}) {
    this.sproutUrl = config.sproutUrl || process.env.SPROUT_URL;
    this.sproutApiUrl = config.sproutApiUrl || process.env.SPROUT_API_URL;
    this.browserManager = new BrowserManager();
  }

  /**
   * Scrape jobs from Sprout using headless browser with location rotation
   */
  async scrapeWithBrowser() {
    console.log('🚀 Starting Sprout scraping with headless browser...');
    
    try {
      // Create stealth page with rotated location
      const { page, location } = await this.browserManager.createStealthPage();
      console.log(`🌍 Scraping from: ${location.name}`);

      // Navigate to Sprout careers page
      await this.browserManager.navigateWithRetry(page, this.sproutUrl);

      // Scroll to load dynamic content
      await this.browserManager.scrollPage(page);

      // Wait for job listings to load
      const selectors = [
        '.job-listing',
        '.job-card',
        '[data-job]',
        '.career-item',
        'article',
        '.position',
        '.opening'
      ];

      let selectorFound = false;
      for (const selector of selectors) {
        const found = await this.browserManager.waitForSelector(page, selector, 5000);
        if (found) {
          console.log(`✅ Found jobs using selector: ${selector}`);
          selectorFound = true;
          break;
        }
      }

      if (!selectorFound) {
        console.log('⚠️  No standard job selectors found, extracting all content...');
        // Take screenshot for debugging
        await this.browserManager.takeScreenshot(page, 'sprout-page.png');
      }

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll(
          '.job-listing, .job-card, [data-job], .career-item, article, .position, .opening'
        );
        const extractedJobs = [];

        jobElements.forEach((element) => {
          try {
            // Try multiple selectors for each field
            const titleSelectors = ['h2', 'h3', '.job-title', '[class*="title"]', '.position-title'];
            const locationSelectors = ['.location', '[class*="location"]', '.job-location'];
            const descriptionSelectors = ['.description', '[class*="description"]', 'p', '.job-description'];
            const typeSelectors = ['.job-type', '[class*="type"]', '.employment-type'];
            const salarySelectors = ['.salary', '[class*="salary"]', '.compensation'];
            const dateSelectors = ['.date', '[class*="date"]', '.posted-date', 'time'];

            const getFirstMatch = (selectors) => {
              for (const selector of selectors) {
                const el = element.querySelector(selector);
                if (el && el.textContent.trim()) {
                  return el.textContent.trim();
                }
              }
              return '';
            };

            const job = {
              title: getFirstMatch(titleSelectors),
              company: 'Sprout',
              location: getFirstMatch(locationSelectors) || 'Remote',
              description: getFirstMatch(descriptionSelectors),
              jobType: getFirstMatch(typeSelectors) || 'Full-time',
              salary: getFirstMatch(salarySelectors),
              url: element.querySelector('a')?.href || window.location.href,
              postedDate: getFirstMatch(dateSelectors) || new Date().toISOString(),
              requirements: [],
              benefits: [],
              skills: []
            };

            // Extract requirements
            const reqElements = element.querySelectorAll(
              '.requirement, [class*="requirement"] li, .qualifications li, [class*="qualification"] li'
            );
            reqElements.forEach(req => {
              const text = req.textContent.trim();
              if (text && text.length > 5) {
                job.requirements.push(text);
              }
            });

            // Extract benefits
            const benefitElements = element.querySelectorAll(
              '.benefit, [class*="benefit"] li, .perks li, [class*="perk"] li'
            );
            benefitElements.forEach(benefit => {
              const text = benefit.textContent.trim();
              if (text && text.length > 5) {
                job.benefits.push(text);
              }
            });

            // Extract skills
            const skillElements = element.querySelectorAll(
              '.skill, [class*="skill"] li, .technology li, [class*="tech"] li'
            );
            skillElements.forEach(skill => {
              const text = skill.textContent.trim();
              if (text && text.length > 1) {
                job.skills.push(text);
              }
            });

            // Only add if has a title
            if (job.title && job.title.length > 3) {
              extractedJobs.push(job);
            }
          } catch (error) {
            console.error('Error extracting job:', error);
          }
        });

        return extractedJobs;
      });

      console.log(`✅ Found ${jobs.length} jobs from Sprout`);
      
      // Add location metadata
      jobs.forEach(job => {
        job.scrapedFrom = location.name;
        job.scrapedAt = new Date().toISOString();
      });

      return jobs;

    } catch (error) {
      console.error('❌ Error scraping Sprout:', error.message);
      throw error;
    }
  }

  /**
   * Scrape jobs using Axios + Cheerio (for static content)
   */
  async scrapeWithCheerio() {
    console.log('🚀 Starting Sprout scraping with Cheerio...');

    try {
      const userAgent = this.browserManager.getRandomUserAgent();
      
      const response = await axios.get(this.sproutUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Try multiple selectors to find job listings
      const selectors = [
        '.job-listing',
        '.job-card',
        '[data-job]',
        '.career-item',
        'article',
        '.position',
        '.opening'
      ];

      let jobElements = $();
      for (const selector of selectors) {
        jobElements = $(selector);
        if (jobElements.length > 0) {
          console.log(`✅ Found jobs using selector: ${selector}`);
          break;
        }
      }

      jobElements.each((index, element) => {
        try {
          const $el = $(element);
          
          const job = {
            title: $el.find('h2, h3, .job-title, [class*="title"]').first().text().trim(),
            company: 'Sprout',
            location: $el.find('.location, [class*="location"]').first().text().trim() || 'Remote',
            description: $el.find('.description, [class*="description"], p').first().text().trim(),
            jobType: $el.find('.job-type, [class*="type"]').first().text().trim() || 'Full-time',
            salary: $el.find('.salary, [class*="salary"]').first().text().trim() || '',
            url: $el.find('a').first().attr('href') || this.sproutUrl,
            postedDate: $el.find('.date, [class*="date"]').first().text().trim() || new Date().toISOString(),
            requirements: [],
            benefits: [],
            skills: []
          };

          // Make URL absolute if relative
          if (job.url && !job.url.startsWith('http')) {
            const baseUrl = new URL(this.sproutUrl);
            job.url = new URL(job.url, baseUrl.origin).href;
          }

          // Extract requirements
          $el.find('.requirement, [class*="requirement"] li').each((i, req) => {
            const text = $(req).text().trim();
            if (text) job.requirements.push(text);
          });

          // Extract benefits
          $el.find('.benefit, [class*="benefit"] li').each((i, benefit) => {
            const text = $(benefit).text().trim();
            if (text) job.benefits.push(text);
          });

          // Extract skills
          $el.find('.skill, [class*="skill"] li').each((i, skill) => {
            const text = $(skill).text().trim();
            if (text) job.skills.push(text);
          });

          if (job.title) {
            jobs.push(job);
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });

      console.log(`✅ Found ${jobs.length} jobs from Sprout`);
      return jobs;

    } catch (error) {
      console.error('❌ Error scraping Sprout with Cheerio:', error.message);
      throw error;
    }
  }

  /**
   * Try to scrape from Sprout API if available
   */
  async scrapeFromAPI() {
    if (!this.sproutApiUrl) {
      console.log('⚠️  No Sprout API URL configured');
      return [];
    }

    console.log('🚀 Attempting to fetch jobs from Sprout API...');

    try {
      const response = await axios.get(this.sproutApiUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
        timeout: 30000
      });

      const jobs = response.data.jobs || response.data.data || response.data;
      
      if (Array.isArray(jobs)) {
        console.log(`✅ Found ${jobs.length} jobs from Sprout API`);
        return jobs.map(job => this.normalizeJob(job));
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching from Sprout API:', error.message);
      return [];
    }
  }

  /**
   * Normalize job data to consistent format
   */
  normalizeJob(job) {
    return {
      title: job.title || job.position || job.name || '',
      company: job.company || 'Sprout',
      location: job.location || job.city || job.office || 'Remote',
      description: job.description || job.summary || '',
      jobType: job.jobType || job.type || job.employment_type || 'Full-time',
      salary: job.salary || job.compensation || job.pay || '',
      url: job.url || job.link || job.apply_url || '',
      postedDate: job.postedDate || job.posted_at || job.created_at || new Date().toISOString(),
      requirements: job.requirements || job.qualifications || [],
      benefits: job.benefits || job.perks || [],
      experienceLevel: job.experienceLevel || job.experience || job.seniority || '',
      remote: job.remote || job.is_remote || false,
      skills: job.skills || job.required_skills || []
    };
  }

  /**
   * Main scraping method - tries multiple approaches
   */
  async scrape() {
    console.log('🔍 Starting Sprout job scraping...');
    console.log(`🌍 Location rotation enabled - ${this.browserManager.locations.length} locations available`);
    
    let jobs = [];

    // Try API first (fastest)
    try {
      jobs = await this.scrapeFromAPI();
      if (jobs.length > 0) {
        await this.browserManager.closeBrowser();
        return jobs;
      }
    } catch (error) {
      console.log('API scraping failed, trying other methods...');
    }

    // Try Cheerio (faster, less resource intensive)
    try {
      jobs = await this.scrapeWithCheerio();
      if (jobs.length > 0) {
        await this.browserManager.closeBrowser();
        return jobs;
      }
    } catch (error) {
      console.log('Cheerio scraping failed, trying headless browser...');
    }

    // Try headless browser with location rotation (most reliable)
    try {
      jobs = await this.scrapeWithBrowser();
      return jobs;
    } catch (error) {
      console.error('All scraping methods failed:', error);
      return [];
    } finally {
      await this.browserManager.closeBrowser();
    }
  }

  /**
   * Clean and validate scraped data
   */
  cleanJobs(jobs) {
    return jobs.filter(job => {
      // Must have at least a title
      if (!job.title || job.title.length < 3) return false;
      
      // Remove duplicates based on title and company
      return true;
    }).map(job => ({
      ...job,
      title: job.title.trim(),
      company: job.company.trim(),
      location: job.location.trim(),
      description: job.description.trim().substring(0, 5000), // Limit description length
      scrapedAt: new Date().toISOString(),
      source: 'Sprout'
    }));
  }
}

export default SproutScraper;
