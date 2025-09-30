// import { renderHome } from '../home.js'
import { getCurrentLang, setLanguage, qrCodeMessages, loginMessages } from '../../lang.js';
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
			messageEl.textContent = loginMessages.fields[getCurrentLang()];
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
					messageEl.textContent = qrCodeMessages.required[getCurrentLang()];
					twofaSection?.classList.remove('hidden');
					pendingEmail = email;
					pendingPassword = password;
					return;
				}

				if (data?.error === '2FA_SETUP_REQUIRED') {
					messageEl.textContent = qrCodeMessages.required[getCurrentLang()];
					pendingEmail = email;
					pendingPassword = password;

					twofaSetupModal?.classList.remove('hidden');
					if (qrCodeContainer) 
						qrCodeContainer.innerHTML = qrCodeMessages.loading[getCurrentLang()];

					try {
						const qrRes = await fetch('/auth/2fa/setup', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password }),
						});
						const qrData = await qrRes.json();

						if (!qrRes.ok || !qrData.qrCodeUrl) {
							if (qrCodeContainer) 
								qrCodeContainer.innerHTML = qrCodeMessages.failed[getCurrentLang()];
							return;
						}
						if (qrCodeContainer) 
							qrCodeContainer.innerHTML = `<img src="${qrData.qrCodeUrl}" alt="QR Code 2FA" class="mx-auto" />`;
					}
					catch (err) {
						if (qrCodeContainer) 
							qrCodeContainer.innerHTML = qrCodeMessages.network[getCurrentLang()];
						console.error(err);
					}

					return;
				}

				if (data?.error === 'USER_NOT_FOUND') {
					messageEl.textContent = loginMessages.notFound[getCurrentLang()];
					return ;
				}

				if (data?.error === 'INCORRECT_PASSWORD') {
					messageEl.textContent = loginMessages.incorrect[getCurrentLang()];
					return ;
				}
				messageEl.textContent = data?.message || loginMessages.failed[getCurrentLang()];
				return;
			}

			// messageEl.style.color = 'green';
			// messageEl.textContent = 'Connexion successful';
			hideLoginModal();
		}
		catch (err) {
			messageEl.textContent = loginMessages.network[getCurrentLang()];
			console.error(err);
		}
	});

	submit2FABtn?.addEventListener('click', async () => {
		const code = totpInput?.value.trim();

		if (!code || !pendingEmail || !pendingPassword) {
			messageEl.textContent = qrCodeMessages.enter[getCurrentLang()];
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
				messageEl.textContent = data?.message || qrCodeMessages.invalid[getCurrentLang()];
				return;
			}

			messageEl.style.color = 'green';
			messageEl.textContent = loginMessages.success[getCurrentLang()];
			window.history.pushState({}, "", "/");
			router();
		}
		catch (err) {
			messageEl.textContent = qrCodeMessages.network[getCurrentLang()];
			console.error(err);
		}
	});
}
