import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

/**
 * Call OpenAI Chat Completions with strict JSON output.
 * Retries up to `retries` times on transient errors.
 *
 * NOTE: `temperature` is intentionally NOT set — GPT-5 family rejects
 * non-default temperature values. JSON mode + clear prompts give us
 * the determinism we need.
 */
export async function callOpenAIJson(
  prompt: string,
  retries: number = 2,
  model: string = DEFAULT_MODEL
): Promise<any> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a precise assistant that always responds with valid JSON. Never include markdown fences or extra commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch (err: any) {
      lastError = err;
      console.error(`[openai] attempt ${attempt + 1} failed:`, err?.message || err);

      // Don't retry on 4xx errors (bad request, auth, etc.) — they won't succeed
      if (err?.status && err.status >= 400 && err.status < 500) {
        throw err;
      }

      // Exponential backoff for retries
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error("OpenAI call failed after retries");
}
