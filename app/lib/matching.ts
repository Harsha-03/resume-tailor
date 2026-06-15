/* TF-IDF cosine similarity matcher. */

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","so","of","for","to","from","in",
  "on","at","by","with","as","is","are","was","were","be","been","being",
  "this","that","these","those","it","its","i","you","he","she","we","they",
  "my","your","our","their","me","him","her","us","them","will","can","could",
  "should","would","may","might","do","does","did","done","over","into","per",
]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[!"$%&'()*,\-./:;<=>?@[\\\]^_`{|}~]/g, " ");
}

function tokenize(text: string): string[] {
  const cleaned = normalize(text);
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t) && !/^\d+$/.test(t) && t.length >= 2);

  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return [...tokens, ...bigrams];
}

function unigrams(text: string): string[] {
  const cleaned = normalize(text);
  return cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t) && !/^\d+$/.test(t) && t.length >= 2);
}

function tfidfVector(
  docTokens: string[],
  df: Map<string, number>,
  N: number
): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of docTokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  const L = Math.max(1, docTokens.length);
  const vec = new Map<string, number>();
  for (const [term, freq] of tf.entries()) {
    const dfi = df.get(term) || 0;
    const idf = Math.log((1 + N) / (1 + dfi)) + 1.0;
    vec.set(term, (freq / L) * idf);
  }
  return vec;
}

function cosineSparse(
  v1: Map<string, number>,
  v2: Map<string, number>
): number {
  let dot = 0;
  for (const [k, a] of v1.entries()) {
    const b = v2.get(k);
    if (b !== undefined) dot += a * b;
  }
  let n1 = 0;
  for (const a of v1.values()) n1 += a * a;
  n1 = Math.sqrt(n1);
  let n2 = 0;
  for (const b of v2.values()) n2 += b * b;
  n2 = Math.sqrt(n2);
  if (n1 === 0 || n2 === 0) return 0;
  return dot / (n1 * n2);
}

export interface TfidfResult {
  score: number;
  topJdTerms: string[];
}

export function tfidfMatchScore(
  resumeText: string,
  jobText: string
): TfidfResult {
  if (!resumeText.trim() || !jobText.trim()) {
    return { score: 0, topJdTerms: [] };
  }

  const jdToks = tokenize(jobText);
  const cvToks = tokenize(resumeText);

  const df = new Map<string, number>();
  for (const t of new Set(jdToks)) df.set(t, 1);
  for (const t of new Set(cvToks)) {
    df.set(t, (df.get(t) || 0) + 1);
  }
  const N = 2;

  const jdVec = tfidfVector(jdToks, df, N);
  const cvVec = tfidfVector(cvToks, df, N);

  const sim = Math.max(0, Math.min(1, cosineSparse(jdVec, cvVec)));
  const score = Math.round(sim * 100);

  const topTerms = [...jdVec.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term]) => term);

  return { score, topJdTerms: topTerms };
}

export interface CoverageResult {
  covered: string[];
  missing: string[];
}

export function coverage(resumeText: string, jobText: string): CoverageResult {
  const cv = new Set(unigrams(resumeText));
  const jd = new Set(unigrams(jobText));

  const covered: string[] = [];
  const missing: string[] = [];

  for (const term of jd) {
    if (cv.has(term)) covered.push(term);
    else missing.push(term);
  }
  return {
    covered: covered.sort(),
    missing: missing.sort(),
  };
}
