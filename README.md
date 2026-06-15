# Resume Tailor

AI resume builder. Upload your resume, paste a job description, get a tailored ATS-friendly resume in under 30 seconds.

Built by [Harsha Asapu](https://harshaasapu.com).

---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI API (gpt-4o-mini)
- Upstash Redis (rate limiting)
- @react-pdf/renderer (PDF export)
- docx (Word export)
- pdfjs-dist + mammoth (client-side parsing)

## Setup

```bash
# 1. Install
npm install

# 2. Set up env vars
cp .env.example .env
# Then edit .env and add:
#   - OPENAI_API_KEY
#   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
#     (free at https://upstash.com — create a Redis database)

# 3. Run
npm run dev
```

Open http://localhost:3000.

## Why this exists

The original version of this tool was a Streamlit app. It worked, but Streamlit puts apps to sleep after 24 hours of inactivity. Users would click the link, wait 30+ seconds for cold-start, and lose trust before the product even loaded.

The break wasn't features. It was availability. This Next.js version on Vercel is always warm, always fast.

## Rate limits (per IP, per day)

- Analyze: 20
- Rewrite: 10
- Generate: 5
- Cover letter: 5

Adjust in `.env` if needed.
