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
		script.src = 'https://accounts.google.com/gsi/client?hl=${}';
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
		if (usernameEl) usernameEl.textContent = user.name;

		console.log("Logged in as", user.name);
	} else {
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
		await loadGoogleSdk(getCurrentLang());

		const clientIdRes = await fetch("/auth/google/client-id");
		const { clientId } = await clientIdRes.json();

		console.log("Id received:", clientId);

		window.handleGoogleCredentialResponse = async function (response) {
			const { credential } = response;
			const res = await fetch("/auth/google", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: credential }),
			});

			if (!res.ok) {
				console.error(await res.text());
				return;
			}

			const data = await res.json();
			console.log("Connected via Google, got token:", data);
			window.history.pushState({}, "", "/");
			router();
		};

		window.google.accounts.id.initialize({
			client_id: clientId,
			callback: window.handleGoogleCredentialResponse,
			itp_support: true,
			cancel_on_tap_outside: false,
		});

		const googleBtn = document.getElementById("google-button");
		if (googleBtn) {
			googleBtn.addEventListener("click", () => {
				window.google.accounts.id.prompt((notification: any) => {
					console.log("[GSI] prompt notification:", notification);

					if (notification.isNotDisplayed?.()) {
						console.warn("[GSI] One Tap NOT displayed:", notification.getNotDisplayedReason?.());
					} else if (notification.isSkippedMoment?.()) {
						console.warn("[GSI] One Tap SKIPPED:", notification.getSkippedReason?.());
					} else if (notification.isDismissedMoment?.()) {
						console.warn("[GSI] One Tap DISMISSED:", notification.getDismissedReason?.());
					} else if (notification.isDisplayed?.()) {
						console.log("[GSI] One Tap DISPLAYED.");
					}
				});
			});
		}
	} catch (err) {
		console.error("Error loading Google Sign-In", err);
	}
}
