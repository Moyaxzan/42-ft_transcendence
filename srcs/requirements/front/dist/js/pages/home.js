import { animateLinesToFinalState } from './navbar.js';
export async function renderHome() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/home.html');
    console.log("rendering home.html");
    const html = await res.text();
    app.innerHTML = html;
    const navbar_overlay = document.getElementById("line-top-overlay");
    const footer_overlay = document.getElementById("line-bottom-overlay");
    const navbar = document.getElementById("line-top");
    const footer = document.getElementById("line-bottom");
    const playButton = document.getElementById("play-button");
    if (!navbar || !footer || !navbar_overlay || !footer_overlay || !playButton) {
        console.log("html element not found");
        return;
    }
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -10, translateYvh: -25, height: "50vh" },
        { id: "line-bottom", rotationDeg: -10, translateYvh: 25, height: "50vh" },
    ]);
    function updatePlayScale(isInside) {
        if (isInside) {
            playButton.classList.remove("scale-125");
        }
        else {
            playButton.classList.add("scale-125");
        }
    }
    // Track mouse overlays
    let isOverNavbar = false;
    let isOverFooter = false;
    navbar_overlay.addEventListener("mouseenter", () => {
        isOverNavbar = true;
        navbar.classList.add("scale-125");
        navbar_overlay.classList.add("scale-125");
        updatePlayScale(true);
    });
    navbar_overlay.addEventListener("mouseleave", () => {
        isOverNavbar = false;
        navbar.classList.remove("scale-125");
        navbar_overlay.classList.remove("scale-125");
        updatePlayScale(isOverFooter || isOverNavbar);
    });
    footer_overlay.addEventListener("mouseenter", () => {
        isOverFooter = true;
        footer.classList.add("scale-125");
        footer_overlay.classList.add("scale-125");
        updatePlayScale(true);
    });
    footer_overlay.addEventListener("mouseleave", () => {
        isOverFooter = false;
        footer.classList.remove("scale-125");
        footer_overlay.classList.remove("scale-125");
        updatePlayScale(isOverFooter || isOverNavbar);
    });
    playButton.classList.add("scale-125");
}
