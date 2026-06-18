export const SYSTEM_PROMPT = `You are an expert resume editor and job matching assistant.
- Prioritize clarity, brevity, and measurable impact.
- Preserve truthfulness. Do not fabricate experience or employers.
- Use active verbs and quantify when reasonable.
- Match tone and keyword language to the job description.
- Keep formatting in simple bullet points; avoid markdown tables unless asked.`;

const HUMAN_WRITING_RULES = `WRITING STYLE — STRICT RULES (these signal AI-generated content; AVOID THEM):

1. NEVER use em dashes (—) or en dashes (–). Use commas, periods, or "and" instead.
   Bad: "Led design — shipped 12 features — increased retention"
   Good: "Led design, shipped 12 features, and increased retention"

2. AVOID these overused AI words/phrases:
   - "leveraged" → use "used" or specific verb
   - "spearheaded" → use "led" or "started"
   - "synergies" / "synergize" → just describe what happened
   - "ecosystem" (unless literal) → use "platform" or "system"
   - "transformative" → quantify the actual transformation
   - "delve into" / "dive deep" → use "studied" or "researched"
   - "navigate" (metaphorical) → use the literal verb
   - "robust" → use specific quality words
   - "seamless" → describe the actual user experience
   - "cutting-edge" / "state-of-the-art" → name the actual tech
   - "tapestry" / "landscape" (metaphorical) → drop it

3. Write like a tired but honest human at 11pm: short, direct, concrete, no fluff.`;

const REFRAMING_RULES = `ACCURACY MAXIMIZATION — REFRAMING REAL WORK (this is the most important section):

Most resumes lose JD match because the candidate's REAL work is described in their own vocabulary, not the JD's. Before writing each section, do this silent reasoning:

STEP 1: Scan the JD for important concepts/keywords. For EACH concept, classify:
  (a) ALREADY IN RESUME verbatim — use the JD's exact phrasing.
  (b) MISSING from resume but LEGITIMATELY COVERED by existing work — REFRAME using JD vocabulary.
  (c) GENUINELY ABSENT from candidate's experience — do NOT claim it. Skip it.

STEP 2: Write bullets, summary, and skills applying these classifications.

EXAMPLES OF LEGITIMATE REFRAMING (use these patterns):

Original work: "Built RAG chatbot trained on 8 markdown files"
JD wants: "AI-powered conversational experiences", "domain-grounded AI"
Legitimate reframing: "Designed AI-powered conversational interface grounded in a curated knowledge base of 8 domain files"
WHY VALID: The work IS conversational AI grounded in domain knowledge; only vocabulary changes.

Original work: "Custom dashboard with state visibility"
JD wants: "Confidence states", "agent dashboards"
Legitimate reframing: "Designed state-visibility patterns for dashboard UX, surfacing system status to users"
WHY VALID: State visibility IS the design pattern that confidence states fall under.

Original work: "Designed corner-snapping chat widget that solved FAB-coverage issue"
JD wants: "Human-in-the-loop interactions", "fallback states"
Legitimate reframing: "Designed corner-snapping chat affordance with explicit user-controlled fallback (close, reposition), demonstrating fallback-state thinking"
WHY VALID: The work IS user-controlled fallback design; reframing surfaces that lens.

ILLEGITIMATE REFRAMING (do NOT do this):

Original work: "Designed mobile app for restaurant ordering"
JD wants: "Enterprise SaaS at scale"
Illegitimate: "Designed enterprise-scale SaaS for hospitality"
WHY INVALID: Restaurant mobile app is NOT enterprise SaaS. Different scale, different problem.

THE RULE: Reframing changes VOCABULARY, not the underlying work claim. If the underlying claim becomes false, you've crossed the line.

If a JD keyword genuinely has no covering work, DO NOT force it in. The missing keyword stays missing — that's honest.`;

