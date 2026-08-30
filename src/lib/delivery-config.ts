import type { DeliveryPlatform } from "@/types";

// Brand metadata for each supported delivery marketplace. Colors are the
// platforms' primary brand colors; we render short labels rather than official
// logos to stay clear of trademark reproduction.
export const PLATFORM_META: Record<
	DeliveryPlatform,
	{ label: string; color: string; textColor: string }
> = {
	"uber-eats": { label: "Uber Eats", color: "#06C167", textColor: "#053218" },
	rappi: { label: "Rappi", color: "#FF441F", textColor: "#ffffff" },
	pedidosya: { label: "PedidosYa", color: "#E6004C", textColor: "#ffffff" },
	"didi-food": { label: "DiDi Food", color: "#FF6C0C", textColor: "#ffffff" },
};

// Order in which platforms are offered to the user (region-agnostic default).
export const PLATFORM_ORDER: DeliveryPlatform[] = [
	"rappi",
	"uber-eats",
	"pedidosya",
	"didi-food",
];

// ISO 3166-1 alpha-2 (lowercase) countries where Uber Eats operates.
export const UBER_COUNTRIES = new Set<string>([
	"ar",
	"mx",
	"cl",
	"pe",
	"ec",
	"cr",
	"br",
	"do",
	"gt",
	"sv",
	"pa",
	"us",
	"ca",
]);

// Country code -> Rappi country domain.
export const RAPPI_DOMAINS: Record<string, string> = {
	ar: "rappi.com.ar",
	mx: "rappi.com.mx",
	cl: "rappi.cl",
	co: "rappi.com.co",
	pe: "rappi.com.pe",
	uy: "rappi.com.uy",
	ec: "rappi.com.ec",
	cr: "rappi.com.cr",
	br: "rappi.com.br",
};

// Country code -> PedidosYa country domain.
export const PEDIDOSYA_DOMAINS: Record<string, string> = {
	ar: "pedidosya.com.ar",
	cl: "pedidosya.cl",
	uy: "pedidosya.com.uy",
	pe: "pedidosya.com.pe",
	ec: "pedidosya.com.ec",
	cr: "pedidosya.com.cr",
	do: "pedidosya.com.do",
	pa: "pedidosya.com.pa",
	py: "pedidosya.com.py",
	bo: "pedidosya.com.bo",
	gt: "pedidosya.com.gt",
	sv: "pedidosya.com.sv",
	hn: "pedidosya.com.hn",
	ni: "pedidosya.com.ni",
	ve: "pedidosya.com.ve",
};

// Country code -> DiDi Food consumer landing page. DiDi Food has no public
// name-search URL, so we can only hand off to the regional food home.
export const DIDI_FOOD_URLS: Record<string, string> = {
	mx: "https://web.didiglobal.com/mx/food/",
};
