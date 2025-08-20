import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Dev stub: echo and accept audit events; in prod forward to Catalyst
  const body = await req.json().catch(() => ({}));
  console.info("[audit]", body);
  return NextResponse.json({ success: true });
}




