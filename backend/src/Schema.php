<?php

namespace App;

class Schema
{
    public static function createTables()
    {
        $db = Database::getConnection();

        // Users table
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'jobseeker',
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ");

        // Job Seekers table
        $db->exec("
            CREATE TABLE IF NOT EXISTS job_seekers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                bio TEXT,
                location VARCHAR(255),
                preferred_locations TEXT[],
                job_categories TEXT[],
                min_salary INTEGER,
                max_salary INTEGER,
                years_experience INTEGER,
                availability VARCHAR(100) DEFAULT 'immediately',
                phone VARCHAR(20),
                portfolio_url TEXT,
                github_url TEXT,
                linkedin_url TEXT,
                headline VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Recruiters table
        $db->exec("
            CREATE TABLE IF NOT EXISTS recruiters (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                bio TEXT,
                phone VARCHAR(20),
                location VARCHAR(255),
                preferred_locations TEXT[],
                specializations TEXT[],
                company_name VARCHAR(255),
                experience_years INTEGER,
                headline VARCHAR(255),
                linkedin_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Profiles table (legacy support)
        $db->exec("
            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                headline VARCHAR(255),
                summary TEXT,
                phone VARCHAR(20),
                linkedin VARCHAR(255),
                portfolio VARCHAR(255),
                city VARCHAR(100),
                region VARCHAR(100),
                country VARCHAR(100),
                remote BOOLEAN DEFAULT FALSE,
                salary_min INTEGER,
                salary_max INTEGER,
                salary_currency VARCHAR(10) DEFAULT 'USD',
                job_types TEXT[],
                industries TEXT[],
                company_sizes TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Companies table
        $db->exec("
            CREATE TABLE IF NOT EXISTS companies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id UUID,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                industry VARCHAR(100),
                company_size VARCHAR(50),
                location VARCHAR(255),
                country VARCHAR(100),
                website VARCHAR(255),
                logo_url TEXT,
                founded INTEGER,
                benefits TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
            )
        ");

        // Jobs table
        $db->exec("
            CREATE TABLE IF NOT EXISTS jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                company_id UUID NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                location VARCHAR(255),
                job_type VARCHAR(50),
                salary_min INTEGER,
                salary_max INTEGER,
                salary_currency VARCHAR(10) DEFAULT 'USD',
                experience_level VARCHAR(50),
                remote BOOLEAN DEFAULT FALSE,
                required_skills TEXT[],
                benefits TEXT[],
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
        ");

        // Skills table
        $db->exec("
            CREATE TABLE IF NOT EXISTS skills (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Matches table (for Tinder-style functionality)
        $db->exec("
            CREATE TABLE IF NOT EXISTS matches (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                jobseeker_id UUID NOT NULL,
                job_id UUID NOT NULL,
                action VARCHAR(50),
                score INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (jobseeker_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        ");

        // Work Experience table
        $db->exec("
            CREATE TABLE IF NOT EXISTS work_experience (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                company VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                start_date DATE,
                end_date DATE,
                current BOOLEAN DEFAULT FALSE,
                description TEXT,
                achievements TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Education table
        $db->exec("
            CREATE TABLE IF NOT EXISTS education (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                institution VARCHAR(255) NOT NULL,
                degree VARCHAR(100),
                field_of_study VARCHAR(100),
                start_date DATE,
                end_date DATE,
                current BOOLEAN DEFAULT FALSE,
                gpa NUMERIC(3,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Badges table
        $db->exec("
            CREATE TABLE IF NOT EXISTS badges (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                level VARCHAR(50),
                score INTEGER,
                earned_at TIMESTAMP,
                icon TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        // Applications table
        $db->exec("
            CREATE TABLE IF NOT EXISTS applications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                job_id UUID NOT NULL,
                status VARCHAR(50) DEFAULT 'new',
                cover_letter TEXT,
                resume_url TEXT,
                notes TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        ");

        return true;
    }
}
