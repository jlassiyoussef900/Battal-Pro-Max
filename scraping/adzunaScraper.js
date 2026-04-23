import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AdzunaScraper {
  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
    this.country = process.env.ADZUNA_COUNTRY || 'us';
  }

  async scrape(keywords = 'software developer', location = '', maxPages = 5) {
    console.log('🚀 Starting Adzuna API scraping...');
    console.log(`📝 Keywords: ${keywords}`);
    console.log(`📍 Location: ${location || 'All locations'}`);
    console.log(`📄 Max pages: ${maxPages}`);

    const allJobs = [];
    let page = 1;

    try {
      while (page <= maxPages) {
        console.log(`\n📄 Fetching page ${page}...`);
        
        const url = `https://api.adzuna.com/v1/api/jobs/${this.country}/search/${page}`;
        
        const params = {
          app_id: this.appId,
          app_key: this.appKey,
          results_per_page: 50,
          what: keywords,
          sort_by: 'date'
        };

        if (location) {
          params.where = location;
        }

        const response = await axios.get(url, { params });
        const jobs = response.data.results || [];

        if (jobs.length === 0) {
          console.log('✅ No more jobs found');
          break;
        }

        console.log(`✅ Found ${jobs.length} jobs on page ${page}`);
        
        const normalizedJobs = jobs.map(job => this.normalizeJob(job));
        allJobs.push(...normalizedJobs);

        page++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n✅ Total jobs scraped: ${allJobs.length}`);
      return allJobs;

    } catch (error) {
      console.error('❌ Error scraping Adzuna:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      throw error;
    }
  }

  normalizeJob(job) {
    const location = this.parseLocation(job.location?.display_name || job.location?.area?.[0] || '');
    const salary = this.parseSalary(job.salary_min, job.salary_max);
    
    return {
      title: job.title || 'Untitled Position',
      description: job.description || '',
      
      company: {
        name: job.company?.display_name || 'Unknown Company',
        logo: null,
        website: null,
        description: null,
        industry: job.category?.label || null,
        size: null,
        founded: null,
        headquarters: location.city || location.region || location.country,
        benefits: [],
        culture: null,
        rating: null,
        reviews_count: null,
        social_media: {},
        career_page: null
      },

      city: location.city,
      region: location.region,
      country: location.country || 'United States',
      remote: this.detectRemote(job.title, job.description),
      hybrid: this.detectHybrid(job.title, job.description),

      job_type: this.normalizeJobType(job.contract_type),
      experience_level: this.detectExperienceLevel(job.title, job.description),
      
      salary_min: salary.min,
      salary_max: salary.max,
      salary_currency: salary.currency,
      salary_period: salary.period,

      requirements: this.extractRequirements(job.description),
      responsibilities: this.extractResponsibilities(job.description),
      skills: this.extractSkills(job.description),

      posted_date: job.created ? new Date(job.created) : new Date(),
      application_url: job.redirect_url || '',
      source: 'adzuna',
      external_id: job.id?.toString() || null,
      
      category: job.category?.label || null,
      contract_time: job.contract_time || null
    };
  }

  parseLocation(locationStr) {
    const parts = locationStr.split(',').map(s => s.trim());
    
    return {
      city: parts[0] || null,
      region: parts[1] || null,
      country: parts[2] || null
    };
  }

  parseSalary(min, max) {
    return {
      min: min ? Math.round(min) : null,
      max: max ? Math.round(max) : null,
      currency: 'USD',
      period: 'year'
    };
  }

  normalizeJobType(contractType) {
    if (!contractType) return 'full_time';
    
    const type = contractType.toLowerCase();
    if (type.includes('permanent') || type.includes('full')) return 'full_time';
    if (type.includes('part')) return 'part_time';
    if (type.includes('contract')) return 'contract';
    if (type.includes('temporary')) return 'temporary';
    
    return 'full_time';
  }

  detectExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.match(/\b(intern|internship|student|graduate|entry.level|junior)\b/)) {
      return 'entry';
    }
    if (text.match(/\b(senior|lead|principal|staff|architect)\b/)) {
      return 'senior';
    }
    if (text.match(/\b(mid.level|intermediate|experienced)\b/)) {
      return 'mid';
    }
    
    return 'mid';
  }

  detectRemote(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    return text.includes('remote') || text.includes('work from home');
  }

  detectHybrid(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    return text.includes('hybrid');
  }

  extractRequirements(description) {
    const requirements = [];
    const lines = description.split('\n');
    
    let inRequirements = false;
    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('requirement') || lower.includes('qualification') || lower.includes('must have')) {
        inRequirements = true;
        continue;
      }
      
      if (lower.includes('responsibilit') || lower.includes('about') || lower.includes('benefit')) {
        inRequirements = false;
      }
      
      if (inRequirements && line.trim().match(/^[-•*]\s*.+/)) {
        requirements.push(line.trim().replace(/^[-•*]\s*/, ''));
      }
    }
    
    return requirements.length > 0 ? requirements : ['See job description for requirements'];
  }

  extractResponsibilities(description) {
    const responsibilities = [];
    const lines = description.split('\n');
    
    let inResponsibilities = false;
    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('responsibilit') || lower.includes('you will') || lower.includes('duties')) {
        inResponsibilities = true;
        continue;
      }
      
      if (lower.includes('requirement') || lower.includes('qualification') || lower.includes('benefit')) {
        inResponsibilities = false;
      }
      
      if (inResponsibilities && line.trim().match(/^[-•*]\s*.+/)) {
        responsibilities.push(line.trim().replace(/^[-•*]\s*/, ''));
      }
    }
    
    return responsibilities.length > 0 ? responsibilities : ['See job description for responsibilities'];
  }

  extractSkills(description) {
    const skills = [];
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
      'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
      'git', 'agile', 'scrum', 'rest', 'api', 'microservices', 'ci/cd',
      'html', 'css', 'redux', 'graphql', 'jenkins', 'terraform'
    ];
    
    const text = description.toLowerCase();
    
    for (const skill of commonSkills) {
      if (text.includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
    
    return skills;
  }
}

export default AdzunaScraper;
