#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function parseEnvFile(path) {
	const entries = [];
	const text = readFileSync(path, "utf8");
	for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		const value = line.slice(eq + 1).trim();
		entries.push({ key, value, line: index + 1 });
	}
	return entries;
}

function getEnv(entries) {
	const env = new Map();
	for (const entry of entries) {
		env.set(entry.key, entry.value);
	}
	return env;
}

function mask(value) {
	if (!value) return "missing";
	if (value.length <= 8) return "set";
	return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function fail(message) {
	console.error(`FAIL ${message}`);
	process.exitCode = 1;
}

function pass(message) {
	console.log(`PASS ${message}`);
}

async function main() {
	const entries = parseEnvFile(ENV_PATH);
	const env = getEnv(entries);
	const duplicateKeys = Map.groupBy(entries, (entry) => entry.key);

	for (const [key, values] of duplicateKeys) {
		if (values.length > 1) {
			fail(`${key} is defined ${values.length} times at lines ${values.map((v) => v.line).join(", ")}`);
		}
	}

	const environment = env.get("UBER_EATS_ENVIRONMENT") || "sandbox";
	const clientId = env.get("UBER_EATS_CLIENT_ID") || "";
	const clientSecret = env.get("UBER_EATS_CLIENT_SECRET") || "";
	const redirectUri = env.get("UBER_EATS_REDIRECT_URI") || "";
	const oauthScopes = env.get("UBER_EATS_OAUTH_SCOPES") || "eats.pos_provisioning";
	const clientCredentialScopes = env.get("UBER_EATS_CLIENT_CREDENTIALS_SCOPES") || "eats.store eats.order";

	const authBaseUrl = environment === "production" ? "https://auth.uber.com" : "https://sandbox-login.uber.com";
	const apiBaseUrl = environment === "production" ? "https://api.uber.com" : "https://test-api.uber.com";

	console.log("Uber Eats config");
	console.log(`- environment: ${environment}`);
	console.log(`- authBaseUrl: ${authBaseUrl}`);
	console.log(`- apiBaseUrl: ${apiBaseUrl}`);
	console.log(`- clientId: ${mask(clientId)}`);
	console.log(`- clientSecret: ${mask(clientSecret)}`);
	console.log(`- redirectUri: ${redirectUri || "missing"}`);
	console.log(`- oauthScopes: ${oauthScopes}`);
	console.log(`- clientCredentialScopes: ${clientCredentialScopes}`);

	if (!clientId) fail("UBER_EATS_CLIENT_ID is missing");
	if (!clientSecret) fail("UBER_EATS_CLIENT_SECRET is missing");
	if (clientSecret === "your_rotated_client_secret") fail("UBER_EATS_CLIENT_SECRET is still the placeholder value");
	if (!redirectUri) fail("UBER_EATS_REDIRECT_URI is missing");
	if (redirectUri && !redirectUri.includes("/api/uber-eats/oauth/callback")) {
		fail("UBER_EATS_REDIRECT_URI should point to /api/uber-eats/oauth/callback");
	}
	if (process.exitCode) return;

	const authorizationUrl = new URL(`${authBaseUrl}/oauth/v2/authorize`);
	authorizationUrl.searchParams.set("client_id", clientId);
	authorizationUrl.searchParams.set("redirect_uri", redirectUri);
	authorizationUrl.searchParams.set("scope", oauthScopes);
	authorizationUrl.searchParams.set("response_type", "code");
	authorizationUrl.searchParams.set("state", "manual-test-state");
	console.log("\nOAuth start URL");
	console.log(authorizationUrl.toString());

	const body = new FormData();
	body.set("client_id", clientId);
	body.set("client_secret", clientSecret);
	body.set("grant_type", "client_credentials");
	body.set("scope", clientCredentialScopes);

	console.log("\nTesting client_credentials token exchange...");
	const response = await fetch(`${authBaseUrl}/oauth/v2/token`, {
		method: "POST",
		body,
	});
	const text = await response.text();
	let payload;
	try {
		payload = JSON.parse(text);
	} catch {
		payload = { raw: text };
	}

	if (!response.ok) {
		fail(`token exchange returned HTTP ${response.status}`);
		console.error("Uber response:", JSON.stringify(payload, null, 2));
		return;
	}

	pass("client_credentials token exchange succeeded");
	console.log(`- tokenType: ${payload.token_type}`);
	console.log(`- expiresIn: ${payload.expires_in}`);
	console.log(`- scope: ${payload.scope}`);
	console.log(`- accessToken: ${mask(payload.access_token)}`);

	console.log("\nTesting store access...");
	const storesResponse = await fetch(`${apiBaseUrl}/v1/delivery/stores`, {
		headers: {
			Authorization: `Bearer ${payload.access_token}`,
			Accept: "application/json",
		},
	});
	const storesText = await storesResponse.text();
	let storesPayload;
	try {
		storesPayload = JSON.parse(storesText);
	} catch {
		storesPayload = { raw: storesText };
	}

	if (!storesResponse.ok) {
		fail(`store access returned HTTP ${storesResponse.status}`);
		console.error("Uber response:", JSON.stringify(storesPayload, null, 2));
		return;
	}

	pass("store access succeeded");
	console.log(JSON.stringify(storesPayload, null, 2));
}

main().catch((error) => {
	fail(error instanceof Error ? error.message : String(error));
});
