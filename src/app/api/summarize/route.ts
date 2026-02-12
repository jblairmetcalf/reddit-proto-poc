import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

let vertexClient: VertexAI | null = null;
function getVertexClient() {
  if (!vertexClient) {
    const project = process.env.GOOGLE_CLOUD_PROJECT!;
    const location = process.env.VERTEX_AI_LOCATION || "us-central1";

    // In production (Vercel), use inline credentials from env var
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (keyJson) {
      const credentials = JSON.parse(keyJson);
      vertexClient = new VertexAI({
        project,
        location,
        googleAuthOptions: { credentials },
      });
    } else {
      // Locally, falls back to GOOGLE_APPLICATION_CREDENTIALS file
      vertexClient = new VertexAI({ project, location });
    }
  }
  return vertexClient;
}

function buildPrompt(eventSummary: string, studyContext: string, studyName?: string) {
  return `You are a senior UX research analyst writing for a cross-functional product team (UX Designers, UX Engineers, UX Researchers, and Product Managers).

Analyze the following user research feedback from a Reddit mobile prototype study. Use smart brevity — lead with the most important insight, be direct, and cut filler words.

Format your response exactly like this:

**Bottom line:** [One sentence: the single most important takeaway]

**Key findings:**
• [Finding 1 — what happened + why it matters]
• [Finding 2]
• [Finding 3 if applicable]

**Usability signals:** [1-2 sentences on ease of use, satisfaction, and content findability patterns]

**What to do next:**
• For Design: [specific, actionable recommendation]
• For Engineering: [specific, actionable recommendation]
• For Research: [what to test or investigate next]
• For Product: [decision or prioritization guidance]
${studyContext}
Feedback data:
${eventSummary}

Keep the entire response under 250 words. No hedging, no filler, no preamble.${studyName ? " Reference the study context where relevant." : ""}`;
}

async function summarizeWithGemini(prompt: string): Promise<string> {
  const model = getVertexClient().getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "No summary generated.";
}

export async function POST(req: NextRequest) {
  try {
    const { events, studyName, variant } = await req.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "events array required" }, { status: 400 });
    }

    // Strip participant/session identifiers — only anonymous respondent numbers
    const eventSummary = events.map((e: Record<string, unknown>, i: number) => {
      const ts = new Date(e.timestamp as number).toISOString();
      const data = e.data ? ` | data: ${JSON.stringify(e.data)}` : "";
      const variantLabel = e.variant ? ` | variant: ${e.variant}` : "";
      return `[${ts}] ${e.type} (respondent ${i + 1}${variantLabel})${data}`;
    }).join("\n");

    let studyContext = "";
    if (studyName) {
      studyContext = `\n\nStudy Context:
- Study: "${studyName}"
- Prototype Variant: ${variant || "default"}
- Analyze behavior patterns specific to this variant configuration.
- If events contain multiple variants, compare behavior between variants.\n`;
    }

    const prompt = buildPrompt(eventSummary, studyContext, studyName);
    const summary = await summarizeWithGemini(prompt);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    return NextResponse.json(
      { error: "Summarization failed" },
      { status: 500 }
    );
  }
}
