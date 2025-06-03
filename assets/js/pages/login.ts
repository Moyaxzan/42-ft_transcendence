import { renderProfile } from './profile.js'
import { renderHome } from './home.js'

declare global {
	interface Window {
		google: any;
		handleGoogleCredentialResponse: (response: any) => void;
	}
}

export async function renderLogin(): Promise<void> {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/login.html');
	const html = await res.text();
	app.innerHTML = html;

	window.handleGoogleCredentialResponse = async function(response) {
		const { credential } = response;
		console.log("Received credential from Google:", credential);
	
		const res = await fetch('/auth/google', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token: credential }),
		});
	
		if (!res.ok) {
			console.error(await res.text());
			return;
		}
	
		const data = await res.json();
		console.log('Connected via Google, got token:', data);
		renderProfile();
	};

	const backBtn = document.getElementById('backHomeBtn');
	backBtn?.addEventListener('click', () => {
		renderHome();
	});

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
			setTimeout(() => {
				renderProfile();
			}, 500);
		}
		catch (err) {
			messageEl.textContent = 'Network error, please try again later';
			console.error(err);
		}
	});
}
