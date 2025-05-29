interface User {
	id: string;
	is_ia: string | null;
	name: string;
	email: string | null;
	id_token: string | null;
	password_hash: string | null;
	reset_token: string | null;
	reset_expiry: string | null;
	ip_address: string;
	is_log: string;
	points: string;
}

export async function renderProfile() {
	const app = document.getElementById('app');
	if (!app) return;

	const htmlRes = await fetch('/dist/html/profile.html');
	if (!htmlRes.ok) {
		app.innerHTML = "<p>Cannot charge profile page.</p>";
		return;
	}
	const html = await htmlRes.text();
	app.innerHTML = html;

	const profileArea = document.querySelector("#profileArea");

	if (!profileArea) {
		console.error("#profileArea not found in profile.html");
		return;
	}

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
				<li><strong>Email:</strong> ${user.email ?? 'no info'}</li>
				<li><strong>IP:</strong> ${user.ip_address}</li>
				<li><strong>Points:</strong> ${user.points}</li>
			</ul>
			<button id="logoutBtn">Log out</button>
		`;

		const logoutBtn = document.getElementById('logoutBtn');
		logoutBtn?.addEventListener('click', async () => {
			await fetch('/logout', {
				method: 'POST',
				credentials: 'include'
			});
			location.reload();
		});

	} catch (error) {
		console.error("Error retrieving profile :", error);
		profileArea.innerHTML = "<p>Error: you're not logged in</p>";

		const loginLink = document.getElementById('loginLink');
		if (loginLink) {
			loginLink.classList.remove('hidden');
	}
	}
}

// export async function renderProfile() {
// 	const app = document.getElementById('app');
// 	if (!app)
// 		return;
// 	const res = await fetch('/dist/html/profile.html');
// 	const html = await res.text();
// 	app.innerHTML = html;


// 	const userLoadBtn = document.querySelector("#userLoad");
// 	const userList = document.querySelector("#userList"); 

// 	if (!userLoadBtn || !userList) {
// 		console.error("#userLoad or #userList not found.");
// 		return;
// 	}

// 	userLoadBtn.addEventListener('click', async () => {
// 		console.log("btn clique");
// 		const res = await fetch('/users');
// 		if (!res.ok) throw new Error('Fail to load');
// 		const users: User[] = await res.json();
// 		userList.innerHTML = '';
// 		if (users.length > 0) {
// 			const list = document.createElement("ul");
// 			users.forEach((user) => {
// 				const listItem = document.createElement("li");
// 				listItem.textContent = Object.entries(user).map(([key, value]) =>
// 					`${key}: ${value}`).join(', ');
// 					list.appendChild(listItem);
// 			});
// 			userList.appendChild(list);
// 		} else {
// 			userList.innerHTML = '<p>No users found</p>';
// 		}
// 	});
// }
