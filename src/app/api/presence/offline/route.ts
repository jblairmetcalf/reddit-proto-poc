import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { participantId, studyId } = await req.json();
    if (!participantId || !studyId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const docId = `${participantId}_${studyId}`;
    await deleteDoc(doc(db, "presence", docId));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
