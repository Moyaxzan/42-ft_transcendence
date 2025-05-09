import { renderHome } from './pages/home.js';
import { renderAbout } from './pages/about.js';
// Define a map of paths to render functions
const routes = {
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
        const target = e.target;
        if (target.matches('[data-link]')) {
            e.preventDefault();
            const href = target.getAttribute('href');
            history.pushState(null, '', href);
            router();
        }
    });
}

document.querySelector("#userLoad").addEventListener('click', async () => {
	const res = await fetch('/api/users');
	if (!res.ok) throw new Error('Failed to load');
	const users = await res.json();
	const userList = document.querySelector("#userList"); 
	userList.innerHTML = '';
	if (users.length > 0) {
		const list = document.createElement("ul");
		users.forEach(user => {
			const listItem = document.createElement("li");
			listItem.textContent = `${user.name}`;
			list.appendChild(listItem);
		});
		userList.appendChild(list);
	} else {
		userList.innerHTML = '<p>No users found</p>';
	}
});
