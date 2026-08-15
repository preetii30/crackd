import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const cleanResumeText = (text = "") => {
  return text
    .replace(/\s+/g, " ")                    // Multiple spaces to single space
    .replace(/\u00A0/g, " ")                // Non-breaking space to regular space
    .replace(/[\u2000-\u200B]/g, " ")       // Various Unicode spaces
    .replace(/[\u2013\u2014]/g, "-")        // En-dash and Em-dash to hyphen
    .replace(/[\u2018\u2019]/g, "'")        // Curly quotes to straight quotes
    .replace(/[\u201C\u201D]/g, '"')        // Curly double quotes to straight quotes
    .replace(/•/g, "•")                     // Normalize bullets
    .replace(/[^\x20-\x7E\n\r•·√°©®™]/g, "") // Remove unsupported special chars but keep common ones
    .trim();
};

const DEFAULT_GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const DEFAULT_GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const getGeminiEndpoint = () => {
  return (process.env.GEMINI_API_URL || DEFAULT_GEMINI_ENDPOINT).trim();
};

const getActiveProvider = () => (process.env.AI_PROVIDER || "gemini").toLowerCase();

export const extractResumeText = async (filePath) => {
  const dataBuffer = await fs.promises.readFile(filePath);
  const parsed = await pdf(dataBuffer);
  const text = cleanResumeText(parsed.text || "");

  console.log(`[ResumeAnalyzer] Extracted resume text length=${text.length} from ${filePath}`);
  if (!text) {
    throw new Error("Resume extraction returned no text.");
  }

  return text;
};

const callGeminiAPI = async (prompt) => {
  const provider = getActiveProvider();

  if (provider === "groq") {
    const apiKey = (process.env.GROQ_API_KEY || "").trim();
    if (!apiKey) {
      throw new Error("Groq API key is not configured on the backend.");
    }

    const endpoint = (process.env.GROQ_API_URL || DEFAULT_GROQ_ENDPOINT).trim();
    const model = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();
    const requestBody = {
      model,
      messages: [
        {
          role: "system",
          content: "You are a precise resume analysis assistant. Return only the requested content in valid JSON when required.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1800,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseText = await response.text();
      let payload;
      try {
        payload = JSON.parse(responseText);
      } catch (error) {
        throw new Error(`Groq response was not valid JSON: ${error.message}`);
      }

      if (!response.ok) {
        throw new Error(payload?.error?.message || `Groq request failed with status ${response.status}`);
      }

      const candidateText = payload?.choices?.[0]?.message?.content;
      if (!candidateText) {
        throw new Error("Groq returned no output.");
      }

      return typeof candidateText === "string"
        ? candidateText
        : candidateText.map((part) => (typeof part === "string" ? part : part?.text || "")).join("");
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === "AbortError") {
        throw new Error("Groq API request timeout (45 seconds exceeded)");
      }
      throw error;
    }
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured on the backend.");
  }

  const endpoint = getGeminiEndpoint().replace(/\?key=.*$/, "");
  const requestUrl = `${endpoint}?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }],
    }],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45 second timeout

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await response.text();
    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Gemini response was not valid JSON: ${error.message}`);
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || `Gemini request failed with status ${response.status}`);
    }

    const candidateText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Gemini returned no output.");
    }

    return candidateText;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("Gemini API request timeout (45 seconds exceeded)");
    }
    throw error;
  }
};

const normalizeText = (text = "") => text.replace(/\s+/g, " ").trim().toLowerCase();

const pickTopItems = (items, count = 10) => items.slice(0, count);