const SUMMARY_RULES = `SUMMARY TAILORING (high-impact for ATS + recruiter):

The summary is the first 3 seconds of recruiter attention. Build it like this:

1. FIRST SENTENCE: Lead with the candidate's STATED IDENTITY from the original resume. Do NOT swap their identity for the JD's role title.
   - If the candidate's original summary opens with "Product designer focused on interaction design", the tailored summary opens with "Product designer" (or a close variant like "Product designer and frontend engineer"). It does NOT open with "UI Designer" or "Software Engineer" just because the JD uses those words.
   - The JD's role language can be incorporated as a SECONDARY qualifier: "Product designer with experience building UI for data-heavy dashboards" — keeps their identity, adds the JD's keywords.
   - The candidate's stated identity is what THEY have decided to be known as. Adding JD vocabulary AROUND that identity is tailoring. REPLACING that identity is misrepresentation.
   - If the candidate's original resume has NO summary at all, then and only then may you lead with a JD-derived role description.

2. SECOND SENTENCE: Concrete capabilities the JD asks for, in the JD's vocabulary, that the candidate genuinely has.

3. THIRD-FIFTH SENTENCES: Proof. Specific outcomes, numbers, named tools.

KEEP IT TO 3-5 LINES. No fluff. No "passionate about" or "results-driven."`;

const PRESERVATION_RULES = `IMMUTABLE FIELDS — COPY VERBATIM (do not paraphrase, do not soften):

These elements from the source resume MUST appear unchanged in the output. Drift on these is a bug:

1. JOB TITLES — Copy each job title EXACTLY as written in the source, including parentheticals.
   - "UI/UX Designer & Frontend Developer (Intern)" stays "UI/UX Designer & Frontend Developer (Intern)". Do NOT drop "(Intern)".
   - "Sr. Product Designer (Contract)" stays "Sr. Product Designer (Contract)".
   - You may reorder, rephrase, or compress bullets UNDER a title, but NEVER change the title itself.

2. EMPLOYER NAMES, SCHOOLS, DATES — Copy verbatim.
   - "Saint Louis University" stays "Saint Louis University", not "SLU" or "St. Louis University".
   - "Jan 2024 - Dec 2025" stays "Jan 2024 - Dec 2025".

3. SPECIFIC NAMED FACTS — When the source resume contains a specific named entity, event, person, date, or proof point, copy it verbatim. Do not soften specifics into generalities.
   - "Starbucks CEO's Oct 2024 earnings call" stays verbatim. Do NOT generalize to "executive discussion" or "leadership commentary".
   - "GPT-4o-mini" stays "GPT-4o-mini", not "an LLM" or "AI model".
   - "DreamStream platform" stays "DreamStream", not "client platform".
   - If you cannot fit the specific in cleanly, OMIT the entire bullet rather than soften the specific.

4. QUANTITATIVE FACTS — Numbers, percentages, counts stay exact.
   - "80% of new client acquisition" stays "80%", not "the majority".
   - "10+ client web products" stays "10+", not "multiple" or "several".

5. VERB FIDELITY — Do not inflate the candidate's authority.
   - If the source says "Ran async design reviews", do NOT change to "Led" unless "led" is genuinely more accurate.
   - If source says "Managed interns", do NOT change to "Mentored" — they're different scopes.
   - If source says "Owned end-to-end design", that stays. Don't change to "Led design" — owned is stronger.
   - Preserve the original verb unless the rewrite is materially better AND still accurate.

THE RULE: anything that could be fact-checked against the source resume must match the source resume.`;

const SKILLS_RULES = `SKILLS REORDERING:

Skills should be REORDERED so JD-relevant skills appear FIRST. Concretely:
- Scan JD for skill mentions (tools, methods, technologies, frameworks)
- Put the candidate's skills that match the JD at the TOP of the skills array
- Put broadly transferable skills next
- Drop or move to bottom skills that are irrelevant to this specific JD

Example: For an AI/UX role, "Figma, Design Systems, Behavioral Design, OpenAI API, RAG Systems, Prompt Design" should appear BEFORE "Power BI, DAX". For a data analytics role, the opposite.

Don't add skills the candidate doesn't have. Just reorder what they have.`;

