#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");

function run(cmd, args) {
	const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
	if (res.status !== 0) process.exit(res.status || 1);
}

// Replit-friendly install flow with fallbacks
console.log("[compile-dependencies] Installing pinned dependencies with npm ci...");
run("npm", ["ci", "--no-fund", "--no-audit"]);

console.log("[compile-dependencies] Done");



