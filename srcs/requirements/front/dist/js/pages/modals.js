import { renderLogin } from './modals/login.js';
import { renderRegister } from './modals/register.js';
import { router } from '../router.js';
export function showWinnerModal(winnerName) {
    const modal = document.getElementById('winner-modal');
    const nameElem = document.getElementById('winnerName');
    nameElem.textContent = `${winnerName}`;
    modal.classList.remove('hidden');
}
export function hideWinnerModal() {
    const modal = document.getElementById('winner-modal');
    modal.classList.add('hidden');
}
export function showHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.remove('hidden');
}
export function hideHelpModal() {
    const modal = document.getElementById('help-modal');
    modal.classList.add('hidden');
}
export function hideLoginModal() {
    const modal = document.getElementById("loginModal");
    modal?.classList.add("hidden");
    window.history.pushState({}, "", "/");
    router();
}
export async function showLoginModal() {
    // Fetch modal HTML dynamically
    const res = await fetch("/dist/html/modals/login.html");
    const html = await res.text();
    // Insert into DOM if not already present
    if (!document.getElementById("loginModal")) {
        document.body.insertAdjacentHTML("beforeend", html);
    }
    const modal = document.getElementById("loginModal");
    const closeBtn = document.getElementById("closeLoginModal");
    const form = document.getElementById("loginForm");
    modal.classList.remove("hidden");
    // Autofocus on email
    document.getElementById("email")?.focus();
    await renderLogin();
    // Close button
    closeBtn.addEventListener("click", () => {
        hideLoginModal();
    });
}
export function hideRegisterModal() {
    const modal = document.getElementById("registerModal");
    modal?.classList.add("hidden");
    window.history.pushState({}, "", "/");
    router();
}
export async function showRegisterModal() {
    // Fetch modal HTML dynamically
    const res = await fetch("/dist/html/modals/register.html");
    const html = await res.text();
    // Insert into DOM if not already present
    if (!document.getElementById("registerModal")) {
        document.body.insertAdjacentHTML("beforeend", html);
    }
    const modal = document.getElementById("registerModal");
    const closeBtn = document.getElementById("closeRegisterModal");
    const form = document.getElementById("registerForm");
    modal.classList.remove("hidden");
    // Autofocus on email
    document.getElementById("email")?.focus();
    await renderRegister();
    // Close button
    closeBtn.addEventListener("click", () => {
        hideRegisterModal();
    });
}
