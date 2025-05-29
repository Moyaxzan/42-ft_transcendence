export function animateLinesToFinalState(targets) {
    targets.forEach(({ id, rotationDeg, translateYvh, height }) => {
        const el = document.getElementById(id);
        if (!el)
            return;
        // Remove any previous transform-related classes if known (optional cleanup)
        el.classList.remove(...Array.from(el.classList).filter(cls => cls.startsWith("rotate-") ||
            cls.startsWith("translate-y-") ||
            cls.startsWith("h-") ||
            /\brotate-\[.*\]/.test(cls) ||
            /\btranslate-y-\[.*\]/.test(cls) ||
            /\bh-\[.*\]/.test(cls)));
        // Add transition for smooth animation
        el.classList.add("transition-all", "duration-700", "ease-in-out");
        // Apply new Tailwind classes using arbitrary values
        el.classList.add(`rotate-[${rotationDeg}deg]`, `translate-y-[${translateYvh}vh]`, `h-[${height}]`);
    });
}
