import { renderProfile } from './profile.js'
import { renderHome } from './home.js'
import { setLanguage } from '../lang.js';
import { animateLinesToFinalState } from './navbar.js'

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
		script.src = 'https://accounts.google.com/gsi/client?hl=en';
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Failed to load Google SDK'));
		document.head.appendChild(script);
	});
}

export async function renderLogin(): Promise<void> {
	document.title = "Login";
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/modals/login.html');
	const html = await res.text();
	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr');

	requestAnimationFrame(() => {
		animateLinesToFinalState([
			{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
			{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
		]);
	})


	const backBtn = document.getElementById('backHomeBtn');
	backBtn?.addEventListener('click', () => {
		renderHome();
	});

	const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
	const messageEl = document.getElementById('loginMessage') as HTMLElement | null;
	const twofaSection = document.getElementById('twofa-section') as HTMLElement | null;
	const submit2FABtn = document.getElementById('submit2FA') as HTMLButtonElement | null;
	const totpInput = document.getElementById('totp') as HTMLInputElement | null;
	const twofaSetupModal = document.getElementById('twofa-setup-modal');
	const qrCodeContainer = document.getElementById('qrCodeContainer');
	const close2FAModalBtn = document.getElementById('close2FAModal');
	const googleDiv = document.getElementById('googleSignInDiv');
	if (googleDiv && window.google && window.google.accounts && window.google.accounts.id) {
		window.google.accounts.id.renderButton(googleDiv, {
			theme: 'outline',
			size: 'large',
			width: 280
		});
	}

	let pendingEmail = '';
	let pendingPassword = '';

	if (!loginForm || !messageEl || !twofaSection || !submit2FABtn || !totpInput || !twofaSetupModal || !qrCodeContainer || !close2FAModalBtn)
		return;

	close2FAModalBtn.addEventListener('click', () => {
		twofaSetupModal.classList.add('hidden');
		qrCodeContainer.innerHTML = '';
	});

	loginForm.addEventListener('submit', async (e: Event) => {
		e.preventDefault();

		const target = e.target as HTMLFormElement;
		const email = (target.elements.namedItem('email') as HTMLInputElement)?.value.trim();
		const password = (target.elements.namedItem('password') as HTMLInputElement)?.value.trim();

		messageEl.style.color = 'red';
		messageEl.textContent = '';
		twofaSection.classList.add('hidden');

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

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				if (data?.error === '2FA_REQUIRED') {
					messageEl.textContent = 'Two-factor authentication required';
					twofaSection.classList.remove('hidden');
					pendingEmail = email;
					pendingPassword = password;
					return;
				}

				if (data?.error === '2FA_SETUP_REQUIRED') {
					messageEl.textContent = 'Two-factor authentication setup required';
					pendingEmail = email;
					pendingPassword = password;

					twofaSetupModal.classList.remove('hidden');
					qrCodeContainer.innerHTML = '<p>Loading QR code...</p>';

					try {
						const qrRes = await fetch('/auth/2fa/setup', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password }),
						});
						const qrData = await qrRes.json();

						if (!qrRes.ok || !qrData.qrCodeUrl) {
							qrCodeContainer.innerHTML = '<p class="text-red-600">Failed to load QR code</p>';
							return;
						}

						qrCodeContainer.innerHTML = `<img src="${qrData.qrCodeUrl}" alt="QR Code 2FA" class="mx-auto" />`;
					}
					catch (err) {
						qrCodeContainer.innerHTML = '<p class="text-red-600">Network error loading QR code</p>';
						console.error(err);
					}

					return;
				}

				messageEl.textContent = data?.message || 'Authentication failed.';
				return;
			}

			messageEl.style.color = 'green';
			messageEl.textContent = 'Connexion successful';
			setTimeout(() => renderProfile(), 500);
		}
		catch (err) {
			messageEl.textContent = 'Network error, please try again later';
			console.error(err);
		}
	});

	submit2FABtn.addEventListener('click', async () => {
		const code = totpInput?.value.trim();

		if (!code || !pendingEmail || !pendingPassword) {
			messageEl.textContent = 'Please enter the 2FA code';
			return;
		}

		try {
			const res = await fetch('/auth/2fa/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: pendingEmail,
					password: pendingPassword,
					token: code
				}),
			});

			const data = await res.json().catch(() => null);

			if (!res.ok) {
				messageEl.style.color = 'red';
				messageEl.textContent = data?.message || 'Invalid 2FA code';
				return;
			}

			messageEl.style.color = 'green';
			messageEl.textContent = 'Connexion successful';
			setTimeout(() => renderProfile(), 500);
		}
		catch (err) {
			messageEl.textContent = 'Network error during 2FA';
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
