import { router, enableLinkInterception } from './router.js';
import { setLanguage } from './lang.js';
document.addEventListener("DOMContentLoaded", () => {
    router();
    setLanguage(document.documentElement.lang);
    enableLinkInterception(); // Intercepte les liens [data-link]
    // const toggleButton = document.getElementById('lang-toggle');
    // if (toggleButton) {
    // 	console.log("Button found in timeout");
    // 	toggleButton.addEventListener('click', () => {
    // 		console.log("Lang button clicked");
    // 		toggleLanguage();
    // 	});
    // } 
    const langButtons = document.querySelectorAll(".lang-option");
    langButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const lang = e.currentTarget.id;
            console.log(`Language selected: ${lang}`);
            setLanguage(lang);
        });
    });
    window.addEventListener("popstate", router); // Gère les flèches du navigateur
    window.addEventListener("routeChanged", router); // Gère les appels JS comme beginGame (changements de page via JS et non liens html; = évènements non interceptés par enableLinkInterception() car n'écoute que clics via <a data-link>)
    console.log("main.ts loaded");
});
