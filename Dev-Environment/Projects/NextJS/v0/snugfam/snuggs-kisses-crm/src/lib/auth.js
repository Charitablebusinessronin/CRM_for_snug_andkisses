import { initializeCatalystSdk } from "@/lib/catalyst-sdk";

export async function requireSession() {
	const sdk = await initializeCatalystSdk();
	// Placeholder: fetch current session/user via Catalyst SDK
	return { user: null, sdk };
}

export function withAuth(handler) {
	return async function authedHandler(...args) {
		await requireSession();
		return handler(...args);
	};
}



