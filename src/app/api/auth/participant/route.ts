import { NextRequest, NextResponse } from "next/server";
import { createParticipantToken, verifyParticipantToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { participantId, studyId, name, prototypeVariant, prototypeUrl } = await req.json();

    if (!participantId || !studyId || !name) {
      return NextResponse.json(
        { error: "participantId, studyId, and name are required" },
        { status: 400 }
      );
    }

    const token = await createParticipantToken({ participantId, studyId, name, prototypeVariant });
    const base = prototypeUrl || "/prototype";
    const separator = base.includes("?") ? "&" : "?";
    const url = `${req.nextUrl.origin}${base}${separator}token=${token}`;

    return NextResponse.json({ token, url });
  } catch (err) {
    console.error("Participant token error:", err);
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const payload = await verifyParticipantToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.json({ valid: true, ...payload });
}
