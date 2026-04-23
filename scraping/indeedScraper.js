import BrowserManager from './browserManager.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

class IndeedScraper {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.INDEED_URL || 'https://www.indeed.com';
    this.keywords = config.keywords || process.env.INDEED_SEARCH_KEYWORDS || 'software developer';
    this.location = config.location || process.env.INDEED_LOCATION || 'United States';
    this.browserManager = new BrowserManager();
  }

  /**
   * Build Indeed search URL
   */
  buildSearchUrl(keywords, location, start = 0) {
    const params = new URLSearchParams({
      q: keywords,
      l: location,
      start: start.toString(),
      fromage: '7', // Last 7 days
      sort: 'date'
    });
    
    return `${this.baseUrl}/jobs?${params.toString()}`;
  }

  /**
   * Scrape jobs from Indeed using headless browser
   */
  async scrapeWithBrowser() {
    console.log('🚀 Starting Indeed scraping with headless browser...');
    
    try {
      const { page, location } = await this.browserManager.createStealthPage();
      console.log(`🌍 Scraping from: ${location.name}`);

      const searchUrl = this.buildSearchUrl(this.keywords, this.location);
      console.log(`🔍 Search URL: ${searchUrl}`);

      await this.browserManager.navigateWithRetry(page, searchUrl);
      
      // Wait for job listings
      await this.browserManager.addRandomDelay(3000, 5000);
      
      // Scroll to load more jobs
      await this.browserManager.scrollPage(page);
      
      // Wait for job cards
      const found = await this.browserManager.waitForSelector(page, '.job_seen_beacon, .jobsearch-ResultsList li, .tapItem', 15000);
      
      if (!found) {
        console.log('⚠️  No job cards found, taking screenshot...');
        await this.browserManager.takeScreenshot(page, 'indeed-page.png');
      }

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job_seen_beacon, .tapItem, .jobsearch-ResultsList > li');
        const extractedJobs = [];

        jobCards.forEach((card) => {
          try {
            // Extract job title
            const titleEl = card.querySelector('h2.jobTitle span[title], h2 a span, .jobTitle a');
            const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';

            // Extract company
            const companyEl = card.querySelector('[data-testid="company-name"], .companyName, span.companyName');
            const company = companyEl?.textContent?.trim() || '';

            // Extract location
            const locationEl = card.querySelector('[data-testid="text-location"], .companyLocation, div.companyLocation');
            const location = locationEl?.textContent?.trim() || '';

            // Extract salary
            const salaryEl = card.querySelector('.salary-snippet, .metadata.salary-snippet-container, [data-testid="attribute_snippet_testid"]');
            const salary = salaryEl?.textContent?.trim() || '';

            // Extract job type
            const typeEl = card.querySelector('.metadata, .attribute_snippet');
            const jobType = typeEl?.textContent?.trim() || '';

            // Extract description snippet
            const descEl = card.querySelector('.job-snippet, ul.job-snippet li, .summary');
            const description = descEl?.textContent?.trim() || '';

            // Extract job link
            const linkEl = card.querySelector('h2.jobTitle a, a.jcs-JobTitle');
            const jobLink = linkEl?.href || '';

            // Extract job key/ID from link
            const jobKeyMatch = jobLink.match(/jk=([a-zA-Z0-9]+)/);
            const jobKey = jobKeyMatch ? jobKeyMatch[1] : '';

            // Extract posted date
            const dateEl = card.querySelector('.date, .metadata .date');
            const postedDate = dateEl?.textContent?.trim() || '';

            if (title && company) {
              extractedJobs.push({
                title,
                company,
                location,
                salary,
                jobType,
                description,
                url: jobLink ? `https://www.indeed.com${jobLink}` : '',
                jobKey,
                postedDate: postedDate || new Date().toISOString(),
                source: 'Indeed',
                requirements: [],
                responsibilities: [],
                benefits: [],
                skills: [],
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

      console.log(`✅ Found ${jobs.length} jobs from Indeed`);
      
      // Add metadata
      jobs.forEach(job => {
        job.scrapedFrom = location.name;
        job.scrapedAt = new Date().toISOString();
      });

      return jobs;

    } catch (error) {
      console.error('❌ Error scraping Indeed:', error.message);
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

        const getArrayContent = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
        };

        return {
          fullDescription: getTextContent('#jobDescriptionText, .jobsearch-jobDescriptionText'),
          requirements: getArrayContent('#jobDescriptionText ul li, .jobsearch-jobDescriptionText ul li'),
          companyDescription: getTextContent('.jobsearch-CompanyInfoContainer'),
          benefits: getArrayContent('.jobsearch-JobMetadataHeader-item'),
          jobType: getTextContent('.jobsearch-JobMetadataHeader-item:contains("Job Type")'),
          salary: getTextContent('.jobsearch-JobMetadataHeader-item:contains("Salary")'),
          industry: getTextContent('.jobsearch-CompanyInfoContainer [data-testid="companyInfo-industry"]')
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
    console.log('🚀 Starting Indeed scraping with Cheerio...');

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
          'Referer': 'https://www.indeed.com/'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('.job_seen_beacon, .tapItem, .jobsearch-ResultsList > li').each((index, element) => {
        try {
          const $el = $(element);
          
          const job = {
            title: $el.find('h2.jobTitle span[title], h2 a span').first().text().trim() || 
                   $el.find('h2.jobTitle span').first().attr('title') || '',
            company: $el.find('[data-testid="company-name"], .companyName').first().text().trim(),
            location: $el.find('[data-testid="text-location"], .companyLocation').first().text().trim() || 'Remote',
            salary: $el.find('.salary-snippet, .metadata.salary-snippet-container').first().text().trim(),
            jobType: $el.find('.metadata, .attribute_snippet').first().text().trim(),
            description: $el.find('.job-snippet, ul.job-snippet li').first().text().trim(),
            url: '',
            jobKey: '',
            postedDate: $el.find('.date').first().text().trim() || new Date().toISOString(),
            source: 'Indeed',
            requirements: [],
            responsibilities: [],
            benefits: [],
            skills: [],
            remote: false,
            hybrid: false
          };

          // Extract job link
          const jobLink = $el.find('h2.jobTitle a, a.jcs-JobTitle').first().attr('href');
          if (jobLink) {
            job.url = jobLink.startsWith('http') ? jobLink : `https://www.indeed.com${jobLink}`;
            const jobKeyMatch = jobLink.match(/jk=([a-zA-Z0-9]+)/);
            job.jobKey = jobKeyMatch ? jobKeyMatch[1] : '';
          }

          // Detect remote/hybrid
          job.remote = job.location?.toLowerCase().includes('remote') || false;
          job.hybrid = job.location?.toLowerCase().includes('hybrid') || false;

          if (job.title && job.company) {
            jobs.push(job);
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });

      console.log(`✅ Found ${jobs.length} jobs from Indeed`);
      return jobs;

    } catch (error) {
      console.error('❌ Error scraping Indeed with Cheerio:', error.message);
      throw error;
    }
  }

  /**
   * Main scraping method
   */
  async scrape() {
    console.log('🔍 Starting Indeed job scraping...');
    console.log(`📝 Keywords: ${this.keywords}`);
    console.log(`📍 Location: ${this.location}`);
    console.log(`🌍 Location rotation enabled - ${this.browserManager.locations.length} locations available\n`);
    
    let jobs = [];

    // Try browser scraping first (most reliable for Indeed)
    try {
      jobs = await this.scrapeWithBrowser();
      if (jobs.length > 0) {
        return jobs;
      }
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
      description: job.description || job.fullDescription || '',
      jobType: this.normalizeJobType(job.jobType),
      salary: job.salary || '',
      url: job.url || '',
      postedDate: job.postedDate || new Date().toISOString(),
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      benefits: job.benefits || [],
      experienceLevel: this.detectExperienceLevel(job.title, job.description),
      remote: job.remote || false,
      hybrid: job.hybrid || false,
      skills: job.skills || [],
      industry: job.industry || null,
      source: 'Indeed'
    };
  }

  /**
   * Normalize job type
   */
  normalizeJobType(jobType) {
    if (!jobType) return 'full-time';
    
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'full-time';
    if (type.includes('part')) return 'part-time';
    if (type.includes('contract')) return 'contract';
    if (type.includes('intern')) return 'internship';
    if (type.includes('temporary') || type.includes('temp')) return 'temporary';
    
    return 'full-time';
  }

  /**
   * Detect experience level
   */
  detectExperienceLevel(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('senior') || text.includes('sr.') || text.includes('lead') || text.includes('principal')) {
      return 'senior';
    }
    if (text.includes('junior') || text.includes('jr.') || text.includes('entry')) {
      return 'junior';
    }
    if (text.includes('mid') || text.includes('intermediate')) {
      return 'mid';
    }
    if (text.includes('intern')) {
      return 'internship';
    }
    
    return 'mid';
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
      source: 'Indeed'
    }));
  }
}

export default IndeedScraper;