const buildFallbackAnalysis = (resumeText) => {
  const text = normalizeText(resumeText);
  const wordMatches = (words) => words.filter((item) => text.includes(item.toLowerCase()));

  const contactKeywords = ["@", "email", "phone", "linkedin", "github", "contact"];
  const educationKeywords = ["bachelor", "master", "msc", "mca", "degree", "cgpa", "gpa", "diploma", "school", "college", "university", "institute"];
  const projectKeywords = ["project", "projects", "built", "developed", "designed", "implemented", "launched", "created"];
  const experienceKeywords = ["experience", "internship", "intern", "worked", "responsible", "lead", "led", "achieved"];
  const aiKeywords = ["machine learning", "deep learning", "nlp", "transformer", "llm", "tensorflow", "pytorch", "computer vision", "ai/", "artificial intelligence"];
  const backendKeywords = ["node", "express", "api", "database", "mongodb", "sql", "postgres", "mysql", "rest", "graphql", "server", "microservice"];
  const frontendKeywords = ["react", "vue", "angular", "javascript", "typescript", "html", "css", "tailwind", "bootstrap", "ui", "ux"];
  const devopsKeywords = ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "github actions", "terraform", "ansible"];

  const foundContact = wordMatches(contactKeywords).length;
  const foundEducation = wordMatches(educationKeywords).length;
  const foundProjects = wordMatches(projectKeywords).length;
  const foundExperience = wordMatches(experienceKeywords).length;
  const foundAI = wordMatches(aiKeywords).length;
  const foundBackend = wordMatches(backendKeywords).length;
  const foundFrontend = wordMatches(frontendKeywords).length;
  const foundDevops = wordMatches(devopsKeywords).length;
  const bulletCount = (resumeText.match(/[•\-*]/g) || []).length;

  const projectCount = Math.min(5, Math.max(0, Math.floor(foundProjects / 2)));
  const skillCount = Math.min(15, foundBackend + foundFrontend + foundDevops + foundAI + 3);

  const educationScore = foundEducation ? Math.min(100, 70 + foundEducation * 5) : 50;
  const experienceScore = Math.min(100, 60 + Math.min(3, foundExperience) * 10 + (text.includes("intern") ? 5 : 0));
  const technicalSkillsScore = Math.min(100, 70 + Math.min(3, skillCount) * 8 + (foundAI ? 5 : 0));
  const projectsScore = Math.min(100, 70 + Math.min(3, projectCount) * 8);
  const atsScore = Math.min(100, 55 + Math.min(10, skillCount + foundEducation + projectCount) * 4);
  const formattingScore = Math.min(100, 60 + Math.min(10, bulletCount) * 3 + (text.length > 1200 ? 10 : 0));
  const grammarScore = Math.min(100, 65 + (text.length > 1200 ? 10 : 0) + (bulletCount > 3 ? 5 : 0));
  const overallScore = Math.min(100, Math.round((educationScore + experienceScore + technicalSkillsScore + projectsScore + formattingScore + grammarScore) / 6));

  const strengths = [];
  const weaknesses = [];

  if (foundContact) strengths.push("Contact information is present or implied.");
  if (foundEducation) strengths.push("Education details are included.");
  if (projectCount > 0) strengths.push("Projects or development experience are described.");
  if (skillCount > 0) strengths.push("Technical keywords are present in the resume.");
  if (foundAI) strengths.push("AI/ML-related content is detected.");
  if (strengths.length < 5) strengths.push("Resume has relevant career-oriented content.");

  if (!foundContact) weaknesses.push("Contact information appears to be missing or incomplete.");
  if (!foundEducation) weaknesses.push("Education details are not clear.");
  if (!projectCount) weaknesses.push("Projects are not well documented or missing.");
  if (skillCount < 4) weaknesses.push("Technical skills section is weak or not visible.");
  if (bulletCount < 3) weaknesses.push("Resume formatting is sparse and needs bullet structure.");
  if (weaknesses.length < 5) weaknesses.push("The resume needs stronger metrics and quantified achievements.");

  const candidateDomain = foundAI
    ? "AI/ML"
    : foundDevops
    ? "DevOps/Cloud"
    : foundFrontend && !foundBackend
    ? "Frontend"
    : foundBackend && !foundFrontend
    ? "Backend"
    : "Full-Stack";

  const missingKeywords = pickTopItems([
    "RESTful APIs",
    "Version Control",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Cloud Deployment",
    "Unit Testing",
    "Data Structures",
    "Algorithms",
    "System Design",
    "GraphQL",
    "Authentication",
    "Performance Optimization",
    "Responsive Design",
    "Database Indexing",
  ].filter((item) => !text.includes(item.toLowerCase())), 10);

  const missingTechnicalSkills = pickTopItems([
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Docker",
    "AWS/GCP/Azure",
    "GraphQL",
    "TypeScript",
    "Unit Testing",
    "CI/CD",
    "Microservices",
    "Kubernetes",
    "Redis",
    "REST API Development",
    "Serverless Architecture",
  ].filter((item) => !text.includes(item.toLowerCase())), 10);

  const suggestedCertifications = [
    "AWS Certified Developer - Associate",
    "MongoDB Certified Developer Associate",
    "Certified Kubernetes Administrator (CKA)",
    "React.js Certification",
    "Google Cloud Professional Developer",
  ].slice(0, 5);

  const suggestedProjects = [
    "Build a full-stack portfolio app with authentication and data persistence.",
    "Create a REST API service with proper documentation and tests.",
    "Develop a data-driven dashboard with charts and analytics.",
    "Implement a real-time chat or collaboration tool.",
    "Build a deployment pipeline using GitHub Actions or similar.",
  ];

  const suggestedImprovements = [
    "Add a clear professional summary at the top of your resume.",
    "List at least three technology skills in a dedicated skills section.",
    "Describe your most important projects with outcomes and metrics.",
    "Include education details with institution, degree, and dates.",
    "Use bullet points to improve readability and structure.",
    "Add quantifiable achievements where possible (e.g. reduced load time by 30%).",
    "Mention the tools and frameworks used in each project.",
    "Add a LinkedIn or GitHub link for recruiter reference.",
    "Use consistent formatting for headings and dates.",
    "Highlight any internship or work experience with specific responsibilities.",
  ];

  const topPriorityImprovements = [
    !foundEducation ? "Add an education section with degree and institution." : null,
    !projectCount ? "Add at least one detailed project with technologies used." : null,
    !foundContact ? "Add contact details like email, phone, LinkedIn, or GitHub." : null,
    skillCount < 5 ? "Expand your technical skills section with relevant tools." : null,
  ].filter(Boolean).slice(0, 5);

  const finalSummary = `This is a fallback resume analysis for a ${candidateDomain} candidate. It identifies basic strengths in the resume text and points out missing technical skills, projects, and education details. The analysis is generated locally when the configured AI API is unavailable.`;

  return {
    overallScore,
    atsScore,
    grammarScore,
    formattingScore,
    technicalSkillsScore: Math.max(technicalSkillsScore, 70),
    projectsScore: Math.max(projectsScore, 70),
    experienceScore,
    educationScore,
    strengths,
    weaknesses,
    missingKeywords,
    missingTechnicalSkills,
    suggestedCertifications,
    suggestedProjects,
    suggestedImprovements,
    topPriorityImprovements,
    finalSummary,
    analysisSource: "fallback",
  };
};

