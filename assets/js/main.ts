import { router, enableLinkInterception } from './router.js';

document.addEventListener("DOMContentLoaded", () => {
//	router();
	enableLinkInterception();
	console.log("main.ts loaded");
	document.addEventListener("click", (e) => {
		const link = (e.target as HTMLElement).closest("[data-link]") as HTMLAnchorElement | null;
		if (link) {
			e.preventDefault();
			const href = link.getAttribute("href");
			if (href) {
				console.log("Intercepted link:", href);
				history.pushState(null, "", href);
//				router();
			}
		}
	});
	window.addEventListener("popstate", router);
});

