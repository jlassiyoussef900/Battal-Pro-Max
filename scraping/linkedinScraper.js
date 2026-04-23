import BrowserManager from './browserManager.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

class LinkedInScraper {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.LINKEDIN_JOBS_URL || 'https://www.linkedin.com/jobs/search/';
    this.keywords = config.keywords || process.env.LINKEDIN_SEARCH_KEYWORDS || 'software developer';
    this.location = config.location || process.env.LINKEDIN_LOCATION || 'United States';
    this.browserManager = new BrowserManager();
  }

  /**
   * Build LinkedIn search URL
   */
  buildSearchUrl(keywords, location, start = 0) {
    const params = new URLSearchParams({
      keywords: keywords,
      location: location,
      start: start.toString(),
      f_TPR: 'r604800', // Past week
      position: '1',
      pageNum: '0'
    });
    
    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Scrape jobs from LinkedIn using headless browser
   */
  async scrapeWithBrowser() {
    console.log('🚀 Starting LinkedIn scraping with headless browser...');
    
    try {
      const { page, location } = await this.browserManager.createStealthPage();
      console.log(`🌍 Scraping from: ${location.name}`);

      const searchUrl = this.buildSearchUrl(this.keywords, this.location);
      console.log(`🔍 Search URL: ${searchUrl}`);

      await this.browserManager.navigateWithRetry(page, searchUrl);
      
      // Wait for job listings to load
      await this.browserManager.addRandomDelay(3000, 5000);
      
      // Scroll to load more jobs
      await this.browserManager.scrollPage(page);
      
      // Wait for job cards
      const found = await this.browserManager.waitForSelector(page, '.job-search-card, .jobs-search__results-list li, .base-card', 15000);
      
      if (!found) {
        console.log('⚠️  No job cards found, taking screenshot...');
        await this.browserManager.takeScreenshot(page, 'linkedin-page.png');
      }

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job-search-card, .base-card, .jobs-search__results-list li');
        const extractedJobs = [];

        jobCards.forEach((card) => {
          try {
            // Extract job title
            const titleEl = card.querySelector('h3, .base-search-card__title, .job-search-card__title');
            const title = titleEl?.textContent?.trim() || '';

            // Extract company
            const companyEl = card.querySelector('h4, .base-search-card__subtitle, .job-search-card__company-name, a[data-tracking-control-name*="company"]');
            const company = companyEl?.textContent?.trim() || '';

            // Extract location
            const locationEl = card.querySelector('.job-search-card__location, .base-search-card__metadata span');
            const location = locationEl?.textContent?.trim() || '';

            // Extract job link
            const linkEl = card.querySelector('a[href*="/jobs/view/"]');
            const url = linkEl?.href || '';

            // Extract job ID from URL
            const jobIdMatch = url.match(/\/jobs\/view\/(\d+)/);
            const jobId = jobIdMatch ? jobIdMatch[1] : '';

            // Extract posted date
            const dateEl = card.querySelector('time, .job-search-card__listdate');
            const postedDate = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '';

            // Extract description preview
            const descEl = card.querySelector('.base-search-card__snippet, .job-search-card__snippet');
            const description = descEl?.textContent?.trim() || '';

            // Extract industry/company info if available
            const industryEl = card.querySelector('.job-search-card__industry');
            const industry = industryEl?.textContent?.trim() || '';

            if (title && company) {
              extractedJobs.push({
                title,
                company,
                location,
                description,
                url,
                jobId,
                postedDate: postedDate || new Date().toISOString(),
                source: 'LinkedIn',
                jobType: 'Full-time',
                requirements: [],
                responsibilities: [],
                benefits: [],
                skills: [],
                industry: industry || null,
                remote: location?.toLowerCase().includes('remote') || false,
                hybrid: location?.toLowerCase().includes('hybrid') || false
              });
            }
          } catch (error) {
            console.error('Error extracting job:', error);
          }
        });

        return extractedJobs;
      });

      console.log(`✅ Found ${jobs.length} jobs from LinkedIn`);
      
      // Add metadata
      jobs.forEach(job => {
        job.scrapedFrom = location.name;
        job.scrapedAt = new Date().toISOString();
      });

      return jobs;

    } catch (error) {
      console.error('❌ Error scraping LinkedIn:', error.message);
      throw error;
    }
  }

  /**
   * Scrape job details from individual job page
   */
  async scrapeJobDetails(jobUrl) {
    try {
      const { page } = await this.browserManager.createStealthPage();
      
      await this.browserManager.navigateWithRetry(page, jobUrl);
      await this.browserManager.addRandomDelay(2000, 4000);

      const details = await page.evaluate(() => {
        const getTextContent = (selector) => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || '';
        };

        return {
          description: getTextContent('.description__text, .show-more-less-html__markup'),
          seniority: getTextContent('.description__job-criteria-item:has(.description__job-criteria-subheader:contains("Seniority level"))'),
          employmentType: getTextContent('.description__job-criteria-item:has(.description__job-criteria-subheader:contains("Employment type"))'),
          jobFunction: getTextContent('.description__job-criteria-item:has(.description__job-criteria-subheader:contains("Job function"))'),
          industries: getTextContent('.description__job-criteria-item:has(.description__job-criteria-subheader:contains("Industries"))')
        };
      });

      await page.close();
      return details;

    } catch (error) {
      console.error('Error scraping job details:', error.message);
      return null;
    }
  }

  /**
   * Scrape using Cheerio (fallback method)
   */
  async scrapeWithCheerio() {
    console.log('🚀 Starting LinkedIn scraping with Cheerio...');

    try {
      const userAgent = this.browserManager.getRandomUserAgent();
      const searchUrl = this.buildSearchUrl(this.keywords, this.location);
      
      const response = await axios.get(searchUrl, {
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

      $('.job-search-card, .base-card').each((index, element) => {
        try {
          const $el = $(element);
          
          const job = {
            title: $el.find('h3, .base-search-card__title').first().text().trim(),
            company: $el.find('h4, .base-search-card__subtitle').first().text().trim(),
            location: $el.find('.job-search-card__location').first().text().trim() || 'Remote',
            description: $el.find('.base-search-card__snippet').first().text().trim(),
            url: $el.find('a[href*="/jobs/view/"]').first().attr('href') || '',
            postedDate: $el.find('time').first().attr('datetime') || new Date().toISOString(),
            source: 'LinkedIn',
            jobType: 'Full-time',
            requirements: [],
            responsibilities: [],
            benefits: [],
            skills: [],
            industry: null,
            remote: false,
            hybrid: false
          };

          // Make URL absolute
          if (job.url && !job.url.startsWith('http')) {
            job.url = `https://www.linkedin.com${job.url}`;
          }

          if (job.title && job.company) {
            jobs.push(job);
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });

      console.log(`✅ Found ${jobs.length} jobs from LinkedIn`);
      return jobs;

    } catch (error) {
      console.error('❌ Error scraping LinkedIn with Cheerio:', error.message);
      throw error;
    }
  }

  /**
   * Main scraping method
   */
  async scrape() {
    console.log('🔍 Starting LinkedIn job scraping...');
    console.log(`📝 Keywords: ${this.keywords}`);
    console.log(`📍 Location: ${this.location}`);
    console.log(`🌍 Location rotation enabled - ${this.browserManager.locations.length} locations available\n`);
    
    let jobs = [];

    // Try browser scraping (most reliable for LinkedIn)
    try {
      jobs = await this.scrapeWithBrowser();
      return jobs;
    } catch (error) {
      console.log('Browser scraping failed, trying Cheerio...');
    }

    // Try Cheerio as fallback
    try {
      jobs = await this.scrapeWithCheerio();
      return jobs;
    } catch (error) {
      console.error('All scraping methods failed:', error);
      return [];
    } finally {
      await this.browserManager.closeBrowser();
    }
  }

  /**
   * Normalize job data
   */
  normalizeJob(job) {
    return {
      title: job.title || '',
      company: job.company || '',
      location: job.location || 'Remote',
      description: job.description || '',
      jobType: job.jobType || job.employmentType || 'Full-time',
      salary: job.salary || '',
      url: job.url || '',
      postedDate: job.postedDate || new Date().toISOString(),
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      experienceLevel: job.seniority || job.experienceLevel || '',
      remote: job.remote || job.location?.toLowerCase().includes('remote') || false,
      skills: job.skills || [],
      source: 'LinkedIn'
    };
  }

  /**
   * Clean and validate scraped data
   */
  cleanJobs(jobs) {
    return jobs.filter(job => {
      if (!job.title || job.title.length < 3) return false;
      if (!job.company || job.company.length < 2) return false;
      return true;
    }).map(job => ({
      ...this.normalizeJob(job),
      title: job.title.trim(),
      company: job.company.trim(),
      location: job.location.trim(),
      description: job.description.trim().substring(0, 5000),
      scrapedAt: new Date().toISOString(),
      source: 'LinkedIn'
    }));
  }
}

export default LinkedInScraper;
