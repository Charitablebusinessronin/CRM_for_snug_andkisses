import { NextResponse } from "next/server";

export async function POST() {
  // Dev stub: return a fake challengeId (in prod, trigger Catalyst MFA challenge)
  return NextResponse.json({ challengeId: "challenge-dev-1" });
}


