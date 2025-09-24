import { animateLinesToFinalState } from './navbar.js';
import { setLanguage } from '../lang.js';
import { getCurrentUser } from '../auth.js';
async function refreshAuthUI() {
    const registerBtn = document.getElementById('register-button');
    const loginBtn = document.getElementById('login-button');
    const googleBtn = document.getElementById('google-button');
    const statsHeader = document.getElementById('stats-header');
    const statsElems = document.getElementById('stats');
    const welcomeMessage = document.getElementById('welcome-message');
    const headLoginButton = document.getElementById('head-login-button');
    const headLogoutButton = document.getElementById('head-logout-button');
    if (!loginBtn
        || !registerBtn
        || !googleBtn
        || !statsHeader
        || !statsElems
        || !welcomeMessage
        || !headLoginButton
        || !headLogoutButton) {
        console.error("Some DOM elements have not been found");
        return;
    }
    // Always hide the login button in the header until we know the state
    headLoginButton.classList.add('hidden');
    const user = await getCurrentUser();
    if (user) {
        // User logged in → hide login/register/google, show logout
        registerBtn.classList.add('hidden');
        loginBtn.classList.add('hidden');
        googleBtn.classList.add('hidden');
        headLogoutButton.classList.remove('hidden');
        displayStats({ wins: user.wins, losses: user.losses });
        const usernameEl = document.getElementById('welcome-username');
        if (usernameEl)
            usernameEl.textContent = user.name;
        console.log("Logged in as", user.name);
    }
    else {
        // User not logged in → show login/register/google, hide logout + stats
        registerBtn.classList.remove('hidden');
        loginBtn.classList.remove('hidden');
        googleBtn.classList.remove('hidden');
        headLogoutButton.classList.add('hidden');
        statsHeader.classList.add("hidden");
        statsElems.classList.add("hidden");
        welcomeMessage.classList.add("hidden");
        console.log("Not logged in");
    }
    if (user) {
        displayStats({ wins: user.wins, losses: user.losses });
        setupTwoFASwitch(user); // <<< ici
    }
    else {
        const container = document.getElementById('twofa-container');
        if (container)
            container.classList.add('hidden');
    }
}
function displayStats(stats) {
    const matchEl = document.getElementById('match-number')?.querySelector(".stat-value");
    const winEl = document.getElementById('win-number')?.querySelector(".stat-value");
    const lossEl = document.getElementById('loss-number')?.querySelector(".stat-value");
    const winrateEl = document.getElementById('winrate-pourcent')?.querySelector(".stat-value");
    if (matchEl)
        matchEl.textContent = String(stats.wins + stats.losses);
    if (winEl)
        winEl.textContent = String(stats.wins);
    if (lossEl)
        lossEl.textContent = String(stats.losses);
    if (winrateEl)
        winrateEl.textContent =
            (stats.wins + stats.losses > 0
                ? (stats.wins * 100 / (stats.wins + stats.losses)).toFixed(1)
                : "0") + "%";
}
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
        { id: "line-top", rotationDeg: -7, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -7, translateYvh: 30, height: "50vh" },
    ]);
    const registerBtn = document.getElementById('register-button');
    const loginBtn = document.getElementById('login-button');
    const googleBtn = document.getElementById('google-button');
    const statsHeader = document.getElementById('stats-header');
    const statsElems = document.getElementById('stats');
    const welcomeMessage = document.getElementById('welcome-message');
    const headLoginButton = document.getElementById('head-login-button');
    const headLogoutButton = document.getElementById('head-logout-button');
    if (!loginBtn
        || !registerBtn
        || !googleBtn
        || !statsHeader
        || !statsElems
        || !welcomeMessage
        || !headLoginButton
        || !headLogoutButton) {
        console.error("Some DOM elements have not been found");
        return;
    }
    refreshAuthUI();
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Utiliser système de navigation SPA
        refreshAuthUI();
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new CustomEvent('routeChanged'));
    });
    headLogoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        refreshAuthUI();
        location.reload();
    });
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Utiliser système de navigation SPA
        refreshAuthUI();
        window.history.pushState({}, '', '/register');
        window.dispatchEvent(new CustomEvent('routeChanged'));
    });
}
async function setupTwoFASwitch(user) {
    const container = document.getElementById('twofa-container');
    const switchBtn = document.getElementById('twofa-switch');
    if (!container || !switchBtn || !user)
        return;
    container.classList.remove('hidden');
    // Initialiser l'état
    switchBtn.dataset.enabled = user.twofa_enabled === 1 ? "true" : "false";
    switchBtn.addEventListener('click', async () => {
        const currentlyEnabled = switchBtn.dataset.enabled === "true";
        const newEnabled = !currentlyEnabled;
        // Mettre à jour visuellement
        switchBtn.dataset.enabled = newEnabled ? "true" : "false";
        try {
            const res = await fetch('/auth/2fa/toggle', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ enabled: newEnabled })
            });
            const data = await res.json();
            if (!res.ok) {
                // rollback si erreur
                switchBtn.dataset.enabled = currentlyEnabled ? "true" : "false";
                console.error('Error updating 2FA:', data);
                alert('Failed to update 2FA. Try again.');
            }
            else {
                console.log(`2FA ${newEnabled ? 'enabled' : 'disabled'} successfully`);
            }
        }
        catch (err) {
            // rollback si erreur réseau
            switchBtn.dataset.enabled = currentlyEnabled ? "true" : "false";
            console.error(err);
            alert('Failed to update 2FA. Try again.');
        }
    });
}
