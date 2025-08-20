#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");

function run(cmd, args) {
	const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
	if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed with code ${res.status}`);
}

function main() {
	console.log("[deploy] Preflight checks...");
	run("npm", ["run", "verify:env"]);
	run("npm", ["run", "validate:deps"]);

	console.log("[deploy] Building app...");
	run("npm", ["run", "build"]);

	console.log("[deploy] Placeholder: integrate Zoho Catalyst and Replit deployment steps here.");
	console.log("[deploy] Success");
}

try {
	main();
} catch (err) {
	console.error("[deploy] FAILED:", err.message);
	console.error("[deploy] Initiating rollback (placeholder)");
	process.exit(1);
}



