import { NextRequest, NextResponse } from "next/server";

const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder-480b-a35b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "google/gemma-3-27b-it:free",
  "nous/hermes-3-405b-instruct:free",
];

const errorResult = {
  bugs: ["All AI models are busy right now. Please try again in 30 seconds."],
  style: [],
  improvements: [],
  summary: "Service temporarily unavailable due to high demand on free tier.",
};

export async function POST(req: NextRequest) {
  const { code, language } = await req.json();

  const prompt = `You are a strict expert ${language} code reviewer. Find ALL bugs and issues.

Respond ONLY with a raw JSON object (no markdown, no backticks) with these keys:
- "bugs": array of strings describing every bug, error, undefined behavior, out-of-bounds, division by zero, memory leak, uninitialized variables. Include line numbers.
- "style": array of strings for style/formatting issues
- "improvements": array of strings for improvements
- "summary": single string, 1-2 sentence verdict

Code (${language}):
\`\`\`${language}
${code}
\`\`\``;

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CodeLens",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();

      // Skip if model returned an error
      if (data.error) {
        console.log(`Model ${model} failed:`, data.error.message);
        continue;
      }

      const text = data.choices?.[0]?.message?.content || "";
      

      if (!text) continue;

      // Clean and parse JSON
      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/<think>[\s\S]*?<\/think>/g, "") // remove DeepSeek thinking tags
        .trim();

      // Find the JSON object in the response
      const jsonStart = clean.indexOf("{");
      const jsonEnd = clean.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) continue;

      const jsonStr = clean.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      // Make sure it has the right shape
      if (parsed.bugs || parsed.summary) {
        return NextResponse.json({
          bugs: parsed.bugs || [],
          style: parsed.style || [],
          improvements: parsed.improvements || [],
          summary: parsed.summary || "Review complete.",
        });
      }

    } catch (err) {
      console.log(`Model ${model} threw error:`, err);
      continue;
    }
  }

  // All models failed
  return NextResponse.json(errorResult);
}