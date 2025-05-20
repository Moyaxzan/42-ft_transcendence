import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';
import { renderPong } from './pages/pong.js';
import { renderUser } from './pages/user.js';

// Define a map of paths to render functions
const routes: Record<string, () => void> = {
  '/': renderHome,
  '/profile': renderProfile,
  '/pong': renderPong,
  '/users': renderUser,
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

export function displayUser() {
  const userLoadBtn = document.querySelector("#userLoad");
  const userList = document.querySelector("#userList");

  if (!userLoadBtn || !userList) {
    console.error("#userLoad or #userList not found.");
    return;
  }

  userLoadBtn.addEventListener('click', async () => {
      const res = await fetch('/users');
      if (!res.ok) throw new Error('Fail to load');
      const users: { id: string, name: string, id_token: string }[] = await res.json();

      userList.innerHTML = '';
      if (users.length > 0) {
        const list = document.createElement("ul");
        users.forEach((user) => {
          const listItem = document.createElement("li");
          listItem.textContent = `id: ${user.id}, name: ${user.name}, id_token: ${user.id_token}`;
          list.appendChild(listItem);
        });
        userList.appendChild(list);
      } else {
        userList.innerHTML = '<p>No users found</p>';
      }
  });
}
