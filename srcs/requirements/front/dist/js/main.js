import { router, enableLinkInterception } from './router.js';
import { setLanguage } from './lang.js';
import { showHelpModal, hideHelpModal } from './pages/modals.js';
document.addEventListener("DOMContentLoaded", () => {
    router();
    const lang = localStorage.getItem("lang") || 'en';
    setLanguage(lang);
    enableLinkInterception(); // Intercepte les liens [data-link]
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
    const helpBtn = document.getElementById('help-button');
    if (!helpBtn) {
        console.error("Help button not found");
    }
    else {
        helpBtn.addEventListener('click', (e) => {
            showHelpModal();
            console.log("help pressed");
        });
    }
    const helpModal = document.getElementById("help-modal");
    if (helpModal) {
        // Closes modal when clicking outside the content
        helpModal.addEventListener('click', (e) => {
            const content = document.getElementById('help-modal-content');
            if (!content.contains(e.target)) {
                hideHelpModal();
            }
        });
    }
    console.log("main.ts loaded");
});
