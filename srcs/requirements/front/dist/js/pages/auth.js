export async function renderAuth() {
	const app = document.getElementById('app');
	if (!app)
		return;
	const res = await fetch('/dist/html/auth.html');
	const html = await res.text();
	app.innerHTML = html;


	document.getElementById('loginForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const email = e.target.email.value.trim();
	const password = e.target.password.value.trim();
	const messageEl = document.getElementById('loginMessage');
	messageEl.textContent = '';

	if (!email || !password) {
		messageEl.textContent = 'Please fill all the fields';
		return;
	}

	try {
		const res = await fetch('/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		
		if (!res.ok) {
			messageEl.textContent = res.message || 'Authentification failed : wrong credentials.';
			return;
		}

		const data = await res.json();

		localStorage.setItem('token', data.token);
		messageEl.style.color = 'green';
		messageEl.textContent = 'Connexion successful';

		console.log('JWT received :', data.token);
	}
	catch (err) {
		messageEl.textContent = 'Error network, please try again later';
		console.error(err);
	}
  });
}