export async function renderPlay() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const htmlRes = await fetch('/dist/html/play.html');
    if (!htmlRes.ok) {
        app.innerHTML = "<p>Cannot charge profile page.</p>";
        return;
    }
    const html = await htmlRes.text();
    app.innerHTML = html;
    const form = document.getElementById("tournament-form");
    const playerInputs = document.getElementById("player-inputs");
    const addButton = document.getElementById("add-player");
    addButton.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter player name";
        input.className = "player-input border p-1 rounded w-full";
        playerInputs.appendChild(input);
    });
    form.addEventListener("submit", async (e) => {
        //	console.log("je passe ici");
        e.preventDefault();
        const inputs = playerInputs.querySelectorAll(".player-input");
        const names = Array.from(inputs).map(input => input.value.trim()).filter(name => name !== "");
        const tournaments = null;
        if (names.length < 2) {
            alert("Please enter at least two players.");
            return;
        }
        console.log(`names: ${names}, tournamentId: ${tournaments}`);
        const response = await fetch("api/tournaments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players: names, tournamentId: tournaments })
        });
        if (response.ok) {
            alert("Tournament created!");
        }
        else {
            alert("Failed to create tournament");
        }
    });
}
/*
export async function renderPlay() {
    const app = document.getElementById('app');
    if (!app) return;

    const htmlRes = await fetch('/dist/html/play.html');
    if (!htmlRes.ok) {
        app.innerHTML = "<p>Cannot charge profile page.</p>";
        return;
    }
    const html = await htmlRes.text();
    app.innerHTML = html;

    //when page is loaded :
    document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("tournament-form")!;
    const playerInputs = document.getElementById("player-inputs")!;
    const addButton = document.getElementById("add-player")!;

    addButton.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter player name";
        input.className = "player-input border p-1 rounded w-full";
        playerInputs.appendChild(input);
    });
        
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputs = playerInputs.querySelectorAll<HTMLInputElement>(".player-input");
        const names = Array.from(inputs).map(input => input.value.trim()).filter(name => name !== "");

        if (names.length < 2) {
            alert("Please enter at least two players.");
            return;
        }
        const response = await fetch("api/tournaments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ players: names })
        });
        if (response.ok) {
            alert("Tournament created!");
        } else {
            alert("Failed to create tournament");
        }
    });
    });
}
*/
