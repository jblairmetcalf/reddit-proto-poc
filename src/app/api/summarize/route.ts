import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export async function POST(req: NextRequest) {
  try {
    const { events, studyId, studyName, variant } = await req.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "events array required" }, { status: 400 });
    }

    const eventSummary = events.map((e: Record<string, unknown>) => {
      const ts = new Date(e.timestamp as number).toISOString();
      const data = e.data ? ` | data: ${JSON.stringify(e.data)}` : "";
      const variantLabel = e.variant ? ` | variant: ${e.variant}` : "";
      return `[${ts}] ${e.type} (session: ${e.sessionId}${e.participantId ? `, participant: ${e.participantId}` : ""}${variantLabel})${data}`;
    }).join("\n");

    let studyContext = "";
    if (studyName) {
      studyContext = `\n\nStudy Context:
- Study: "${studyName}" (ID: ${studyId})
- Prototype Variant: ${variant || "default"}
- Analyze behavior patterns specific to this variant configuration.
- If events contain multiple variants, compare behavior between variants.\n`;
    }

    const message = await getClient().messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a UX research analyst. Analyze these user interaction events from a Reddit mobile prototype and provide a brief summary. Focus on:
1. User behavior patterns (what they did most, navigation flow)
2. Engagement signals (votes, comments, time spent)
3. Notable findings or concerns
4. Recommendations for the next research cycle
${studyContext}
Events:
${eventSummary}

Provide a concise 3-5 paragraph analysis.${studyName ? " Reference the study and variant context in your analysis." : ""}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const summary = textBlock ? textBlock.text : "No summary generated.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err);
    return NextResponse.json(
      { error: "Summarization failed" },
      { status: 500 }
    );
  }
}
