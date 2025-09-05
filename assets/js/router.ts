import { renderHome } from './pages/home.js';
import { renderGameMode } from './pages/gameMode.js';
import { renderPlayers } from './pages/players.js';
import { renderPong, stopGame } from './pages/pong.js';
import { render404 } from './pages/error404.js';
import { showLoginModal, showRegisterModal } from './pages/modals.js'

import { renderProfile, renderUser, renderMatch } from './pages/profile.js';
import { renderLogin } from './pages/modals/login.js';
import { renderRegister } from './pages/modals/register.js';

// Define a map of paths to render functions
const routes: Record<string, () => void> = {
  '/': renderHome,
  '/game-mode': renderGameMode,
  '/players': renderPlayers,
  '/pong': renderPong,

  '/profile': renderProfile,
  '/login': renderLogin,
  '/register': renderRegister,
  '/users': renderUser,
  '/matches': renderMatch,
};

// Run this when URL changes or app first loads
export function router() {
	const path = window.location.pathname;
	console.log("Routing to:", path);
	const helpBtn = document.getElementById("help-button") as HTMLDivElement;
	if (helpBtn) {
		if (routes[path]) {
			helpBtn.classList.remove('hidden')
		} else {
			helpBtn.classList.add('hidden')
		}
	}
	const render = routes[path] || render404;
	if (path != "/pong") {
		console.log("game should stop");
		stopGame();
		const countdownDiv = document.getElementById("countdown") as HTMLDivElement;
		if (countdownDiv) {
			countdownDiv.style.display = "none";
		}
	}
	if (path === "/login") {
		showLoginModal();
		return ;
	}
	if (path === "/register") {
		showRegisterModal();
		return ;
	}
	render();
}
// Allow click links with data-link to pushState instead of full reload
export function enableLinkInterception() {
	console.log("Setting up link interception");
	document.addEventListener('click', (e) => {
		const	link = (e.target as HTMLElement).closest('[data-link]') as HTMLAnchorElement | null;
		if (link) {
			e.preventDefault();
			const	href = link.getAttribute('href')!;
			if (!href)
				return;
			console.log("Intercepted navigation to:", href);
			history.pushState(null, '', href);
			router();
		}
	});
}

/*
Pourquoi est-ce mieux que matches() ? :
matches('[data-link]') ne fonctionne que sur l’élément cliqué,
donc si on clique sur une <span> à l'intérieur d’un lien,
l’interception ne se fait pas.

En utilisant closest('[data-link]'), on remonte jusqu’au lien contenant
(si présent), même si l’élément cliqué est imbriqué dans un bouton,
une icône, etc.
C’est le comportement standard attendu d’un système SPA */
