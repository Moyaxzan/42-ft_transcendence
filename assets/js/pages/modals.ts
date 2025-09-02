import { renderLogin } from './modals/login.js'
import { router } from '../router.js'


export function showWinnerModal(winnerName: string) {
	const modal = document.getElementById('winner-modal')!;
	const nameElem = document.getElementById('winnerName')!;
	nameElem.textContent = `${winnerName}`;
	modal.classList.remove('hidden');
}

export function hideWinnerModal() {
	const modal = document.getElementById('winner-modal')!;
	modal.classList.add('hidden');
}

export function showHelpModal() {
	const modal = document.getElementById('help-modal')!;
	modal.classList.remove('hidden');
}

export function hideHelpModal() {
	const modal = document.getElementById('help-modal')!;
	modal.classList.add('hidden');
}

export async function showLoginModal() {

	// Fetch modal HTML dynamically
	const res = await fetch("/dist/html/modals/login.html");
	const html = await res.text();

	// Insert into DOM if not already present
	if (!document.getElementById("loginModal")) {
	  document.body.insertAdjacentHTML("beforeend", html);
	}
	const modal = document.getElementById("loginModal")!;
	const closeBtn = document.getElementById("closeLoginModal")!;
	const form = document.getElementById("loginForm") as HTMLFormElement;

	modal.classList.remove("hidden");

	// Autofocus on email
	(document.getElementById("email") as HTMLInputElement)?.focus();

	await renderLogin();

	// Close button
	closeBtn.addEventListener("click", () => {
		modal.classList.add("hidden");
		window.history.pushState({}, "", "/");
		router();
	});
}
