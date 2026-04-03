export type AiEnhancementPayload = {
  wcagCriterion: string;
  actualBehavior: string;
  expectedBehavior: string;
  affectedUsers: string;
  problem: string;
  whyItMatters: string;
  howToFix: string[];
  codeExample: string;
  notes?: string;
  confidenceScore: number;
};

function extractJsonObject(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in AI response.");
  }

  return content.slice(start, end + 1);
}

async function callOpenRouter(prompt: string): Promise<{ provider: string; content: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "openrouter/auto";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_APP_URL ? { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL } : {}),
      "X-Title": "Bug Writer for QA & Accessibility"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an accessibility QA assistant. Return only valid JSON with no markdown fences and no extra commentary."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with ${response.status}.`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return { provider: `OpenRouter (${model})`, content };
}

async function callGemini(prompt: string): Promise<{ provider: string; content: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are an accessibility QA assistant. Return only valid JSON with no markdown fences and no extra commentary.\n\n" + prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}.`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");

  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return { provider: `Gemini (${model})`, content };
}

export async function runAiEnhancement(prompt: string): Promise<{
  provider: string;
  enhancement: AiEnhancementPayload;
}> {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();
  const providers = preferred === "gemini" ? [callGemini, callOpenRouter] : [callOpenRouter, callGemini];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = await provider(prompt);
      const parsed = JSON.parse(extractJsonObject(result.content)) as AiEnhancementPayload;

      return {
        provider: result.provider,
        enhancement: {
          ...parsed,
          confidenceScore: Number.isFinite(parsed.confidenceScore)
            ? Math.min(Math.max(parsed.confidenceScore, 0), 1)
            : 0.74
        }
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown AI provider error.");
    }
  }

  throw lastError ?? new Error("No AI provider configured.");
}
