// import { renderHome } from '../home.js'
import { getCurrentLang, setLanguage, qrCodeMessages, loginMessages } from '../../lang.js';
import { animateLinesToFinalState } from '../navbar.js'
import { hideRegisterModal } from '../modals.js';
import { router } from '../../router.js'


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

export async function renderRegister(): Promise<void> {
	document.title = "Register";
	const app = document.getElementById('app');
	if (!app)
		return;

	// const res = await fetch('/dist/html/modals/register.html');
	// const html = await res.text();
	// app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr');

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

	const registerForm = document.getElementById('registerForm') as HTMLFormElement | null;
	const messageEl = document.getElementById('registerMessage') as HTMLElement | null;
	const twofaSection = document.getElementById('twofa-section') as HTMLElement | null;
	const submit2FABtn = document.getElementById('submit2FA') as HTMLButtonElement | null;
	const totpInput = document.getElementById('totp') as HTMLInputElement | null;
	const twofaSetupModal = document.getElementById('twofa-setup-modal') as HTMLElement | null;
	const qrCodeContainer = document.getElementById('qrCodeContainer') as HTMLElement | null;
	const close2FAModalBtn = document.getElementById('close2FAModal') as HTMLButtonElement | null;
	// const googleDiv = document.getElementById('googleSignInDiv');
	// if (googleDiv && window.google && window.google.accounts && window.google.accounts.id) {
	// 	window.google.accounts.id.renderButton(googleDiv, {
	// 		theme: 'outline',
	// 		size: 'large',
	// 		width: 280
	// 	});
	// }

	let pendingEmail = '';
	let pendingPassword = '';

	if (!registerForm || !messageEl)
		return;

	close2FAModalBtn?.addEventListener('click', () => {
		twofaSetupModal?.classList.add('hidden');
		if (qrCodeContainer) 
			qrCodeContainer.innerHTML = '';
	});

	registerForm.addEventListener('submit', async (e: Event) => {
		e.preventDefault();
		console.log("SUBMIT EVENT LISTENER LISTENED NICELY !!!!!!!!!!!!");

		const target = e.target as HTMLFormElement;
		const email = (target.elements.namedItem('email') as HTMLInputElement)?.value.trim();
		const password = (target.elements.namedItem('password') as HTMLInputElement)?.value.trim();
		const nameInput = (target.elements.namedItem('name-input') as HTMLInputElement)?.value;

		messageEl.style.color = 'red';
		messageEl.textContent = '';
		twofaSection?.classList.add('hidden');

		if (!email || !password || !nameInput) {
			messageEl.textContent = loginMessages.fields[getCurrentLang()];
			return;
		}

		try {
			const res = await fetch('/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name: nameInput, password }),
			});
			console.log("POST DONE !!! ->");
			console.log(res);
			const data = await res.json().catch(() => null);

			if (!res.ok) {
				console.log(res);
				messageEl.textContent = loginMessages.alreadyExists[getCurrentLang()];
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

				// messageEl.textContent = "Error: User already exists (username or email)";
				return;
			}

			messageEl.style.color = 'green';
			messageEl.textContent = loginMessages.successReg[getCurrentLang()];
			//TODO trad
			//TODO better register message (persistent on home)
			// hideRegisterModal();
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
			messageEl.textContent = loginMessages.successReg[getCurrentLang()];
			window.history.pushState({}, "", "/");
			router();
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
			window.history.pushState({}, "", "/");
			router();
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
