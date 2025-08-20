import { NextRequest, NextResponse } from "next/server";
import { getBaselineMatches } from "@/services/matching/zia";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await getBaselineMatches(body);
  return NextResponse.json(result);
}