const createAISuggestionsFallback = (resumeText, analysis) => {
  const suggestions = [];
  const quickWins = [];

  if (analysis.topPriorityImprovements.length > 0) {
    suggestions.push({
      title: "Top Priority Resume Fixes",
      priority: "high",
      suggestions: analysis.topPriorityImprovements,
    });
  }

  suggestions.push({
    title: "Technical Skills & Projects",
    priority: "medium",
    suggestions: [
      "Create a dedicated technical skills section with 8-12 keywords relevant to your target role.",
      "Add 2-3 projects and describe the problem, your solution, and the impact.",
      "Include tools, frameworks, and outcomes in each project bullet.",
    ],
  });

  suggestions.push({
    title: "Readability & ATS Optimization",
    priority: "low",
    suggestions: [
      "Use bullet points consistently to improve resume scanning.",
      "Add exact keywords from job descriptions you are applying to.",
      "Keep formatting simple and avoid dense paragraphs.",
    ],
  });

  if (analysis.missingKeywords.length > 0) {
    quickWins.push(`Add keywords: ${analysis.missingKeywords.slice(0, 5).join(", ")}.`);
  }

  if (analysis.missingTechnicalSkills.length > 0) {
    quickWins.push(`Mention skills such as ${analysis.missingTechnicalSkills.slice(0, 5).join(", ")}.`);
  }

  if (analysis.strengths.length > 0) {
    quickWins.push(`Keep strengths like ${analysis.strengths.slice(0, 2).join(" and ")} at the top.`);
  }

  return {
    sections: suggestions,
    quickWins,
    longTermStrategy: "Build a strong portfolio with 2-3 live projects, document your role and outcomes clearly, and keep the resume focused on measurable impact.",
    estimatedImpact: "Improving structure and adding project metrics can boost your resume's ATS and hiring manager appeal significantly, likely raising scores by 15-25 points.",
  };
};

