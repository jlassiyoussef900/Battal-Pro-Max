import pg from 'pg';
const { Pool } = pg;

class DatabaseHandler {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'battal_db',
      user: process.env.DB_USER || 'azer',
      password: process.env.DB_PASSWORD || '',
    });
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connected:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get or create company with full details
   */
  async getOrCreateCompany(companyData) {
    const client = await this.pool.connect();
    try {
      const companyName = typeof companyData === 'string' ? companyData : companyData.name;
      
      // Check if company exists
      let result = await client.query(
        'SELECT id FROM companies WHERE name = $1',
        [companyName]
      );

      if (result.rows.length > 0) {
        return result.rows[0].id;
      }

      // Create new company with all available details
      const description = typeof companyData === 'object' ? companyData.description : `Jobs from ${companyName}`;
      const industry = typeof companyData === 'object' ? companyData.industry : null;
      const location = typeof companyData === 'object' ? companyData.location : null;
      const website = typeof companyData === 'object' ? companyData.website : null;
      const companySize = typeof companyData === 'object' ? companyData.company_size : null;
      const benefits = typeof companyData === 'object' && companyData.benefits ? companyData.benefits : [];

      result = await client.query(
        `INSERT INTO companies (name, description, industry, location, website, company_size, benefits, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [
          companyName,
          description,
          industry,
          location,
          website,
          companySize,
          benefits.length > 0 ? `{${benefits.join(',')}}` : null
        ]
      );

      console.log(`✅ Created company: ${companyName}`);
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  /**
   * Check if job already exists
   */
  async jobExists(title, companyId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT id FROM jobs 
         WHERE title = $1 AND company_id = $2 
         AND created_at > NOW() - INTERVAL '30 days'`,
        [title, companyId]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Save job to database with all details
   */
  async saveJob(job) {
    const client = await this.pool.connect();
    try {
      // Get or create company
      const companyId = await this.getOrCreateCompany({
        name: job.company,
        description: job.companyDescription,
        industry: job.industry,
        location: job.companyLocation,
        website: job.companyWebsite,
        benefits: job.benefits
      });

      // Check if job already exists
      const exists = await this.jobExists(job.title, companyId);
      if (exists) {
        console.log(`⏭️  Job already exists: ${job.title}`);
        return null;
      }

      // Parse salary range if available
      let salaryMin = null;
      let salaryMax = null;
      let salaryCurrency = 'USD';
      let salaryPeriod = 'yearly';
      
      if (job.salary) {
        const salaryMatch = job.salary.match(/(\d+)k?\s*-\s*(\d+)k?/i);
        if (salaryMatch) {
          salaryMin = parseInt(salaryMatch[1]) * (job.salary.includes('k') ? 1000 : 1);
          salaryMax = parseInt(salaryMatch[2]) * (job.salary.includes('k') ? 1000 : 1);
        }
        
        // Detect currency
        if (job.salary.includes('€') || job.salary.includes('EUR')) salaryCurrency = 'EUR';
        else if (job.salary.includes('£') || job.salary.includes('GBP')) salaryCurrency = 'GBP';
        else if (job.salary.includes('$') || job.salary.includes('USD')) salaryCurrency = 'USD';
        
        // Detect period
        if (job.salary.toLowerCase().includes('hour')) salaryPeriod = 'hourly';
        else if (job.salary.toLowerCase().includes('month')) salaryPeriod = 'monthly';
      }

      // Determine job type
      const jobType = this.normalizeJobType(job.jobType);

      // Determine experience level
      const experienceLevel = this.normalizeExperienceLevel(job.title, job.description);

      // Parse location
      const locationParts = this.parseLocation(job.location);

      // Determine remote/hybrid
      const isRemote = job.remote || job.location?.toLowerCase().includes('remote') || false;
      const isHybrid = job.location?.toLowerCase().includes('hybrid') || false;

      // Parse requirements and skills
      const requirements = Array.isArray(job.requirements) ? job.requirements : [];
      const skills = Array.isArray(job.skills) ? job.skills : [];
      const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];

      // Insert job with all fields
      const result = await client.query(
        `INSERT INTO jobs (
          company_id, title, description, requirements, responsibilities,
          city, region, country, remote, hybrid,
          job_type, experience_level, 
          salary_min, salary_max, salary_currency, salary_period,
          skills, industry, status, posted_at,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
        RETURNING id`,
        [
          companyId,
          job.title,
          job.description,
          requirements.length > 0 ? `{${requirements.map(r => `"${r.replace(/"/g, '\\"')}"`).join(',')}}` : null,
          responsibilities.length > 0 ? `{${responsibilities.map(r => `"${r.replace(/"/g, '\\"')}"`).join(',')}}` : null,
          locationParts.city,
          locationParts.region,
          locationParts.country,
          isRemote,
          isHybrid,
          jobType,
          experienceLevel,
          salaryMin,
          salaryMax,
          salaryCurrency,
          salaryPeriod,
          skills.length > 0 ? `{${skills.map(s => `"${s.replace(/"/g, '\\"')}"`).join(',')}}` : null,
          job.industry || null,
          'active',
          job.postedDate ? new Date(job.postedDate) : new Date()
        ]
      );

      const jobId = result.rows[0].id;
      console.log(`✅ Saved job: ${job.title} (ID: ${jobId})`);

      return jobId;
    } catch (error) {
      console.error('❌ Error saving job:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Parse location string into city, region, country
   */
  parseLocation(location) {
    if (!location) return { city: null, region: null, country: null };

    const parts = location.split(',').map(p => p.trim());
    
    if (parts.length === 1) {
      return { city: parts[0], region: null, country: null };
    } else if (parts.length === 2) {
      return { city: parts[0], region: parts[1], country: null };
    } else if (parts.length >= 3) {
      return { city: parts[0], region: parts[1], country: parts[2] };
    }

    return { city: location, region: null, country: null };
  }

  /**
   * Save job skills/requirements
   */
  async saveJobSkills(jobId, skills) {
    // This is a simplified version - you might want to create a job_skills table
    // For now, we'll just log them
    console.log(`📝 Skills for job ${jobId}:`, skills.slice(0, 5).join(', '));
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
   * Normalize experience level
   */
  normalizeExperienceLevel(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('senior') || text.includes('sr.') || text.includes('lead')) {
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
   * Save multiple jobs
   */
  async saveJobs(jobs) {
    console.log(`💾 Saving ${jobs.length} jobs to database...`);
    
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const job of jobs) {
      try {
        const jobId = await this.saveJob(job);
        if (jobId) {
          saved++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error saving job "${job.title}":`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Saved: ${saved}`);
    console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    return { saved, skipped, errors };
  }

  /**
   * Get recent jobs
   */
  async getRecentJobs(limit = 10) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT j.*, c.name as company_name
         FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE j.status = 'active'
         ORDER BY j.created_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get scraping statistics
   */
  async getStats() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(DISTINCT company_id) as total_companies,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as jobs_today,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as jobs_this_week
        FROM jobs
        WHERE status = 'active'
      `);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }
}

export default DatabaseHandler;
