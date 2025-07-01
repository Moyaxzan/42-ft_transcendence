import { animateLinesToFinalState } from './navbar.js'
import { setLanguage } from '../lang.js'

export async function renderHome() {
	console.log("renderHome called");
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/home.html');
	const html = await res.text();

	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr');
	
	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
		{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
	]);
}
