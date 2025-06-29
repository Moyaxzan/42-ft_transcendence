import { animateLinesToFinalState } from './navbar.js'
import { setLanguage, toggleLanguage } from '../lang.js'

export async function renderHome() {
	console.log("renderHome called");
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/home.html');
	const html = await res.text();

	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr');

	setTimeout(() => {
		const toggleButton = document.getElementById('lang-toggle');
		if (toggleButton) {
			console.log("Button found in timeout");
			toggleButton.addEventListener('click', () => {
				console.log("Lang button clicked");
				toggleLanguage();
			});
		} else {
			console.warn("Button NOT found in timeout");
		}
	}, 100);
	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
		{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
	]);
}
