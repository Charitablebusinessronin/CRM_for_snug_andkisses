#!/usr/bin/env node
"use strict";

const required = [
	"CATALYST_PROJECT_ID",
	"CATALYST_DOMAIN",
	"CATALYST_AUTH_CLIENT_ID",
	"CATALYST_AUTH_REDIRECT_URI",
	"ZOHO_CRM_ORG_ID",
	"ZOHO_CRM_BASE_URL",
	"APP_BASE_URL"
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
	console.error("[verify-env] Missing required environment variables:\n" + missing.join("\n"));
	process.exit(1);
}

console.log("[verify-env] OK");



