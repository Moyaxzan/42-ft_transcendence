import { animateLinesToFinalState } from './navbar.js'
import { getCurrentLang, setLanguage } from '../lang.js'
import { getCurrentUser } from '../auth.js';
import { router } from '../router.js'

declare global {
	interface Window {
		google: any;
		handleGoogleCredentialResponse: (response: any) => void;
	}
}

function loadGoogleSdk(lang = "en"): Promise<void> {
	return new Promise((resolve, reject) => {
		if (window.google && window.google.accounts) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = `https://accounts.google.com/gsi/client?hl=${lang}`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Failed to load Google SDK'));
		document.head.appendChild(script);
	});
}

interface Stats {
  wins: number;
  losses: number;
}

async function refreshAuthUI() {
	const registerBtn = document.getElementById('register-button');
	const loginBtn = document.getElementById('login-button');
	const googleBtn = document.getElementById('google-button');
	const statsHeader = document.getElementById('stats-header');
	const statsElems = document.getElementById('stats');
	const welcomeMessage = document.getElementById('welcome-message');
	const headLoginButton = document.getElementById('head-login-button');
	const headLogoutButton = document.getElementById('head-logout-button');
	const twofaDiv = document.getElementById('twofa-container');

	if (!loginBtn
		|| !registerBtn
		|| !googleBtn
		|| !statsHeader
		|| !statsElems
		|| !welcomeMessage
	    || !headLoginButton
	    || !headLogoutButton
	    || !twofaDiv) {
		console.error("Some DOM elements have not been found");
		return;
	}

	// Always hide the login button
	headLoginButton.classList.add('hidden');

	const user = await getCurrentUser();

	if (user) {
		// User logged in → hide login/register/google, show logout
		registerBtn.classList.add('hidden');
		loginBtn.classList.add('hidden');
		googleBtn.classList.add('hidden');
	
		//display logout, stats, 2FA and Welcome
		headLogoutButton.classList.remove('hidden');
		twofaDiv.classList.remove('hidden');
		displayStats({ wins: user.wins, losses: user.losses });
		const usernameEl = document.getElementById('welcome-username');
		if (usernameEl) usernameEl.textContent = user.name;

		console.log("Logged in as", user.name);
	} else {
		// User not logged in → show login/register/google, hide logout + stats
		registerBtn.classList.remove('hidden');
		loginBtn.classList.remove('hidden');
		googleBtn.classList.remove('hidden');
	
		// hide logout, stats, 2FA & Welcome
		headLogoutButton.classList.add('hidden');
		statsHeader.classList.add("hidden");
		statsElems.classList.add("hidden");
		twofaDiv.classList.add('hidden');
		welcomeMessage.classList.add("hidden");

		console.log("Not logged in");
	}
if (user) {
    displayStats({ wins: user.wins, losses: user.losses });
    setupTwoFASwitch(user); // <<< ici
} else {
    const container = document.getElementById('twofa-container');
    if (container) container.classList.add('hidden');
}
}

function displayStats(stats: Stats) {
	const matchEl = document.getElementById('match-number')?.querySelector(".stat-value");
	const winEl = document.getElementById('win-number')?.querySelector(".stat-value");
	const lossEl = document.getElementById('loss-number')?.querySelector(".stat-value");
	const winrateEl = document.getElementById('winrate-pourcent')?.querySelector(".stat-value");

	if (matchEl) matchEl.textContent = String(stats.wins + stats.losses);
	if (winEl) winEl.textContent = String(stats.wins);
	if (lossEl) lossEl.textContent = String(stats.losses);
	if (winrateEl) winrateEl.textContent =
		(stats.wins + stats.losses > 0
			? (stats.wins * 100 / (stats.wins + stats.losses)).toFixed(1)
			: "0") + "%";
}

