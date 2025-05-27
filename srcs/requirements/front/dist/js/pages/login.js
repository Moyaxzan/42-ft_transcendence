export async function renderLogin() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/login.html');
    const html = await res.text();
    app.innerHTML = html;
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
        }
        catch (err) {
            messageEl.textContent = 'Network error, please try again later';
            console.error(err);
        }
    });
}