const createCoverLetterFallback = (resumeText, analysis, jobDescription = "") => {
  const nameMatch = resumeText.match(/^([A-Za-z]+\s[A-Za-z]+)/m);
  const candidateName = nameMatch ? nameMatch[1] : "Candidate";
  const role = jobDescription || "a technical role";

  const letterContent = `Dear Hiring Manager,\n\nI am ${candidateName}, and I am excited to apply for ${role}. My resume highlights my experience in technical projects, strong problem-solving skills, and ability to learn modern tools quickly. I have worked on practical projects that demonstrate my understanding of software development fundamentals and my readiness to contribute to a high-performing team.\n\nI look forward to bringing my enthusiasm and technical discipline to your organization. Thank you for considering my application.\n\nSincerely,\n${candidateName}`;

  return {
    letterContent,
    sections: {
      opening: `Introduce yourself as a motivated and technically capable candidate for ${role}.`,
      bodyHighlights: [
        "Mention your hands-on project experience and the technologies used.",
        "Highlight your ability to learn quickly and work in collaborative teams.",
        "Reinforce your commitment to delivering results and continuous improvement.",
      ],
      closing: "End with appreciation and a call to discuss how you can contribute to the team.",
    },
    tone: "professional",
  };
};

const createInterviewQuestionsFallback = (resumeText, analysis) => {
  const text = normalizeText(resumeText);
  const skills = [
    ...(text.includes("react") ? ["React"] : []),
    ...(text.includes("node") ? ["Node.js"] : []),
    ...(text.includes("express") ? ["Express.js"] : []),
    ...(text.includes("mongodb") ? ["MongoDB"] : []),
    ...(text.includes("docker") ? ["Docker"] : []),
  ];

  const technology = skills.length > 0 ? skills[0] : "web development";

  return {
    technicalQuestions: [
      { question: `What are the main benefits of using ${technology} in a modern web app?`, difficulty: "intermediate", topic: technology },
      { question: `Explain the difference between REST and GraphQL.`, difficulty: "intermediate", topic: "API design" },
      { question: `How do you manage state in a React application?`, difficulty: "intermediate", topic: "React" },
      { question: `What is middleware in Express.js and when would you use it?`, difficulty: "beginner", topic: "Express.js" },
      { question: `How would you secure a Node.js API endpoint?`, difficulty: "intermediate", topic: "security" },
    ],
    projectQuestions: [
      { question: "Describe one of your key projects and the problem it solved.", expectedAnswer: "Explain project goal, your role, technologies used, and outcome." },
      { question: "What performance improvements did you make in your project?", expectedAnswer: "Mention caching, code optimization, or rendering improvements." },
      { question: "How did you decide which tools or libraries to use?", expectedAnswer: "Discuss tradeoffs and why the chosen stack was appropriate." },
      { question: "How did you handle user authentication or data storage?", expectedAnswer: "Describe the authentication flow and database choice." },
      { question: "What was the biggest challenge in your project and how did you solve it?", expectedAnswer: "Outline the problem, analysis, and fix." },
    ],
    systemDesignQuestions: [
      { question: "Design a simple task management system for web users.", complexity: "medium" },
      { question: "How would you architect a scalable backend for a resume application?", complexity: "medium" },
      { question: "Describe how you would add search and filtering to a project dashboard.", complexity: "easy" },
    ],
    behavioralQuestions: [
      { question: "Tell me about a time you learned a new technology quickly.", relatedTo: "learning agility" },
      { question: "Describe how you handled feedback on your code or project.", relatedTo: "team collaboration" },
      { question: "How do you manage your work when deadlines are tight?", relatedTo: "time management" },
      { question: "What do you do when you encounter a bug you do not immediately understand?", relatedTo: "problem solving" },
      { question: "Describe a time when you had to explain a technical decision to a non-technical stakeholder.", relatedTo: "communication" },
    ],
  };
};

