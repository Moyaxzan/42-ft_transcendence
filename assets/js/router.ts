import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';

// Define a map of paths to render functions
const routes: Record<string, () => void> = {
  '/': renderHome,
  '/profile': renderProfile,
};

// Run this when URL changes or app first loads
export function router() {
  const path = window.location.pathname;
   console.log("Routing to:", path);
  const render = routes[path] || renderHome;
  render();
}

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

document.addEventListener("DOMContentLoaded", () => {
  const userLoadButton = document.querySelector<HTMLButtonElement>("#userLoad");
  userLoadButton?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to load');
      const users: { name: string }[] = await res.json();

      const userList = document.querySelector<HTMLElement>("#userList");
      if (!userList) {
        console.error("userList element not found");
        return;
      }

      userList.innerHTML = '';
      if (users.length > 0) {
        const list = document.createElement("ul");
        users.forEach(user => {
          const listItem = document.createElement("li");
          listItem.textContent = user.name;
          list.appendChild(listItem);
        });
        userList.appendChild(list);
      } else {
        userList.innerHTML = '<p>No users found</p>';
      }
    } catch (err) {
      console.error(err);
    }
  });
});