async function init2FAToggle() {
	const toggle = document.getElementById("twofa-toggle") as HTMLInputElement | null;
	if (!toggle) return;

	// handle changes
	toggle.addEventListener("change", async () => {
		const resUser = await fetch("/api/me", {
		  method: "GET",
		  credentials: "include" // cookie JWT
		});
		console.log("after /api/me");
		console.log(resUser);
		const user = await resUser.json();

		if (toggle.checked) {
			console.log("trying to activate 2FA");
			const res = await fetch("/auth/2fa/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					email: user.email
				})
			});

			const data = await res.json();
			if (res.ok) {
				// Afficher le QR code
				const img = document.createElement("img");
				img.src = data.qrCodeUrl;
				document.body.appendChild(img); // ou ouvrir un modal

				// Demander à l’utilisateur d’entrer un code OTP
				const otp = prompt("Entrez le code affiché dans votre application 2FA :");

				// 2. Vérification du code
				const verifyRes = await fetch("/auth/2fa/verify", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						email: user.email,
						token: otp
					})
				});

				const verifyData = await verifyRes.json();
				if (verifyRes.ok) {
					alert("✅ 2FA activée avec succès !");
				} else {
					alert(verifyData.error || "Code invalide");
					toggle.checked = false; // revert si échec
				}
			} else {
				alert(data.error || "Impossible d’activer la 2FA");
				toggle.checked = false;
			}
		} else {
			console.log("trying to deactivate 2FA");
			// Désactiver la 2FA
			const res = await fetch("/auth/2fa/disable", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ email: user.email })
			});

			const data = await res.json();
			if (res.ok) {
				alert("2FA désactivée");
			} else {
				alert(data.error || "Impossible de désactiver la 2FA");
				toggle.checked = true; // revert si échec
			}
		}
	});
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

	setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');
	
	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: -7, translateYvh: -30, height: "50vh" },
		{ id: "line-bottom", rotationDeg: -7, translateYvh: 30, height: "50vh" },
	]);
	const	registerBtn = document.getElementById('register-button');
	const	loginBtn = document.getElementById('login-button');
	const	googleBtn = document.getElementById('google-button');
	const	statsHeader = document.getElementById('stats-header');
	const	statsElems = document.getElementById('stats');
	const	welcomeMessage = document.getElementById('welcome-message');
	const	headLoginButton = document.getElementById('head-login-button');
	const	headLogoutButton = document.getElementById('head-logout-button');

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
	init2FAToggle();
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


	try {
		// 1. Load the Google SDK
		await loadGoogleSdk(getCurrentLang());

		// 2. Fetch client ID from your backend
		const clientIdRes = await fetch("/auth/google/client-id");
		const { clientId } = await clientIdRes.json();

		console.log("Id received:", clientId);

		// 3. Create OAuth2 popup client
		const client = window.google.accounts.oauth2.initCodeClient({
			client_id: clientId,
			scope: 'openid email profile',
			ux_mode: 'popup', // popup instead of redirect
			callback: async (response: any) => {
				// 4. Handle token exchange with your backend
				const res = await fetch('/auth/google', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token: response.code }),
				});

				if (!res.ok) {
					console.error('Failed to sign in via Google:', await res.text());
					return;
				}

				console.log('Signed in:', await res.json());
				window.history.pushState({}, '', '/');
				router(); // or whatever routing you use
			},
		});

		// 5. Attach handler to the Google Sign-In button
		googleBtn.addEventListener('click', () => {
			client.requestCode();  // <-- opens popup every time
		});
	} catch (err) {
		console.error("Error loading Google Sign-In", err);
	}
}

async function setupTwoFASwitch(user: any) {
    const container = document.getElementById('twofa-container');
    const switchBtn = document.getElementById('twofa-switch') as HTMLInputElement | null;
    if (!container || !switchBtn || !user) return;

    container.classList.remove('hidden');

    // Initialiser l'état
    switchBtn.checked = user.twofa_enabled === 1;

    switchBtn.addEventListener('click', async () => {
        const newEnabled = switchBtn.checked;

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
                switchBtn.checked = !newEnabled;
                console.error('Error updating 2FA:', data);
                alert('Failed to update 2FA. Try again.');
            } else {
                console.log(`2FA ${newEnabled ? 'enabled' : 'disabled'} successfully`);
            }
        } catch (err) {
            switchBtn.checked = !newEnabled;
            console.error(err);
            alert('Failed to update 2FA. Try again.');
        }
    });
}
