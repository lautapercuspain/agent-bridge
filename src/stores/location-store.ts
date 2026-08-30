"use client";

import { create } from "zustand";

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

interface LocationState {
	latitude: number | null;
	longitude: number | null;
	cityName: string | null;
	countryCode: string | null;
	status: LocationStatus;

	requestLocation: () => void;
	setManualLocation: (city: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
	latitude: null,
	longitude: null,
	cityName: null,
	countryCode: null,
	status: "idle",

	requestLocation: () => {
		if (!("geolocation" in navigator)) {
			set({ status: "error" });
			return;
		}

		set({ status: "loading" });

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				set({ latitude, longitude, status: "granted" });

				try {
					const res = await fetch(
						`/api/geocode?lat=${latitude}&lng=${longitude}`,
					);
					if (res.ok) {
						const data = await res.json();
						set({ cityName: data.city, countryCode: data.countryCode ?? null });
					}
				} catch {
					// Coordinates are still usable even without a city name
				}
			},
			(err) => {
				set({
					status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
				});
			},
			{ enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
		);
	},

	setManualLocation: (city: string) => {
		set({
			latitude: null,
			longitude: null,
			cityName: city,
			status: "granted",
		});
	},
}));
