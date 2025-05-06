import { renderHome } from './pages/home';
import { renderAbout } from './pages/about';

// Define a map of paths to render functions
const routes: Record<string, () => void> = {
  '/': renderHome,
  '/about': renderAbout,
};

// Run this when URL changes or app first loads
export function router() {
  const path = window.location.pathname;
  const render = routes[path] || renderHome;
  render();
}

// Allow click links with data-link to pushState instead of full reload
export function enableLinkInterception() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('[data-link]')) {
      e.preventDefault();
      const href = target.getAttribute('href')!;
      history.pushState(null, '', href);
      router();
    }
  });
}
