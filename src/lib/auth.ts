import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.PARTICIPANT_JWT_SECRET;
  if (!secret) throw new Error("PARTICIPANT_JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
};

export interface ParticipantPayload {
  participantId: string;
  studyId: string;
  name: string;
  prototypeVariant?: string;
}

export async function createParticipantToken(
  payload: ParticipantPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export async function verifyParticipantToken(
  token: string
): Promise<ParticipantPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as ParticipantPayload;
  } catch {
    return null;
  }
}
