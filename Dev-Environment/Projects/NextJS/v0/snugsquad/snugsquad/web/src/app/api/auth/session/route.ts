import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Dev stub: derive session from cookies until Catalyst SDK is wired
  const jar = await cookies();
  const role = (jar.get("role")?.value as
    | "admin"
    | "client"
    | "employee"
    | "contractor"
    | undefined) ?? "client";
  const mfaComplete = jar.get("mfa")?.value === "1";
  return NextResponse.json({
    userId: "dev-user-1",
    email: "dev@example.com",
    role,
    mfaComplete,
  });
}


