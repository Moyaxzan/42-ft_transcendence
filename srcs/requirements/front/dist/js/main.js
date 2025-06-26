import { router, enableLinkInterception } from './router.js';
document.addEventListener("DOMContentLoaded", () => {
    enableLinkInterception();
    // fleches 'back' et 'forward' du navigateur
    window.addEventListener("popstate", router);
    // call au chargement de la page de base
    router();
});
