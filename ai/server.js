import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CV Generator AI' });
});

// Generate CV endpoint
app.post('/api/generate-cv', async (req, res) => {
  try {
    const { profile, skills, experience, education, jobTitle, template } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    // Build the prompt for Gemini
    const prompt = buildCVPrompt(profile, skills, experience, education, jobTitle, template);

    // Generate CV using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cvContent = response.text();

    res.json({
      success: true,
      cv: cvContent,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: template || 'professional',
        jobTitle: jobTitle || 'General'
      }
    });

  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({
      error: 'Failed to generate CV',
      message: error.message
    });
  }
});

// Generate cover letter endpoint
app.post('/api/generate-cover-letter', async (req, res) => {
  try {
    const { profile, jobTitle, companyName, jobDescription } = req.body;

    if (!profile || !jobTitle || !companyName) {
      return res.status(400).json({ error: 'Profile, job title, and company name are required' });
    }

    const prompt = buildCoverLetterPrompt(profile, jobTitle, companyName, jobDescription);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    res.json({
      success: true,
      coverLetter: coverLetter,
      metadata: {
        generatedAt: new Date().toISOString(),
        jobTitle,
        companyName
      }
    });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({
      error: 'Failed to generate cover letter',
      message: error.message
    });
  }
});

// Optimize CV for job endpoint
app.post('/api/optimize-cv', async (req, res) => {
  try {
    const { cvContent, jobDescription } = req.body;

    if (!cvContent || !jobDescription) {
      return res.status(400).json({ error: 'CV content and job description are required' });
    }

    const prompt = `You are an expert CV optimizer. Analyze the following CV and job description, then provide specific suggestions to optimize the CV for this job.

CV Content:
${cvContent}

Job Description:
${jobDescription}

Provide:
1. Keywords to add from the job description
2. Skills to emphasize
3. Experience points to highlight or rewrite
4. Overall match score (0-100)
5. Specific recommendations

Format your response as JSON with these fields: keywords, skillsToEmphasize, experienceRecommendations, matchScore, recommendations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text();

    res.json({
      success: true,
      suggestions: suggestions,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error optimizing CV:', error);
    res.status(500).json({
      error: 'Failed to optimize CV',
      message: error.message
    });
  }
});

// Helper function to build CV prompt
function buildCVPrompt(profile, skills, experience, education, jobTitle, template) {
  const templateStyle = template === 'modern' ? 'modern and creative' :
                       template === 'minimal' ? 'minimal and clean' :
                       'professional and traditional';

  return `You are an expert CV writer. Create a ${templateStyle} CV in HTML format based on the following information.

PERSONAL INFORMATION:
Name: ${profile.first_name} ${profile.last_name}
Email: ${profile.email}
Phone: ${profile.phone || 'Not provided'}
Location: ${profile.city || ''} ${profile.region || ''} ${profile.country || ''}
LinkedIn: ${profile.linkedin || 'Not provided'}
Portfolio: ${profile.portfolio || 'Not provided'}
Headline: ${profile.headline || ''}
Summary: ${profile.summary || ''}

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}` : ''}

SKILLS:
${skills && skills.length > 0 ? skills.map(s => `- ${s.name} (${s.category}, proficiency: ${s.proficiency}%)`).join('\n') : 'No skills provided'}

WORK EXPERIENCE:
${experience && experience.length > 0 ? experience.map(exp => `
Company: ${exp.company}
Position: ${exp.position}
Location: ${exp.location || 'N/A'}
Duration: ${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}
Description: ${exp.description || 'N/A'}
`).join('\n---\n') : 'No experience provided'}

EDUCATION:
${education && education.length > 0 ? education.map(edu => `
Institution: ${edu.institution}
Degree: ${edu.degree}
Field: ${edu.field_of_study || 'N/A'}
Duration: ${edu.start_date} - ${edu.current ? 'Present' : edu.end_date}
GPA: ${edu.gpa || 'N/A'}
`).join('\n---\n') : 'No education provided'}

REQUIREMENTS:
1. Create a complete, professional CV in HTML format
2. Use semantic HTML5 tags
3. Include inline CSS for styling (${templateStyle} design)
4. Make it print-friendly
5. Organize sections clearly: Header, Summary, Skills, Experience, Education
6. Use bullet points for achievements
7. Highlight key skills relevant to ${jobTitle || 'the candidate\'s field'}
8. Make it ATS-friendly (Applicant Tracking System)
9. Keep it concise but comprehensive
10. Use professional language

Return ONLY the HTML code, no explanations or markdown code blocks.`;
}

// Helper function to build cover letter prompt
function buildCoverLetterPrompt(profile, jobTitle, companyName, jobDescription) {
  return `You are an expert cover letter writer. Create a compelling cover letter for the following job application.

CANDIDATE INFORMATION:
Name: ${profile.first_name} ${profile.last_name}
Current Role: ${profile.headline || 'Professional'}
Summary: ${profile.summary || ''}

JOB DETAILS:
Position: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

REQUIREMENTS:
1. Write a professional, engaging cover letter
2. Address it to the hiring manager
3. Show enthusiasm for the role and company
4. Highlight relevant skills and experience
5. Explain why the candidate is a great fit
6. Keep it concise (3-4 paragraphs)
7. Use professional but personable tone
8. Include a strong opening and closing
9. Make it specific to this job and company

Return the cover letter in plain text format, ready to use.`;
}

// Start server
app.listen(PORT, () => {
  console.log(`🤖 CV Generator AI Service running on port ${PORT}`);
  console.log(`📝 Endpoints:`);
  console.log(`   - POST /api/generate-cv`);
  console.log(`   - POST /api/generate-cover-letter`);
  console.log(`   - POST /api/optimize-cv`);
  console.log(`   - GET /health`);
});
