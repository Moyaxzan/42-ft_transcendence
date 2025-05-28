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
	if (!app)
		return;
	const res = await fetch('/dist/html/profile.html');
	const html = await res.text();
	app.innerHTML = html;


	const userLoadBtn = document.querySelector("#userLoad");
	const userList = document.querySelector("#userList"); 

	if (!userLoadBtn || !userList) {
		console.error("#userLoad or #userList not found.");
		return;
	}

	userLoadBtn.addEventListener('click', async () => {
		console.log("btn clique");
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
