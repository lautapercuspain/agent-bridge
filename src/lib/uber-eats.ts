type UberEnvironment = "sandbox" | "production";

interface UberTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	refresh_token?: string;
}

interface CachedToken {
	accessToken: string;
	expiresAt: number;
	scope: string;
}

let cachedToken: CachedToken | null = null;

function getUberEnvironment(): UberEnvironment {
	return process.env.UBER_EATS_ENVIRONMENT === "production"
		? "production"
		: "sandbox";
}

function getAuthBaseUrl() {
	return getUberEnvironment() === "production"
		? "https://auth.uber.com"
		: "https://sandbox-login.uber.com";
}

function getApiBaseUrl() {
	return getUberEnvironment() === "production"
		? "https://api.uber.com"
		: "https://test-api.uber.com";
}

function getClientCredentials() {
	const clientId = process.env.UBER_EATS_CLIENT_ID;
	const clientSecret = process.env.UBER_EATS_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error(
			"UBER_EATS_CLIENT_ID and UBER_EATS_CLIENT_SECRET are required",
		);
	}

	return { clientId, clientSecret };
}

export function getUberEatsRedirectUri(request: Request) {
	return (
		process.env.UBER_EATS_REDIRECT_URI ??
		`${new URL(request.url).origin}/api/uber-eats/oauth/callback`
	);
}

export function getUberEatsOAuthScope() {
	return process.env.UBER_EATS_OAUTH_SCOPES ?? "eats.pos_provisioning";
}

export function getUberEatsClientCredentialsScope() {
	return (
		process.env.UBER_EATS_CLIENT_CREDENTIALS_SCOPES ?? "eats.store eats.order"
	);
}

export function createUberEatsAuthorizationUrl(
	request: Request,
	state: string,
) {
	const { clientId } = getClientCredentials();
	const url = new URL(`${getAuthBaseUrl()}/oauth/v2/authorize`);
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", getUberEatsRedirectUri(request));
	url.searchParams.set("scope", getUberEatsOAuthScope());
	url.searchParams.set("response_type", "code");
	url.searchParams.set("state", state);
	return url;
}

export async function exchangeUberEatsAuthorizationCode(
	request: Request,
	code: string,
) {
	const { clientId, clientSecret } = getClientCredentials();
	const body = new FormData();
	body.set("client_id", clientId);
	body.set("client_secret", clientSecret);
	body.set("grant_type", "authorization_code");
	body.set("redirect_uri", getUberEatsRedirectUri(request));
	body.set("code", code);

	const response = await fetch(`${getAuthBaseUrl()}/oauth/v2/token`, {
		method: "POST",
		body,
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Uber Eats authorization code exchange failed: ${detail}`);
	}

	return (await response.json()) as UberTokenResponse;
}

async function mintAccessToken(scope: string): Promise<CachedToken> {
	const { clientId, clientSecret } = getClientCredentials();
	const body = new FormData();
	body.set("client_id", clientId);
	body.set("client_secret", clientSecret);
	body.set("grant_type", "client_credentials");
	body.set("scope", scope);

	const response = await fetch(`${getAuthBaseUrl()}/oauth/v2/token`, {
		method: "POST",
		body,
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Uber Eats token request failed: ${detail}`);
	}

	const token = (await response.json()) as UberTokenResponse;
	return {
		accessToken: token.access_token,
		expiresAt: Date.now() + Math.max(token.expires_in - 300, 60) * 1000,
		scope: token.scope,
	};
}

function getCookieValue(request: Request | undefined, name: string) {
	return request?.headers
		.get("cookie")
		?.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`))
		?.split("=")[1];
}

async function getAccessToken(scope: string, request?: Request) {
	const userToken = getCookieValue(request, "uber_eats_user_access_token");
	if (userToken) return decodeURIComponent(userToken);

	const staticToken = process.env.UBER_EATS_ACCESS_TOKEN;
	if (staticToken) return staticToken;

	if (
		cachedToken &&
		cachedToken.expiresAt > Date.now() &&
		scope.split(" ").every((s) => cachedToken?.scope.includes(s))
	) {
		return cachedToken.accessToken;
	}

	cachedToken = await mintAccessToken(scope);
	return cachedToken.accessToken;
}

export function getUberEatsConfig() {
	return {
		environment: getUberEnvironment(),
		authBaseUrl: getAuthBaseUrl(),
		apiBaseUrl: getApiBaseUrl(),
		oauthScope: getUberEatsOAuthScope(),
		clientCredentialsScope: getUberEatsClientCredentialsScope(),
		hasStaticAccessToken: Boolean(process.env.UBER_EATS_ACCESS_TOKEN),
		hasClientCredentials: Boolean(
			process.env.UBER_EATS_CLIENT_ID && process.env.UBER_EATS_CLIENT_SECRET,
		),
		hasRedirectUri: Boolean(process.env.UBER_EATS_REDIRECT_URI),
	};
}

export async function uberEatsFetch<T>(
	path: string,
	options: RequestInit & { request?: Request; scope?: string } = {},
): Promise<T> {
	const {
		scope = getUberEatsClientCredentialsScope(),
		request,
		headers,
		...init
	} = options;
	const token = await getAccessToken(scope, request);
	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		...init,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...headers,
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(`Uber Eats API ${response.status}: ${detail}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export async function getUberEatsStores(
	searchParams?: URLSearchParams,
	request?: Request,
) {
	const query = searchParams?.toString();
	return uberEatsFetch(`/v1/delivery/stores${query ? `?${query}` : ""}`, {
		request,
		scope: "eats.store",
	});
}

export async function getUberEatsStore(
	storeId: string,
	expand?: string | null,
	request?: Request,
) {
	const query = expand ? `?expand=${encodeURIComponent(expand)}` : "";
	return uberEatsFetch(
		`/v1/delivery/store/${encodeURIComponent(storeId)}${query}`,
		{
			request,
			scope: "eats.store",
		},
	);
}

export async function getUberEatsOrder(
	orderId: string,
	expand = "carts,payment",
	request?: Request,
) {
	return uberEatsFetch(
		`/v1/delivery/order/${encodeURIComponent(orderId)}?expand=${encodeURIComponent(expand)}`,
		{ request, scope: "eats.order" },
	);
}

export async function acceptUberEatsOrder(
	orderId: string,
	body: Record<string, unknown> = {},
	request?: Request,
) {
	return uberEatsFetch(
		`/v1/delivery/order/${encodeURIComponent(orderId)}/accept`,
		{
			method: "POST",
			body: JSON.stringify(body),
			request,
			scope: "eats.order",
		},
	);
}

export async function denyUberEatsOrder(
	orderId: string,
	body: Record<string, unknown>,
	request?: Request,
) {
	return uberEatsFetch(
		`/v1/delivery/order/${encodeURIComponent(orderId)}/deny`,
		{
			method: "POST",
			body: JSON.stringify(body),
			request,
			scope: "eats.order",
		},
	);
}
