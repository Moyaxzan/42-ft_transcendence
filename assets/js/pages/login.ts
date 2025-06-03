import { renderProfile } from './profile.js'
import { renderHome } from './home.js'

declare global {
	interface Window {
		google: any;
		handleGoogleCredentialResponse: (response: any) => void;
	}
}

function loadGoogleSdk(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (window.google && window.google.accounts) {
			resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Failed to load Google SDK'));
		document.head.appendChild(script);
	});
}

export async function renderLogin(): Promise<void> {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/login.html');
	const html = await res.text();
	app.innerHTML = html;

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

	try {
		await loadGoogleSdk();

		const clientIdRes = await fetch('/auth/google/client-id');
		const { clientId } = await clientIdRes.json();

		console.log('Id received:', clientId);

		window.handleGoogleCredentialResponse = async function(response) {
			const { credential } = response;
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

		window.google.accounts.id.initialize({
			client_id: clientId,
			callback: window.handleGoogleCredentialResponse,
		});

		window.google.accounts.id.renderButton(
			document.getElementById('googleSignInDiv'),
			{ theme: 'outline', size: 'large' }
		);
	} catch (err) {
		console.error("Error loading Google Sign-In", err);
	}
}
