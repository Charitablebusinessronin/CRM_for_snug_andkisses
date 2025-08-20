import { z } from "zod";

export const NonPhiString = z
	.string()
	.max(1024)
	.refine((v) => !containsLikelyPhi(v), {
		message: "String must not contain PHI"
	});

function containsLikelyPhi(value) {
	// Heuristic: reject obvious identifiers; this is a conservative placeholder
	const patterns = [
		/[0-9]{3}-[0-9]{2}-[0-9]{4}/, // SSN pattern-like
		/\bMRN\b/i,
		/\bDOB\b/i
	];
	return patterns.some((re) => re.test(value));
}



