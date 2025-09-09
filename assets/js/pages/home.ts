import { animateLinesToFinalState } from './navbar.js'
import { getCurrentLang, setLanguage } from '../lang.js'
import { getCurrentUser } from '../auth.js';

interface Stats {
  wins: number;
  losses: number;
}


function displayStats(stats: Stats) {

	interface Translations {
		matches: string;
		wins: string;
		losses: string;
		winrate: string;
	}

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

	if (matchEl) matchEl.textContent = `${stats.wins + stats.losses} ${t.matches}`;
	if (winEl) winEl.textContent = `${stats.wins} ${t.wins}`;
	if (lossEl) lossEl.textContent = `${stats.losses} ${t.losses}`;
	if (winrateEl) winrateEl.textContent = `${stats.wins * 100 / (stats.wins + stats.losses)}% ${t.winrate}`;
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
	if (!loginBtn
		|| !registerBtn
		|| !googleBtn
		|| !statsHeader
		|| !statsElems
		|| !welcomeMessage) {
		console.error("Some DOM elements have not been found");
		return;
	}

	const user = await getCurrentUser();
	if (user) {
		registerBtn.classList.add('hidden');
		loginBtn.classList.add('hidden');
		googleBtn.classList.add('hidden');
		displayStats( {wins: user.wins, losses: user.losses } );
		console.log("Logged in as", user.name);
	} else {
		statsHeader.classList.add("hidden");
		statsElems.classList.add("hidden");
		welcomeMessage.classList.add("hidden");
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