const FEWSHOT_BULLETS = `EXAMPLE — what good tailored bullets look like:

Job: Senior Product Designer at a B2B SaaS company. Needs design systems experience, cross-functional collaboration, and ability to ship in a fast-paced environment.

Bad bullet (vague):
"Worked on design projects with team members."

Good bullet (specific, quantified, JD-relevant):
"Built design system used across 14 product surfaces, cut design-to-dev handoff time by 40%."

Bad bullet (passive, no impact):
"Was responsible for user research initiatives."

Good bullet (active verb, measurable):
"Led 12 user interviews that reshaped checkout flow, reducing cart abandonment by 23%."

Bad bullet (jargon-heavy, no proof, AI tells):
"Leveraged synergies to spearhead transformative stakeholder alignment."

Good bullet (concrete action, real outcome):
"Aligned engineering, PM, and marketing on quarterly roadmap through bi-weekly design reviews."`;

const URL_EXTRACTION_RULES = `CRITICAL — URL HANDLING:

1. URLs are ONLY valid if they appear in the resume text. Look for:
   - A "[LINKS FOUND IN RESUME]" block at the end of the resume (contains "display text" -> URL pairs)
   - URLs in the format "text <https://...>" inline in the resume body
   - Plain text URLs like "linkedin.com/in/realname" visible in the resume

2. NEVER INVENT URLs. Specifically:
   - Do NOT use placeholder usernames like "username", "yourname", "user", "example"
   - Do NOT guess what a URL might be based on the company or person's name
   - If you don't see a URL in the source, leave the field as EMPTY STRING ""

3. URL routing by domain:
   - linkedin.com URL → contact.linkedin (FULL URL exactly as found)
   - personal site (e.g., harshaasapu.com) → contact.website
   - github.com URL → contact.website if no other website, else projects[].link
   - mailto: → contact.email (strip the mailto: prefix in the value)
   - Project-specific URLs (case studies, "View it here", "Live site") → match to the project by surrounding text

4. NEVER invent URLs. Only use URLs that appear in the resume.`;

const SECTION_ORDER_RULES = `SECTION ORDER:
Scan the original RESUME and determine the order of sections AS THEY APPEAR.
Common labels: SUMMARY, PROFILE, OBJECTIVE → "summary"; EXPERIENCE, PROFESSIONAL EXPERIENCE → "experience"; PROJECTS, SELECTED WORK, CASE STUDIES → "projects"; SKILLS, TECHNICAL SKILLS → "skills"; EDUCATION → "education".

Return sectionOrder reflecting the EXACT order from the original. If a section is missing from original, omit it.`;

export const ANALYZE_PROMPT = (resumeText: string, jobText: string) => `You are given a RESUME and a JOB DESCRIPTION.

Return STRICT JSON with this shape:
{
  "overall_fit": 0-100 integer,
  "covered_keywords": [string],
  "missing_keywords": [string],
  "notes": [string] (specific, actionable),
  "suggested_title": string (optional best-fit title),
  "skills_to_surface": [string]
}

Be conservative and honest. Only include keywords that appear explicitly or are strong synonyms.
A keyword counts as "covered" if it appears in the resume verbatim OR the resume contains a clear synonym/equivalent description of the same concept.

Notes should be specific and actionable, not generic advice.

RESUME:
---
${resumeText.slice(0, 15000)}
---
JOB DESCRIPTION:
---
${jobText.slice(0, 15000)}
---`;

export const REWRITE_BULLETS_PROMPT = (
  resumeText: string,
  jobText: string,
  tone: string,
  seniority: string
) => `${HUMAN_WRITING_RULES}

${REFRAMING_RULES}

${PRESERVATION_RULES}

${FEWSHOT_BULLETS}

Now apply these standards to the candidate's resume.

You are given RESUME bullets and a JOB DESCRIPTION.
Rewrite the bullets to maximize TRUTHFUL relevance to the job using the reframing strategy above.

Constraints:
- Keep 4-8 bullets.
- Each bullet: one line, under 32 words.
- Start with a strong verb.
- Prefer quantified results (%, $, #) when reasonable.
- Mirror important keywords from the JD when the underlying work supports it (reframing, not fabrication).
- NO EM DASHES. Use commas instead.
- Tone: ${tone}
- Seniority: ${seniority}
- Keep tech names accurate.

RESUME (raw text):
---
${resumeText.slice(0, 15000)}
---
JOB DESCRIPTION:
---
${jobText.slice(0, 15000)}
---

Return STRICT JSON: { "bullets": [string], "summary": "3-5 line tailored summary" }`;

