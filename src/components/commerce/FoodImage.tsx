"use client";

import { UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";

export function FoodImage({
	src,
	fallbackSrc,
	alt,
	className,
}: {
	src?: string;
	fallbackSrc?: string;
	alt: string;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);
	const [currentSrc, setCurrentSrc] = useState(src);

	useEffect(() => {
		setCurrentSrc(src);
		setFailed(false);
	}, [src]);

	if (!currentSrc || failed) {
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
			src={currentSrc}
			alt={alt}
			loading="lazy"
			onError={() => {
				if (fallbackSrc && currentSrc !== fallbackSrc) {
					setCurrentSrc(fallbackSrc);
					return;
				}
				setFailed(true);
			}}
			className={className}
		/>
	);
}
