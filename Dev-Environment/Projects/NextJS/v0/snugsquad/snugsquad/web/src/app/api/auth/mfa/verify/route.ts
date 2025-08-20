import { NextResponse } from "next/server";

export async function POST() {
  // Dev stub: set an HTTP-only cookie to represent MFA completion
  const res = NextResponse.json({ success: true });
  res.cookies.set("mfa", "1", { httpOnly: true, path: "/" });
  return res;
}


