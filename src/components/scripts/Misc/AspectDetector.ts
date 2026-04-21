import { useState, useEffect } from "react";

const isClient = typeof window === "object";

const getInitialAspectRatio = (): boolean => {
	if (!isClient) {
		return false;
	}
	return window.innerHeight > window.innerWidth;
};

export default function AspectDetector() {
	const [aspectRatio, setAspectRatio] = useState(getInitialAspectRatio());

	useEffect(() => {
		const handleResize = () => {
			setAspectRatio(window.innerHeight > window.innerWidth);
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return aspectRatio;
}
