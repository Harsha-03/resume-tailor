export type Tone = "neutral" | "impactful" | "conservative" | "friendly";
export type Seniority = "entry-level" | "mid-level" | "senior";
export type OutputFormat = "docx" | "pdf";
export type TemplateId = "minimal" | "modern" | "classic";
export type SectionId = "summary" | "experience" | "projects" | "skills" | "education";

export interface AnalyzeResult {
  matchScore: number;
  overallFit: number;
  coveredKeywords: string[];
  missingKeywords: string[];
  notes: string[];
  suggestedTitle?: string;
  skillsToSurface: string[];
  topJdTerms: string[];
}

export interface RewriteResult {
  bullets: string[];
  summary: string;
}

export interface TailoredResume {
  name: string;
  contact: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    website?: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    dates: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    bullets?: string[];
    link?: string;
  }>;
  /* Order of sections as they appeared in the ORIGINAL resume.
   * Default if missing: ["summary", "experience", "projects", "skills", "education"] */
  sectionOrder?: SectionId[];
}

export interface AIRequest {
  resumeText: string;
  jobText: string;
  tone?: Tone;
  seniority?: Seniority;
}

export interface Slot {
  id: string;
  name: string;
  resumeText: string;
  resumeFileName: string;
  jobText: string;
  tone: Tone;
  seniority: Seniority;
  template: TemplateId;
  lastResult?: AnalyzeResult;
  tailoredResume?: TailoredResume;
  tailoredScore?: number;
  coverLetterText?: string;
  updatedAt: number;
  createdAt: number;
}

export interface WorkspaceState {
  slots: Slot[];
  activeSlotId: string | null;
}

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  "summary",
  "experience",
  "projects",
  "skills",
  "education",
];
