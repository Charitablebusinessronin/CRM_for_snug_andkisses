export async function apiFetch(path, options = {}) {
	const url = new URL(path, process.env.APP_BASE_URL || "http://localhost:3000");
	const res = await fetch(url.toString(), {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		...options
	});
	if (!res.ok) {
		const text = await safeText(res);
		throw new Error(`API error: ${res.status} ${text}`);
	}
	return res.json();
}

async function safeText(res) {
	try {
		return await res.text();
	} catch {
		return "";
	}
}



