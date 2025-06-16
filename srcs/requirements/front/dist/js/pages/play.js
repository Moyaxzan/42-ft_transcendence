import { animateLinesToFinalState } from './navbar.js';
// Variable globale pour stocker les joueurs
let players = [];
let nextPlayerId = 1;
export async function renderPlay() {
    // Récupération de l'élément app principal
    const app = document.getElementById('app');
    if (!app)
        return;
    // Chargement du HTML de la page alias
    const res = await fetch('/dist/html/play.html');
    console.log("Rendering alias.html");
    const html = await res.text();
    // Injection du HTML dans l'app
    app.innerHTML = html;
    // Animation des lignes de fond
    // animateLinesToFinalState([
    // 	{ id: "line-top", rotationDeg: 0, translateYvh: -50, height: "25vh" },
    // 	{ id: "line-bottom", rotationDeg: 0, translateYvh: 50, height: "25vh" },
    // ]);
    animateLinesToFinalState([
        { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
        { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
    ]);
    // Récupération des éléments DOM nécessaires, lien entre code ts et page html (préparation des elmts à manipuler)
    const aliasInput = document.getElementById("alias-input");
    const addAliasBtn = document.getElementById("add-alias-btn");
    const playersList = document.getElementById("players-list");
    const noPlayersMsg = document.getElementById("no-players");
    const beginGameBtn = document.getElementById("begin-game-btn");
    // Vérification que tous les éléments existent
    if (!aliasInput || !addAliasBtn || !playersList || !noPlayersMsg || !beginGameBtn) {
        console.error("Some DOM elements have not been found");
        return;
    }
    // Fonction pour valider un alias
    function isValidAlias(alias) {
        // Vérifier que l'alias n'est pas vide
        if (alias.length === 0)
            return (false);
        // Vérifier que l'alias n'existe pas déjà
        if (players.some(player => player.alias.toLowerCase() === alias.toLowerCase())) // some() = verifie si un joueur a déjà cet alias, equivalent à find()
            return (false);
        return (true);
    }
    // Fonction pour ajouter un joueur
    function addPlayer(alias) {
        // Trim pour enlever les espaces au début et à la fin
        const trimmedAlias = alias.trim();
        if (!isValidAlias(trimmedAlias)) {
            // Affichage d'une alerte en cas d'alias invalide
            alert("Alias invalid or already used !");
            return;
        }
        // Création du nouveau joueur
        const newPlayer = {
            id: nextPlayerId++,
            alias: trimmedAlias,
            timestamp: Date.now()
        };
        // Ajout à la liste des joueurs
        players.push(newPlayer);
        // Mise à jour de l'affichage
        updatePlayersDisplay();
        // Reset du champ input
        aliasInput.value = "";
        // Mise à jour du bouton BEGIN
        updateBeginButton();
        console.log("Added player:", newPlayer);
    }
    // Fonction pour supprimer un joueur
    function removePlayer(playerId) {
        // Filtrage pour enlever le joueur avec cet id
        players = players.filter(player => player.id !== playerId);
        // Mise à jour de l'affichage
        updatePlayersDisplay();
        // Mise à jour du bouton BEGIN
        updateBeginButton();
        console.log("Deleted player, ID:", playerId);
    }
    // Fonction pour mettre à jour l'affichage des joueurs
    function updatePlayersDisplay() {
        // Vider la liste actuelle
        playersList.innerHTML = "";
        if (players.length === 0)
            noPlayersMsg.style.display = "block"; // Afficher le message "aucun joueur"
        else {
            noPlayersMsg.style.display = "none"; // Cacher le message "aucun joueur"
            // Créer un élément pour chaque joueur
            players.forEach((player, index) => {
                const playerElement = document.createElement("div");
                playerElement.className = "flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200";
                playerElement.innerHTML = `
					<div class="flex items-center space-x-4">
						<span class="text-2xl font-bold text-[#218DBE] londrina-solid-regular">
							${index + 1}.
						</span>
						<span class="text-xl font-bold londrina-solid-regular text-gray-800">
							${player.alias}
						</span>
					</div>
					<button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200 font-bold"
						onclick="window.removePlayerHandler(${player.id})">
						✕
					</button>`;
                playersList.appendChild(playerElement);
            });
        }
    }
    // Fonction pour mettre à jour le bouton BEGIN
    function updateBeginButton() {
        if (players.length >= 2) { // Au moins 2 joueurs : activer le bouton
            beginGameBtn.disabled = false;
            beginGameBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
        else { // Moins de 2 joueurs : désactiver le bouton
            beginGameBtn.disabled = true;
            beginGameBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
    }
    // EVENT LISTENERS
    // Clic sur le bouton "Ajouter joueur"
    addAliasBtn.addEventListener("click", () => {
        addPlayer(aliasInput.value);
    });
    // Appui sur Entrée dans le champ input
    aliasInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter")
            addPlayer(aliasInput.value);
    });
    // Clic sur le bouton BEGIN
    beginGameBtn.addEventListener("click", () => {
        if (players.length >= 2) {
            // Stocker les joueurs dans le sessionStorage pour les récupérer dans le jeu
            sessionStorage.setItem("gamePlayers", JSON.stringify(players));
            // Redirection vers la page de jeu
            history.pushState(null, "", "/pong");
            // Appel du router pour charger la nouvelle page
            const routerEvent = new CustomEvent('routeChanged');
            window.dispatchEvent(routerEvent);
            console.log("Lanunching the game with players:", players);
        }
    });
    // Exposer la fonction de suppression au scope global pour les boutons HTML
    window.removePlayerHandler = removePlayer;
    // Initialisation de l'affichage au tout début
    updatePlayersDisplay();
    updateBeginButton();
    // Focus automatique sur le champ input: met automatiquement le curseur dans le champ texte
    aliasInput.focus();
}
// export async function renderPlay() {
// 	const app = document.getElementById('app');
// 	if (!app) return;
// 	const htmlRes = await fetch('/dist/html/play.html');
// 	if (!htmlRes.ok) {
// 		app.innerHTML = "<p>Cannot charge profile page.</p>";
// 		return;
// 	}
// 	const html = await htmlRes.text();
// 	app.innerHTML = html;
// 	//when page is loaded :
// 	document.addEventListener("DOMContentLoaded", () => {
// 		const form = document.getElementById("tournament-form")!;
// 		const playerInputs = document.getElementById("player-inputs")!;
// 		const addButton = document.getElementById("add-player")!;
// 		addButton.addEventListener("click", () => {
// 			const input = document.createElement("input");
// 			input.type = "text";
// 			input.placeholder = "Enter player name";
// 			input.className = "player-input border p-1 rounded w-full";
// 			playerInputs.appendChild(input);
// 		});
// 		form.addEventListener("submit", async (e) => {
// 			e.preventDefault();
// 			const inputs = playerInputs.querySelectorAll<HTMLInputElement>(".player-input");
// 			const names = Array.from(inputs).map(input => input.value.trim()).filter(name => name !== "");
// 			if (names.length < 2) {
// 				alert("Please enter at least two players.");
// 				return;
// 			}
// 			const response = await fetch("/tournaments", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({ players: names })
// 			});
// 			if (response.ok) {
// 				alert("Tournament created!");
// 			} else {
// 				alert("Failed to create tournament");
// 			}
// 		});
// 	});
// }
