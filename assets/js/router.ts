import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';
import { renderPong, stopGame } from './pages/pong.js';
// import { renderUser } from './pages/user.js';
import { animateNavbarForPong, resetNavbar } from './pages/navbar.js';
import { renderAuth } from './pages/auth.js';

// Define a map of paths to render functions
const routes: Record<string, () => void> = {
  '/': renderHome,
  '/profile': renderProfile,
  '/pong': renderPong,
  '/auth': renderAuth,
};

// Run this when URL changes or app first loads
export function router() {
	const path = window.location.pathname;
	console.log("Routing to:", path);
	
	if (path === "/pong") {
		animateNavbarForPong();
	}  else { 
		resetNavbar();
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
    const target = e.target as HTMLElement;
    if (target.matches('[data-link]')) {
      e.preventDefault();
      const href = target.getAttribute('href')!;
      console.log("Intercepted navigation to:", href);
      history.pushState(null, '', href);
      router();
    }
  });
}