export const analyzeResumeText = async (resumeText) => {
  const prompt = `You are an expert technical interviewer and elite resume reviewer. Your task is to dynamically analyze the provided resume text by benchmarking it against the absolute highest industry standards for their specific career path (e.g., MERN/Full-Stack, DevOps/Cloud, Backend/Systems, Frontend, or AI/ML).

---
CRITICAL SCORING RULES:

1. DOMAIN-SPECIFIC EVALUATION: Identify the candidate's core domain. Rate strictly on THAT stack depth. Do NOT penalize for unrelated skills.

2. TECHNICAL SKILLS & PROJECTS SCORING (IMPORTANT):
   - Minimum scores: technicalSkillsScore MUST be 70-80% minimum
   - Minimum scores: projectsScore MUST be 70-80% minimum
   - If resume mentions 2+ meaningful projects with good descriptions, give 85-95%
   - If resume has 3+ projects with impact metrics, give 90-95%

3. AI/ML BONUS WEIGHTAGE (HIGHEST PRIORITY):
   - If resume mentions Machine Learning, Deep Learning, NLP, LLMs, Computer Vision, Transformer models, TensorFlow, PyTorch, etc., AUTOMATICALLY add +15-25 points to:
     * overallScore (bump to 85-95+ if technical is solid)
     * technicalSkillsScore (ensure 85-95+)
   - Even if other metrics are lower, AI/ML skills get premium boost
   - Multiple AI/ML projects = extra +10 bonus

4. HIGH-TIER STANDARDS: 
   - Top institutions (IIT, NIT, BITS, IIIT), competitive exam ranks (GATE, NIMCET) = +5-10 bonus points
   - Well-structured bullet points with action verbs = +5 bonus
   - Quantified achievements (numbers, metrics) = +5 bonus

5. EXPERIENCE SCORE: If fresher/student, minimum 65%. If 1+ internship = 75%+. If 2+ experience = 85%+.

6. EDUCATION SCORE: Tier-1 institutions = 90%, Tier-2 = 80%, Others = 70%.

Output ONLY valid JSON. No markdown. Use this exact schema:
{"overallScore": number (0-100), "atsScore": number (0-100), "grammarScore": number (0-100), "formattingScore": number (0-100), "technicalSkillsScore": number (70-100), "projectsScore": number (70-100), "experienceScore": number, "educationScore": number, "strengths": [], "weaknesses": [], "missingKeywords": [], "missingTechnicalSkills": [], "suggestedCertifications": [], "suggestedProjects": [], "suggestedImprovements": [], "topPriorityImprovements": [], "finalSummary": ""}

Return:
- At least 5 strengths and 5 weaknesses
- 10 missing keywords and 10 missing technical skills
- 5 relevant project ideas
- 10 improvement suggestions

Resume:
${resumeText}`;

  try {
    const candidateText = await callGeminiAPI(prompt);
    const cleanedResponse = candidateText.replace(/```json|```/gi, "").trim();
    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? cleanedResponse.slice(jsonStart, jsonEnd + 1) : cleanedResponse;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Failed to parse Gemini analysis JSON: ${error.message}`);
    }

    // Enforce minimum scores
    const technicalSkillsScore = Math.max(Number(parsed.technicalSkillsScore || 0), 70);
    const projectsScore = Math.max(Number(parsed.projectsScore || 0), 70);

    return {
      overallScore: Math.min(Number(parsed.overallScore || 0), 100),
      atsScore: Math.min(Number(parsed.atsScore || 0), 100),
      grammarScore: Math.min(Number(parsed.grammarScore || 0), 100),
      formattingScore: Math.min(Number(parsed.formattingScore || 0), 100),
      technicalSkillsScore: Math.min(technicalSkillsScore, 100),
      projectsScore: Math.min(projectsScore, 100),
      experienceScore: Math.min(Number(parsed.experienceScore || 0), 100),
      educationScore: Math.min(Number(parsed.educationScore || 0), 100),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      missingTechnicalSkills: Array.isArray(parsed.missingTechnicalSkills) ? parsed.missingTechnicalSkills : [],
      suggestedCertifications: Array.isArray(parsed.suggestedCertifications) ? parsed.suggestedCertifications : [],
      suggestedProjects: Array.isArray(parsed.suggestedProjects) ? parsed.suggestedProjects : [],
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) ? parsed.suggestedImprovements : [],
      topPriorityImprovements: Array.isArray(parsed.topPriorityImprovements) ? parsed.topPriorityImprovements : [],
      finalSummary: String(parsed.finalSummary || ""),
    };
  } catch (error) {
    console.warn("Gemini API unavailable or failed, using local fallback analysis:", error.message);
    return buildFallbackAnalysis(resumeText);
  }
};

export const generateAISuggestions = async (resumeText, analysis) => {
  try {
    const prompt = `Based on the following resume and its analysis, provide detailed AI-driven actionable suggestions to improve the candidate's resume and career prospects.

Resume:
${resumeText}

Current Analysis:
${JSON.stringify(analysis, null, 2)}

Provide a comprehensive JSON response with this exact structure:
{
  "sections": [
    {"title": "string", "suggestions": ["string", "string", ...], "priority": "high|medium|low"},
    ...
  ],
  "quickWins": ["string", "string", ...],
  "longTermStrategy": "string",
  "estimatedImpact": "string"
}

Focus on:
1. How to restructure existing content for better impact
2. Keywords to add for ATS optimization
3. Metrics and quantification opportunities
4. Stronger action verbs and achievement framing
5. Technical depth demonstration`;

    const candidateText = await callGeminiAPI(prompt);
    const cleanedResponse = candidateText.replace(/```json|```/gi, "").trim();
    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? cleanedResponse.slice(jsonStart, jsonEnd + 1) : cleanedResponse;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Failed to parse AI suggestions JSON`);
    }

    return parsed;
  } catch (error) {
    console.warn("Gemini AI suggestions unavailable, using fallback suggestions:", error.message);
    return createAISuggestionsFallback(resumeText, analysis);
  }
};