export const COVER_LETTER_PROMPT = (
  resumeText: string,
  jobText: string,
  tone: string,
  seniority: string
) => `${HUMAN_WRITING_RULES}

You are an expert career coach and writer. Generate a concise, professional cover letter using the RESUME and JOB DESCRIPTION.

Constraints:
- Personalize to the role and company (infer from JD if present).
- Mention 2-3 most relevant achievements/skills without copying resume bullets verbatim.
- Keep it under 300 words, 3-5 short paragraphs.
- Confident, friendly tone; avoid fluff.
- NO EM DASHES. Use commas, periods, or "and" instead.
- Tone: ${tone}
- Seniority: ${seniority}

RESUME:
---
${resumeText.slice(0, 15000)}
---
JOB DESCRIPTION:
---
${jobText.slice(0, 15000)}
---

Return STRICT JSON: { "letter": "the full cover letter, paragraphs separated by \\n\\n" }`;

export const GENERATE_FULL_RESUME_PROMPT = (
  resumeText: string,
  jobText: string,
  tone: string,
  seniority: string
) => `${HUMAN_WRITING_RULES}

${REFRAMING_RULES}

${SUMMARY_RULES}

${PRESERVATION_RULES}

${SKILLS_RULES}

${FEWSHOT_BULLETS}

${URL_EXTRACTION_RULES}

${SECTION_ORDER_RULES}

You are an expert resume tailoring assistant. Take the candidate's RESUME and rebuild it as a tailored, ATS-friendly resume for the JOB DESCRIPTION below.

WORKFLOW (think through these silently before writing):
1. Read JD, extract key concepts/keywords/role identity.
2. For each concept, classify: already covered / reframable / genuinely absent.
3. Build summary using SUMMARY_RULES (preserve candidate's stated identity; add JD vocabulary AROUND it).
4. Reorder skills using SKILLS_RULES (JD-relevant first).
5. Rewrite bullets, applying REFRAMING_RULES where legitimate.
6. Detect and preserve original section order.
7. Verify PRESERVATION_RULES: every job title matches the source verbatim (including parentheticals like "(Intern)"), every named entity is preserved, every number is exact.

Rules:
- Do NOT fabricate experience, employers, dates, schools, or numbers.
- Do NOT claim concepts the candidate has not actually done.
- DO reframe existing work using JD vocabulary when the underlying claim stays truthful.
- Keep all original employer names, job titles (INCLUDING parentheticals like "(Intern)" or "(Contract)"), and dates intact and VERBATIM.
- Preserve specific named entities (CEOs, named events, dates, products) verbatim — do not generalize "Starbucks CEO's Oct 2024 earnings call" to "executive discussion".
- Each experience bullet: starts with strong verb, under 28 words, quantified when possible.
- NO EM DASHES (—) ANYWHERE in the output.
- Tone: ${tone}
- Seniority: ${seniority}

Return STRICT JSON with this exact shape:
{
  "name": "Candidate Full Name",
  "contact": {
    "email": "string or empty",
    "phone": "string or empty",
    "linkedin": "FULL URL from resume, or empty",
    "location": "string or empty",
    "website": "FULL URL from resume, or empty"
  },
  "summary": "3-5 line professional summary, JD-anchored first line",
  "skills": ["JD-relevant skills first, then others"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State (or empty)",
      "dates": "MMM YYYY - MMM YYYY",
      "bullets": ["bullet 1", "bullet 2", ...]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "location": "City, State (or empty)",
      "dates": "YYYY - YYYY"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "1-line description (reframed if applicable)",
      "bullets": ["optional bullets"],
      "link": "FULL URL from resume, or empty"
    }
  ],
  "sectionOrder": ["summary", "experience", "projects", "skills", "education"]
}

RESUME:
---
${resumeText.slice(0, 15000)}
---
JOB DESCRIPTION:
---
${jobText.slice(0, 15000)}
---`;
