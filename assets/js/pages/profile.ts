import { renderHome } from './home.js'
import { animateLinesToFinalState } from './navbar.js'
import { setLanguage } from '../lang.js';

interface User {
	id: string;
	name: string;
	wins: string;
	losses: string;
}

interface Match {
	id: string;
	status: string | null;
	user_id: string | null;
	winner_id: string | null;
	score: string;
	opponent_score: string;
	opponent_id: string;
	match_round: string | null;
	match_index: string;
}

export async function renderProfile() {
	document.title = "Profile";
	const app = document.getElementById('app');
	if (!app) return;

	const htmlRes = await fetch('/dist/html/profile.html');
	if (!htmlRes.ok) {
		app.innerHTML = "<p>Cannot charge profile page.</p>";
		return;
	}
	const html = await htmlRes.text();
	app.innerHTML = html;

	requestAnimationFrame(() => {
			animateLinesToFinalState([
				{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
				{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
			]);
		})

	const authActionContainer = document.getElementById('authActionContainer');
	const profileArea = document.querySelector("#profileArea");

	if (!profileArea || !authActionContainer) {
		console.error("#profileArea not found in profile.html");
		return;
	}

	const backBtn = document.getElementById('backHomeBtn');
	backBtn?.addEventListener('click', () => {
		renderHome();
	});

	try {
		const res = await fetch('/auth/me', {
			method: 'GET',
			credentials: 'include' //pr le couki
		});
		if (!res.ok) {
			throw new Error("User not logged or unauthorized.");
		}
		const user: User = await res.json();

		profileArea.innerHTML = `
			<h2>Welcome, ${user.name} 👋</h2>
			<ul>
				<li><strong>Losses:</strong> ${user.losses}</li>
				<li><strong>Wins:</strong> ${user.wins}</li>
			</ul>
		`;
		authActionContainer.innerHTML = `
			<button id="logoutBtn" class="px-4 py-2 rounded bg-blue-400 text-black hover:bg-blue-500 transition">
				Log out
			</button>
		`;

		const logoutBtn = document.getElementById('logoutBtn');
		logoutBtn?.addEventListener('click', async () => {
			await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
			location.reload();
		});

	} catch (error) {
		console.error("Error retrieving profile :", error);
		profileArea.innerHTML = "<p>Error: you're not logged in</p>";
		authActionContainer.innerHTML = `
			<a href="/login" id="loginLink" class="px-4 py-2 rounded bg-blue-400 text-black hover:bg-blue-500 transition">
				Go to Login
			</a>
		`;
	}
}

export async function renderUser() {
 	const app = document.getElementById('app');
 	if (!app)
 		return;
 	const res = await fetch('/dist/html/profile.html');
 	const html = await res.text();
 	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr');

 	const userLoadBtn = document.querySelector("#userLoad");
 	const userList = document.querySelector("#userList"); 

 	if (!userLoadBtn || !userList) {
 		console.error("#userLoad or #userList not found.");
 		return;
 	}

 	userLoadBtn.addEventListener('click', async () => {
 		console.log("btn clique");
 		const res = await fetch('/api/users');
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
  
export async function renderMatch() {
 	const app = document.getElementById('app');
 	if (!app)
 		return;
 	const res = await fetch('/dist/html/profile.html');
 	const html = await res.text();
 	app.innerHTML = html;


 	const userLoadBtn = document.querySelector("#matchLoad");
 	const userList = document.querySelector("#matchList"); 
	const match_round = 0; 
	const match_index = 2; 

 	if (!userLoadBtn || !userList) {
 		console.error("#matchLoad or #matchList not found.");
 		return;
 	}

 	userLoadBtn.addEventListener('click', async () => {
 		console.log("btn clique");
 		const res = await fetch(`/api/matches/${match_round}/${match_index}`);
 		if (!res.ok) throw new Error('Fail to load');
 		const matches: Match[] = await res.json();
 		userList.innerHTML = '';
 		if (matches.length > 0) {
 			const list = document.createElement("ul");
 			matches.forEach((match) => {
 				const listItem = document.createElement("li");
 				listItem.textContent = Object.entries(match).map(([key, value]) =>
 					`${key}: ${value}`).join(', ');
 					list.appendChild(listItem);
 			});
 			userList.appendChild(list);
 		} else {
 			userList.innerHTML = '<p>No matches found</p>';
 		}
 	});
}
