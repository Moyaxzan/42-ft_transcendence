// import { renderHome } from '../home.js'
import { setLanguage } from '../../lang.js';
import { animateLinesToFinalState } from '../navbar.js'
import { router } from '../../router.js'
import { hideLoginModal } from '../modals.js';

export async function renderLogin(): Promise<void> {
	document.title = "Login";
	const app = document.getElementById('app');
	if (!app)
		return;

	// const res = await fetch('/dist/html/modals/login.html');
	// const html = await res.text();
	// app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');

	requestAnimationFrame(() => {
		animateLinesToFinalState([
			{ id: "line-top", rotationDeg: 0, translateYvh: -20, height: "50vh" },
			{ id: "line-bottom", rotationDeg: 0, translateYvh: 30, height: "50vh" },
		]);
	})


	const backBtn = document.getElementById('backHomeBtn');
	backBtn?.addEventListener('click', () => {
		window.history.pushState({}, "", "/");
		router();
	});

	const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
	const messageEl = document.getElementById('loginMessage') as HTMLElement | null;
	const twofaSection = document.getElementById('twofa-section') as HTMLElement | null;
	const submit2FABtn = document.getElementById('submit2FA') as HTMLButtonElement | null;
	const totpInput = document.getElementById('totp') as HTMLInputElement | null;
	const twofaSetupModal = document.getElementById('twofa-setup-modal') as HTMLElement | null;
	const qrCodeContainer = document.getElementById('qrCodeContainer') as HTMLElement | null;
	const close2FAModalBtn = document.getElementById('close2FAModal') as HTMLButtonElement | null;

	let pendingEmail = '';
	let pendingPassword = '';

	if (!loginForm || !messageEl)
		return;

	close2FAModalBtn?.addEventListener('click', () => {
		twofaSetupModal?.classList.add('hidden');
		if (qrCodeContainer) 
			qrCodeContainer.innerHTML = '';
	});

	loginForm.addEventListener('submit', async (e: Event) => {
		e.preventDefault();
		console.log("SUBMIT EVENT LISTENER LISTENED NICELY !!!!!!!!!!!!");

		const target = e.target as HTMLFormElement;
		const email = (target.elements.namedItem('email') as HTMLInputElement)?.value.trim();
		const password = (target.elements.namedItem('password') as HTMLInputElement)?.value.trim();

		messageEl.style.color = 'red';
		messageEl.textContent = '';
		twofaSection?.classList.add('hidden');

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
			console.log("POST DONE !!! ->");
			console.log(res);
			const data = await res.json().catch(() => null);

			if (!res.ok) {
				if (data?.error === '2FA_REQUIRED') {
					messageEl.textContent = 'Two-factor authentication required';
					twofaSection?.classList.remove('hidden');
					pendingEmail = email;
					pendingPassword = password;
					return;
				}

				if (data?.error === '2FA_SETUP_REQUIRED') {
					messageEl.textContent = 'Two-factor authentication setup required';
					pendingEmail = email;
					pendingPassword = password;

					twofaSetupModal?.classList.remove('hidden');
					if (qrCodeContainer) 
						qrCodeContainer.innerHTML = '<p>Loading QR code...</p>';

					try {
						const qrRes = await fetch('/auth/2fa/setup', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password }),
						});
						const qrData = await qrRes.json();

						if (!qrRes.ok || !qrData.qrCodeUrl) {
							if (qrCodeContainer) 
								qrCodeContainer.innerHTML = '<p class="text-red-600">Failed to load QR code</p>';
							return;
						}
						if (qrCodeContainer) 
							qrCodeContainer.innerHTML = `<img src="${qrData.qrCodeUrl}" alt="QR Code 2FA" class="mx-auto" />`;
					}
					catch (err) {
						if (qrCodeContainer) 
							qrCodeContainer.innerHTML = '<p class="text-red-600">Network error loading QR code</p>';
						console.error(err);
					}

					return;
				}

				messageEl.textContent = data?.message || 'Authentication failed.';
				return;
			}

			// messageEl.style.color = 'green';
			// messageEl.textContent = 'Connexion successful';
			hideLoginModal();
		}
		catch (err) {
			messageEl.textContent = 'Network error, please try again later';
			console.error(err);
		}
	});

	submit2FABtn?.addEventListener('click', async () => {
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
			window.history.pushState({}, "", "/");
			router();
		}
		catch (err) {
			messageEl.textContent = 'Network error during 2FA';
			console.error(err);
		}
	});
}
