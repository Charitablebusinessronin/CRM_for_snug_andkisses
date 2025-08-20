#!/usr/bin/env node
"use strict";

const { engines, dependencies, devDependencies } = require("../package.json");
const semver = require("semver");

function fail(msg) {
	console.error(`\n[validate-deps] ${msg}\n`);
	process.exit(1);
}

function ok(msg) {
	console.log(`[validate-deps] ${msg}`);
}

// 1) Enforce Node version exact match
const requiredNode = engines && engines.node;
if (!requiredNode) fail("Missing engines.node in package.json");

const current = process.versions.node;
if (current !== requiredNode) {
	fail(`Node version mismatch. Required ${requiredNode}, found ${current}. Use NVM and .nvmrc.`);
}
ok(`Node version ${current} OK`);

// 2) Enforce exact versions (no ranges)
const allDeps = { ...dependencies, ...devDependencies };
for (const [name, version] of Object.entries(allDeps)) {
	if (semver.valid(version)) continue;
	// If not a plain valid version, reject (^, ~, tags)
	fail(`Dependency ${name} must be pinned to an exact version, found "${version}"`);
}
ok("All dependencies are pinned to exact versions");

// 3) Compatibility checks for Next/React and Node 16
const nextVersion = dependencies?.next;
const reactVersion = dependencies?.react;
if (!nextVersion || !reactVersion) fail("Missing next or react dependency");

// Next.js 13.x and React 18 run on Node 16; block known incompatible majors
const nextMajor = semver.major(semver.coerce(nextVersion));
const reactMajor = semver.major(semver.coerce(reactVersion));

if (nextMajor >= 15 || reactMajor >= 19) {
	fail("Configured Next/React require Node >=18. Please downgrade to Next 13.x / React 18.x or upgrade Node.");
}
ok("Framework compatibility checks passed for Node 16");

console.log("\n[validate-deps] OK\n");



