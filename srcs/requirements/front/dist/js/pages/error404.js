import { animateLinesToFinalState } from './navbar.js';
export async function render404() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/error404.html');
    const html = await res.text();
    app.innerHTML = html;
    // Récupération des éléments DOM nécessaires, lien entre code ts et page html (préparation des elmts à manipuler)
    // const	navbar = document.getElementById("line-top") as HTMLDivElement;
    // const	footer = document.getElementById("line-bottom") as HTMLDivElement;
    // if (!navbar || !footer) {
    // 	console.log("html element not found");
    // 	return;
    // }
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
    ]);
}
