import { renderHome } from './pages/home.js';
import { renderGameMode } from './pages/gameMode.js';
import { renderPlayers } from './pages/players.js';
import { renderProfile, renderUser, renderMatch } from './pages/profile.js';
import { renderPong, stopGame } from './pages/pong.js';
import { renderLogin } from './pages/login.js';
// Define a map of paths to render functions
const routes = {
    '/': renderHome,
    '/game-mode': renderGameMode,
    '/players': renderPlayers,
    '/profile': renderProfile,
    '/pong': renderPong,
    '/pong/': renderPong,
    '/login': renderLogin,
    '/users': renderUser,
    '/matches': renderMatch,
};
// Run this when URL changes or app first loads
export function router() {
    const path = window.location.pathname;
    console.log("Routing to:", path);
    const render = routes[path] || renderHome;
    if (path != "/pong") {
        console.log("game should stop");
        stopGame();
    }
    render();
}
console.log("hello");
// Allow click links with data-link to pushState instead of full reload
export function enableLinkInterception() {
    console.log("Setting up link interception");
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('[data-link]')) {
            e.preventDefault();
            const href = target.getAttribute('href');
            console.log("Intercepted navigation to:", href);
            history.pushState(null, '', href);
            // router();
        }
    });
}
