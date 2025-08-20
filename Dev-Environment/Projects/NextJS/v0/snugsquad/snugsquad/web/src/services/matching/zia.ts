import type { MatchingInput, MatchingResponse } from "../api/contracts";

export async function getBaselineMatches(input: MatchingInput): Promise<MatchingResponse> {
  // Placeholder deterministic stub to unblock UI wiring
  const seed = input.clientId.charCodeAt(0) % 3;
  const candidates = Array.from({ length: 3 }, (_, i) => ({
    caregiverId: `${seed}-${i}`,
    score: Math.round(100 - i * 12 + seed),
    rationale: "Baseline heuristic score",
  }));
  return { candidates };
}


