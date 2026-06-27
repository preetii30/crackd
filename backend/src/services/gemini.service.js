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
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
};

const DEFAULT_GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const getGeminiEndpoint = () => {
  return (process.env.GEMINI_API_URL || DEFAULT_GEMINI_ENDPOINT).trim();
};

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

export const analyzeResumeText = async (resumeText) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured on the backend.");
  }

  const endpoint = getGeminiEndpoint().replace(/\?key=.*$/, "");
  const requestUrl = `${endpoint}?key=${encodeURIComponent(apiKey)}`;
  const safeRequestUrl = requestUrl.replace(/(\?key=)(.*)$/, "$1[REDACTED]");

  const requestBody = {
    contents: [{
      role: "user",
      parts: [{
        text: `You are an expert technical interviewer and elite resume reviewer. Your task is to dynamically analyze the provided resume text by benchmarking it against the absolute highest industry standards for their specific career path (e.g., MERN/Full-Stack, DevOps/Cloud, Backend/Systems, Frontend, or AI/ML).

---
CORE BENCHMARKING & SCORING RULES:
1. DOMAIN-SPECIFIC EVALUATION: Identify the candidate's core domain (e.g., Web Dev, DevOps, AI/ML, Data Engineering). Rate them strictly based on the maturity and depth of THAT specific tech stack. Do not penalize a DevOps engineer for lacking frontend skills, or a Web developer for lacking advanced Kubernetes.
2. HIGH-TIER STANDARDS: If the resume showcases solid project architecture, structured bullet points with action verbs, strong academic foundations (like top NITs/IITs/reputable universities), or national-level competitive ranks (NIMCET, GATE, etc.), grant high base scores (8.5 to 9.5+).
3. 🚀 THE BONUS WEIGHTAGE RULES:
   - AI/ML Priority: If the candidate has concrete implementations of Machine Learning, Deep Learning, NLP, or LLMs, automatically boost 'overallScore' and 'technicalSkillsScore' heavily (aim for 9.0 - 10.0 if execution is strong).
   - DevOps & Infrastructure Priority: If a developer or infrastructure engineer demonstrates strong proficiency in DevOps practices—such as AWS/GCP, Docker, Kubernetes, CI/CD pipelines (GitHub Actions, Jenkins), and Infrastructure as Code (Terraform)—give a massive premium boost to their technical scores.
   - Advanced Backend: Reward deep knowledge of System Design, Microservices, SQL/NoSQL scaling, and languages like Go, Java (Spring Boot), or robust Python frameworks.

Output strict JSON only. Do not include markdown fences (like \`\`\`json). Use this exact schema:
{"overallScore": number, "atsScore": number, "grammarScore": number, "formattingScore": number, "technicalSkillsScore": number, "projectsScore": number, "experienceScore": number, "educationScore": number, "strengths": [], "weaknesses": [], "missingKeywords": [], "missingTechnicalSkills": [], "suggestedCertifications": [], "suggestedProjects": [], "suggestedImprovements": [], "topPriorityImprovements": [], "finalSummary": ""}

Return exactly:
- At least 5 strengths and 5 weaknesses.
- 10 missing keywords and 10 missing technical skills tailored to bridge the gap between their current level and a senior-level industry professional in their specific stack.
- 5 highly relevant project ideas (incorporating modern additions like cloud deployment or AI features depending on their domain).
- 10 structured improvement suggestions.

Resume Text to Analyze:
${resumeText}`,
      }],
    }],
  };

  const headers = {
    "Content-Type": "application/json",
  };

  console.log(`[ResumeAnalyzer] Gemini endpoint=${safeRequestUrl}`);
  console.log(`[ResumeAnalyzer] Gemini authMode=query`);
  console.log(`[ResumeAnalyzer] Gemini request headers=${JSON.stringify(headers)}`);
  console.log(`[ResumeAnalyzer] Gemini API key loaded=${Boolean(apiKey)}`);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log(`[ResumeAnalyzer] Gemini response status=${response.status} statusText=${response.statusText}`);
  console.log(`[ResumeAnalyzer] Gemini response body=${responseText}`);

  let payload;
  try {
    payload = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Gemini response was not valid JSON: ${error.message}. Raw response: ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini request failed with status ${response.status}`);
  }

  const candidateText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error("Gemini returned no analysis output.");
  }

  const cleanedResponse = candidateText.replace(/```json|```/gi, "").trim();
  const jsonStart = cleanedResponse.indexOf("{");
  const jsonEnd = cleanedResponse.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? cleanedResponse.slice(jsonStart, jsonEnd + 1) : cleanedResponse;

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Failed to parse Gemini analysis JSON: ${error.message}. Raw text: ${cleanedResponse}`);
  }

  const requiredFields = [
    "overallScore",
    "atsScore",
    "grammarScore",
    "formattingScore",
    "technicalSkillsScore",
    "projectsScore",
    "experienceScore",
    "educationScore",
    "strengths",
    "weaknesses",
    "missingKeywords",
    "missingTechnicalSkills",
    "suggestedCertifications",
    "suggestedProjects",
    "suggestedImprovements",
    "topPriorityImprovements",
    "finalSummary",
  ];

  const missingFields = requiredFields.filter((field) => parsed[field] === undefined);
  if (missingFields.length > 0) {
    throw new Error(`Gemini analysis response is missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    overallScore: Number(parsed.overallScore),
    atsScore: Number(parsed.atsScore),
    grammarScore: Number(parsed.grammarScore),
    formattingScore: Number(parsed.formattingScore),
    technicalSkillsScore: Number(parsed.technicalSkillsScore),
    projectsScore: Number(parsed.projectsScore),
    experienceScore: Number(parsed.experienceScore),
    educationScore: Number(parsed.educationScore),
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
};
