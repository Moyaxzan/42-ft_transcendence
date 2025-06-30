import { router, enableLinkInterception } from './router.js';
document.addEventListener("DOMContentLoaded", () => {
    router();
    enableLinkInterception(); // Intercepte les liens [data-link]
    window.addEventListener("popstate", router); // Gère les flèches du navigateur
    window.addEventListener("routeChanged", router); // Gère les appels JS comme beginGame (changements de page via JS et non liens html; = évènements non interceptés par enableLinkInterception() car n'écoute que clics via <a data-link>)
    console.log("main.ts loaded");
});
