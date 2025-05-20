import { router, enableLinkInterception, displayUser } from './router.js';
document.addEventListener("DOMContentLoaded", () => {
    router();
    enableLinkInterception();
    displayUser();
    console.log("main.ts loaded");
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-link]");
        if (link) {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href) {
                console.log("Intercepted link:", href);
                history.pushState(null, "", href);
                router();
            }
        }
    });
    window.addEventListener("popstate", router);
});
