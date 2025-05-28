export async function renderLogin(): Promise<void> {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/login.html');
	const html = await res.text();
	app.innerHTML = html;

	const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
	const messageEl = document.getElementById('loginMessage') as HTMLElement | null;

	if (!loginForm || !messageEl)
		return;

	loginForm.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const target = e.target as HTMLFormElement;
		const email = (target.elements.namedItem('email') as HTMLInputElement)?.value.trim();
		const password = (target.elements.namedItem('password') as HTMLInputElement)?.value.trim();

		messageEl.textContent = '';

		if (!email || !password) {
			messageEl.textContent = 'Please fill all the fields';
			return;
		}

		try {
			const res = await fetch('/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				messageEl.textContent = errorData?.message || 'Authentication failed: wrong credentials.';
				return;
			}

			const data: { token: string } = await res.json();
			localStorage.setItem('token', data.token);
			messageEl.style.color = 'green';
			messageEl.textContent = 'Connexion successful';

			console.log('JWT received:', data.token);
		}
		catch (err) {
			messageEl.textContent = 'Network error, please try again later';
			console.error(err);
		}
	});
}
