import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

async function tryGroq(prompt: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.log("Groq error:", data.error.message);
      return null;
    }
    const text = data.choices?.[0]?.message?.content || "";
    console.log("Groq succeeded");
    return text;
  } catch (err) {
    console.log("Groq failed:", err);
    return null;
  }
}

const OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder-480b-a35b:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openai/gpt-oss-120b:free",
  "z-ai/glm-4-5-air:free",
];

async function tryOpenRouter(prompt: string): Promise<string | null> {
  const siteUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  for (const model of OPENROUTER_MODELS) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": "CodeLens",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.log(`Model ${model} failed:`, data.error.message);
        continue;
      }
      const text = data.choices?.[0]?.message?.content || "";
      if (!text) continue;
      console.log(`OpenRouter model ${model} succeeded`);
      return text;
    } catch (err) {
      console.log(`Model ${model} error:`, err);
      continue;
    }
  }
  return null;
}

function parseResponse(text: string) {
  const clean = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();
  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    const parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
    if (parsed.bugs || parsed.summary) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
    console.log("GROQ KEY:", !!process.env.GROQ_API_KEY);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        bugs: ["Rate limit exceeded. You can make 5 requests per minute."],
        style: [],
        improvements: [],
        summary: "Too many requests. Please wait 60 seconds before trying again.",
      },
      { status: 429 }
    );
  }

  const { code, language } = await req.json();

  if (!code?.trim()) {
    return NextResponse.json(
      {
        bugs: ["No code provided."],
        style: [],
        improvements: [],
        summary: "Please paste some code to review.",
      },
      { status: 400 }
    );
  }

  const prompt = `You are a strict expert ${language} code reviewer. Find ALL bugs and issues.

Respond ONLY with a raw JSON object (no markdown, no backticks, no explanation) with exactly these keys:
- "bugs": array of strings - every bug, runtime error, out-of-bounds, division by zero, memory leak, uninitialized variable. Include line numbers.
- "style": array of strings for style and formatting issues
- "improvements": array of strings for suggestions  
- "summary": single string, 1-2 sentence verdict

Code (${language}):
\`\`\`${language}
${code}
\`\`\``;

  // Try Groq first (most reliable)
  let text = await tryGroq(prompt);

  // Fall back to OpenRouter if Groq fails
  if (!text) {
    console.log("Groq failed, trying OpenRouter...");
    text = await tryOpenRouter(prompt);
  }

  if (text) {
    const parsed = parseResponse(text);
    if (parsed) {
      return NextResponse.json(
        {
          bugs: parsed.bugs || [],
          style: parsed.style || [],
          improvements: parsed.improvements || [],
          summary: parsed.summary || "Review complete.",
        },
        { headers: { "X-RateLimit-Remaining": remaining.toString() } }
      );
    }
  }

  // Everything failed
  return NextResponse.json({
    bugs: ["All AI models are currently busy. Please try again in 30 seconds."],
    style: [],
    improvements: [],
    summary: "Service temporarily unavailable. Please retry shortly.",
  });
}