"use client";

import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";

export function FoodImage({
	src,
	alt,
	className,
}: {
	src?: string;
	alt: string;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);

	if (!src || failed) {
		return (
			<div
				className={`flex items-center justify-center bg-linear-to-br from-orange-100 via-rose-100 to-amber-100 text-brand/50 ${className ?? ""}`}
			>
				<UtensilsCrossed className="h-8 w-8" strokeWidth={1.5} />
			</div>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt={alt}
			loading="lazy"
			onError={() => setFailed(true)}
			className={className}
		/>
	);
}
