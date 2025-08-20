import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Dev stub: in production, initiate Zoho Catalyst Embedded Auth and return provider URL
  // For now, return a no-op URL so the client can proceed to the next step (MFA)
  const _body = await req.json().catch(() => ({}));
  return NextResponse.json({ url: "/signin?step=mfa" });
}




