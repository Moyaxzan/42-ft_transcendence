import { animateLinesToFinalState } from './navbar.js';
import { setLanguage } from '../lang.js';
export async function renderGameMode() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/gameMode.html');
    const html = await res.text();
    app.innerHTML = html;
    //setLanguage(document.documentElement.lang as 'en' | 'fr');
    // requestAnimationFrame(() => {
    setLanguage(document.documentElement.lang);
    // });
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
    ]);
    // Event listeners pour les boutons
    setupGameModeButtons();
}
function setupGameModeButtons() {
    const oneVsOneBtn = document.getElementById('1vs1-button');
    const tournamentBtn = document.getElementById('tournament-button');
    if (!oneVsOneBtn || !tournamentBtn) {
        console.error("Some DOM elements have not been found");
        return;
    }
    oneVsOneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Stocker le mode
        sessionStorage.setItem('gameMode', '1vs1');
        // Utiliser système de navigation SPA
        window.history.pushState({}, '', '/players');
        window.dispatchEvent(new CustomEvent('routeChanged'));
    });
    tournamentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Stocker le mode
        sessionStorage.setItem('gameMode', 'tournament');
        // Utiliser système de navigation SPA
        window.history.pushState({}, '', '/players');
        window.dispatchEvent(new CustomEvent('routeChanged'));
    });
}
