import { animateLinesToFinalState } from './navbar.js'
import { getCurrentLang, setLanguage } from '../lang.js'
import { getCurrentUser } from '../auth.js';



function displayStats() {
	interface Stats {
	  matches: number;
	  wins: number;
	  losses: number;
	  winrate: number;
	}

	interface Translations {
	  matches: string;
	  wins: string;
	  losses: string;
	  winrate: string;
	}

	// Example stats data
	const stats: Stats = {
	  matches: 10,
	  wins: 6,
	  losses: 4,
	  winrate: 60,
	};

	// Translations
	const translations: Record<string, Translations> = {
	  en: { matches: "Matches", wins: "Wins", losses: "Losses", winrate: "Winrate" },
	  fr: { matches: "Matchs", wins: "Victoires", losses: "Défaites", winrate: "Taux de victoire" },
	  jp: { matches: "試合", wins: "勝ち", losses: "負け", winrate: "勝率" },
	};

	const t = translations[getCurrentLang()];

	const matchEl = document.getElementById('match-number');
	const winEl = document.getElementById('win-number');
	const lossEl = document.getElementById('loss-number');
	const winrateEl = document.getElementById('winrate-pourcent');

	if (matchEl) matchEl.textContent = `10 ${t.matches}`;
	if (winEl) winEl.textContent = `6 ${t.wins}`;
	if (lossEl) lossEl.textContent = `4 ${t.losses}`;
	if (winrateEl) winrateEl.textContent = `60% ${t.winrate}`;
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

	if (!loginBtn || !registerBtn || !googleBtn) {
		console.error("Some DOM elements have not been found");
		return;
	}

	registerBtn.classList.add('hidden');
	loginBtn.classList.add('hidden');
	googleBtn.classList.add('hidden');

	displayStats();
	const user = await getCurrentUser();
	if (!user) {
		// redirect to /login
	} else {
		console.log("Logged in as", user.name);
	}

	loginBtn.addEventListener('click', (e) => {
		e.preventDefault();
		// Utiliser système de navigation SPA
		window.history.pushState({}, '', '/login');
		window.dispatchEvent(new CustomEvent('routeChanged'));
	});


	registerBtn.addEventListener('click', (e) => {
		e.preventDefault();
		// Utiliser système de navigation SPA
		window.history.pushState({}, '', '/register');
		window.dispatchEvent(new CustomEvent('routeChanged'));
	});
}
