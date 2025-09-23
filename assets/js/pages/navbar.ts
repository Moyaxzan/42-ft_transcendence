type LineTarget = {
	id: string;
	rotationDeg: number;
	translateYvh: number;
	height: string;
};

export function animateLinesToFinalState(targets: LineTarget[]) {
	targets.forEach(({ id, rotationDeg, translateYvh, height }) => {
		const el = document.getElementById(id);
		if (!el) return;

		// Remove any previous transform-related classes if known (optional cleanup)
		el.classList.remove(
			...Array.from(el.classList).filter(cls =>
				cls.startsWith("rotate-") ||
				cls.startsWith("translate-y-") ||
				cls.startsWith("h-") ||
				/\brotate-\[.*\]/.test(cls) ||
				/\btranslate-y-\[.*\]/.test(cls) ||
				/\bh-\[.*\]/.test(cls)
			)
		);

		// Add transition for smooth animation
		el.classList.add("transition-all", "duration-700", "ease-in-out");

		// Apply new Tailwind classes using arbitrary values
		el.classList.add(
			`rotate-[${rotationDeg}deg]`,
			`translate-y-[${translateYvh}vh]`,
			`h-[${height}]`
		);
	});
}

export function setLinesFinalState(configs: { id: string, rotationDeg: number, translateYvh: number, height: string }[]) {
  configs.forEach(({ id, rotationDeg, translateYvh, height }) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.transition = "none"; // pas d’animation
      el.style.transform = `rotate(${rotationDeg}deg) translateY(${translateYvh}vh)`;
      el.style.height = height;

      void el.offsetHeight; // reflow pour appliquer transition:none

      el.style.transition = ""; // remet la transition normale pour les prochaines pages
    }
  });
}

