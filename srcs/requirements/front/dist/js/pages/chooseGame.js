import { animateLinesToFinalState } from './navbar.js';
export async function renderChooseGame() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/chooseGame.html');
    const html = await res.text();
    app.innerHTML = html;
    const navbar = document.getElementById("line-top");
    const footer = document.getElementById("line-bottom");
    if (!navbar || !footer) {
        console.log("html element not found");
        return;
    }
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
    ]);
}