export const generateCoverLetter = async (resumeText, analysis, jobDescription = "") => {
  try {
    const jobContext = jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : "";
    const prompt = `Based on the following resume, create a professional cover letter that highlights the candidate's strengths and aligns with their career goals.

Resume:
${resumeText}

Resume Analysis Summary:
${analysis.finalSummary}

Key Strengths:
${analysis.strengths.slice(0, 3).join(", ")}
${jobContext}

Generate a well-structured cover letter in JSON format:
{
  "letterContent": "Full professional cover letter text",
  "sections": {
    "opening": "Engaging opening paragraph",
    "bodyHighlights": ["Key achievement 1", "Key achievement 2", "Key achievement 3"],
    "closing": "Strong closing paragraph"
  },
  "tone": "professional|enthusiastic|technical"
}`;

    const candidateText = await callGeminiAPI(prompt);
    const cleanedResponse = candidateText.replace(/```json|```/gi, "").trim();
    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? cleanedResponse.slice(jsonStart, jsonEnd + 1) : cleanedResponse;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Failed to parse cover letter JSON`);
    }

    return parsed;
  } catch (error) {
    console.warn("Gemini cover letter unavailable, using fallback cover letter:", error.message);
    return createCoverLetterFallback(resumeText, analysis, jobDescription);
  }
};

export const generateInterviewQuestions = async (resumeText, analysis) => {
  try {
    const prompt = `Based on the following resume and the candidate's technical background, generate relevant interview questions that specifically target the technologies, projects, and experiences mentioned in their resume.

Resume:
${resumeText}

Resume Analysis:
${JSON.stringify(analysis, null, 2)}

Generate targeted interview questions in JSON format:
{
  "technicalQuestions": [
    {"question": "string", "difficulty": "beginner|intermediate|advanced", "topic": "technology/concept mentioned in resume"},
    ...
  ],
  "projectQuestions": [
    {"question": "string about a specific project", "expectedAnswer": "brief expected response"},
    ...
  ],
  "systemDesignQuestions": [
    {"question": "string", "complexity": "easy|medium|hard"},
    ...
  ],
  "behavioralQuestions": [
    {"question": "string", "relatedTo": "specific skill or experience"},
    ...
  ]
}

Rules:
1. Ask about EXACT technologies mentioned in the resume (e.g., if they mention React, ask React-specific questions)
2. Questions should be progressively harder
3. Include at least 5 questions per category
4. Avoid generic questions - make them specific to the candidate's experience
5. If they mention projects, ask follow-up questions about design decisions`;

    const candidateText = await callGeminiAPI(prompt);
    const cleanedResponse = candidateText.replace(/```json|```/gi, "").trim();
    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? cleanedResponse.slice(jsonStart, jsonEnd + 1) : cleanedResponse;

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`Failed to parse interview questions JSON`);
    }

    return parsed;
  } catch (error) {
    console.warn("Gemini interview questions unavailable, using fallback questions:", error.message);
    return createInterviewQuestionsFallback(resumeText, analysis);
  }
};

