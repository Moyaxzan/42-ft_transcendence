import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';
// Define a map of paths to render functions
const routes = {
    '/': renderHome,
    '/profile': renderProfile,
};
// Run this when URL changes or app first loads
export function router() {
    const path = window.location.pathname;
    console.log("Routing to:", path);
    const render = routes[path] || renderHome;
    render();
}
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
            router();
        }
    });
}
