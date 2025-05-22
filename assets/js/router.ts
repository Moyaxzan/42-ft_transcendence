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

interface User {
	id: string;
	is_ia: string;
	name: string;
	email: string;
	id_token: string;
	password_hash: string;
	reset_token: string;
	reset_expiry: string;
	ip_address: string;
	is_log: string;
	points: string;
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
			const users: User[] = await res.json();
			userList.innerHTML = '';
			if (users.length > 0) {
				const list = document.createElement("ul");
				users.forEach((user) => {
					const listItem = document.createElement("li");
					listItem.textContent = Object.entries(user).map(([key, value]) =>
						`${key}: ${value}`).join(', ');
					list.appendChild(listItem);
				});
				userList.appendChild(list);
			} else {
				userList.innerHTML = '<p>No users found</p>';
			}
	});
}
