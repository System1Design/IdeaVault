// Works with any OpenAI-compatible API (Groq, OpenRouter, Ollama, ...).
// Configure it with AI_BASE_URL, AI_API_KEY and AI_MODEL in .env

const TIMEOUT_MS = 20000;

const SYSTEM_PROMPT =
  "You organize raw ideas into a structured format. " +
  "Reply with ONLY a valid JSON object. No markdown, no explanation. " +
  "Use exactly these keys: " +
  "title (short, max 8 words), problem (1-2 sentences), solution (1-2 sentences), " +
  "audience (who it is for), category (one or two words), " +
  "nextSteps (array of 3 to 5 short action steps). " +
  "Write in the same language as the idea.";

class UpstreamError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`AI service returned ${status}: ${body}`);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseIdea(content: string) {
  // Some models write their reasoning inside <think>...</think> first
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "");

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("AI did not return JSON");
  }

  const raw = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;

  return {
    title: asText(raw.title),
    problem: asText(raw.problem),
    solution: asText(raw.solution),
    audience: asText(raw.audience),
    category: asText(raw.category),
    nextSteps: Array.isArray(raw.nextSteps)
      ? raw.nextSteps.map(asText).filter(Boolean)
      : [],
  };
}

async function callAI(baseUrl: string, apiKey: string | undefined, model: string, text: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new UpstreamError(res.status, (await res.text()).slice(0, 300));
    }

    const data = await res.json();
    const content: unknown = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("AI returned an empty answer");
    }

    return parseIdea(content);
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "Idea text is required." }, { status: 400 });
    }

    // Demo mode for testing the UI without calling any AI.
    if (process.env.AI_MOCK === "true") {
      return Response.json({
        title: text.trim().split(/[.!?\n]/)[0].slice(0, 55),
        problem: "[Demo] Problem statement generated in demo mode.",
        solution: "[Demo] Proposed solution generated in demo mode.",
        audience: "[Demo] Target audience generated in demo mode.",
        category: "Demo",
        nextSteps: [
          "[Demo] Research similar apps",
          "[Demo] Sketch a simple prototype",
          "[Demo] Get feedback from 3 users",
        ],
      });
    }

    const baseUrl = (process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/+$/, "");
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL ?? "llama-3.3-70b-versatile";

    const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    if (!apiKey && !isLocal) {
      return Response.json({ error: "AI_API_KEY is missing in .env." }, { status: 500 });
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const idea = await callAI(baseUrl, apiKey, model, text.trim());
        return Response.json(idea);
      } catch (error) {
        lastError = error;

        const retryable =
          error instanceof UpstreamError && (error.status === 503 || error.status === 502);

        if (!retryable || attempt === 1) {
          throw error;
        }

        console.warn(`AI service busy, retrying (attempt ${attempt + 1}/2)`);
        await sleep(1000);
      }
    }

    throw lastError;
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.name === "AbortError") {
      return Response.json(
        { error: "The AI took too long to respond. Please try again." },
        { status: 504 }
      );
    }

    if (error instanceof UpstreamError) {
      if (error.status === 401 || error.status === 403) {
        return Response.json(
          { error: "AI key is invalid. Check AI_API_KEY in .env." },
          { status: 500 }
        );
      }
      if (error.status === 404) {
        return Response.json(
          { error: "AI model not found. Check AI_MODEL in .env." },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return Response.json(
          { error: "AI usage limit reached. Please wait a minute and try again." },
          { status: 429 }
        );
      }
      return Response.json(
        { error: "The AI is busy right now. Please try again in a minute." },
        { status: 503 }
      );
    }

    if (error instanceof TypeError) {
      return Response.json(
        { error: "Could not reach the AI service. Check AI_BASE_URL and your internet." },
        { status: 502 }
      );
    }

    return Response.json(
      { error: "AI organization failed. Please try again." },
      { status: 500 }
    );
  }
}