import { renderGameMode } from './gameMode.js';
import { animateLinesToFinalState } from './navbar.js'

export async function renderHome() {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/home.html');
	const html = await res.text();

	app.innerHTML = html;

	// Récupération des éléments DOM nécessaires, lien entre code ts et page html (préparation des elmts à manipuler)
	const	navbar = document.getElementById("line-top") as HTMLDivElement;
	const	footer = document.getElementById("line-bottom") as HTMLDivElement;
	// const	video = document.getElementById("intro-video") as HTMLVideoElement;

	if (!navbar || !footer) {
		console.log("html element not found");
		return;
	}

	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
		{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
	]);

	// video.addEventListener("ended", () => {
	// 	video.pause(); //geler la vidéo en la mettant sur pause
	// 	video.removeAttribute("autoplay"); // enlever l'autoplay
	// 	video.setAttribute("preloead", "auto"); // empecher rechargement de la vidéo
	// 	video.style.objectFit = "cover";
	// 	video.style.display = "block";
	// });
}
