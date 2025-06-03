import { renderProfile } from './profile.js';
import { renderHome } from './home.js';
function loadGoogleSdk() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google SDK'));
        document.head.appendChild(script);
    });
}
export async function renderLogin() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/login.html');
    const html = await res.text();
    app.innerHTML = html;
    const backBtn = document.getElementById('backHomeBtn');
    backBtn === null || backBtn === void 0 ? void 0 : backBtn.addEventListener('click', () => {
        renderHome();
    });
    const loginForm = document.getElementById('loginForm');
    const messageEl = document.getElementById('loginMessage');
    if (!loginForm || !messageEl)
        return;
    loginForm.addEventListener('submit', async (e) => {
        var _a, _b;
        e.preventDefault();
        const target = e.target;
        const email = (_a = target.elements.namedItem('email')) === null || _a === void 0 ? void 0 : _a.value.trim();
        const password = (_b = target.elements.namedItem('password')) === null || _b === void 0 ? void 0 : _b.value.trim();
        messageEl.textContent = '';
        if (!email || !password) {
            messageEl.textContent = 'Please fill all the fields';
            return;
        }
        try {
            const res = await fetch('/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                messageEl.textContent = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || 'Authentication failed: wrong credentials.';
                return;
            }
            const data = await res.json();
            localStorage.setItem('token', data.token);
            messageEl.style.color = 'green';
            messageEl.textContent = 'Connexion successful';
            console.log('JWT received:', data.token);
            setTimeout(() => {
                renderProfile();
            }, 500);
        }
        catch (err) {
            messageEl.textContent = 'Network error, please try again later';
            console.error(err);
        }
    });
    try {
        await loadGoogleSdk();
        const clientIdRes = await fetch('/auth/google/client-id');
        const { clientId } = await clientIdRes.json();
        console.log('Id received:', clientId);
        window.handleGoogleCredentialResponse = async function (response) {
            const { credential } = response;
            const res = await fetch('/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credential }),
            });
            if (!res.ok) {
                console.error(await res.text());
                return;
            }
            const data = await res.json();
            console.log('Connected via Google, got token:', data);
            renderProfile();
        };
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: window.handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(document.getElementById('googleSignInDiv'), { theme: 'outline', size: 'large' });
    }
    catch (err) {
        console.error("Error loading Google Sign-In", err);
    }
}
