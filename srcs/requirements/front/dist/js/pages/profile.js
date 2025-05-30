import { renderHome } from './home.js';
export async function renderProfile() {
    var _a;
    const app = document.getElementById('app');
    if (!app)
        return;
    const htmlRes = await fetch('/dist/html/profile.html');
    if (!htmlRes.ok) {
        app.innerHTML = "<p>Cannot charge profile page.</p>";
        return;
    }
    const html = await htmlRes.text();
    app.innerHTML = html;
    const authActionContainer = document.getElementById('authActionContainer');
    const profileArea = document.querySelector("#profileArea");
    if (!profileArea || !authActionContainer) {
        console.error("#profileArea not found in profile.html");
        return;
    }
    const backBtn = document.getElementById('backHomeBtn');
    backBtn === null || backBtn === void 0 ? void 0 : backBtn.addEventListener('click', () => {
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
        const user = await res.json();
        profileArea.innerHTML = `
			<h2>Welcome, ${user.name} 👋</h2>
			<ul>
				<li><strong>Email:</strong> ${(_a = user.email) !== null && _a !== void 0 ? _a : 'no info'}</li>
				<li><strong>IP:</strong> ${user.ip_address}</li>
				<li><strong>Points:</strong> ${user.points}</li>
			</ul>
		`;
        authActionContainer.innerHTML = `
			<button id="logoutBtn" class="px-4 py-2 rounded bg-blue-400 text-black hover:bg-blue-500 transition">
				Log out
			</button>
		`;
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener('click', async () => {
            await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            location.reload();
        });
    }
    catch (error) {
        console.error("Error retrieving profile :", error);
        profileArea.innerHTML = "<p>Error: you're not logged in</p>";
        authActionContainer.innerHTML = `
			<a href="/login" id="loginLink" class="px-4 py-2 rounded bg-blue-400 text-black hover:bg-blue-500 transition">
				Go to Login
			</a>
		`;
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
