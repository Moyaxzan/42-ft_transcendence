import { animateLinesToFinalState } from './navbar.js';
import { setLanguage } from '../lang.js';
export async function renderHome() {
    document.title = "ft_transcendence";
    console.log("renderHome called");
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/home.html');
    const html = await res.text();
    app.innerHTML = html;
    setLanguage(document.documentElement.lang);
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
    ]);
    const loginBtn = document.getElementById('login-button');
    if (!loginBtn) {
        console.error("Some DOM elements have not been found");
        return;
    }
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Utiliser système de navigation SPA
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new CustomEvent('routeChanged'));
    });
}
