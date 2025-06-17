import { animateLinesToFinalState } from './navbar.js';
// Variable globale pour stocker les joueurs
let players = [];
let nextPlayerId = 1;
export async function renderPlayers() {
    // Récupération de l'élément app principal
    const app = document.getElementById('app');
    if (!app)
        return;
    // Récupérer le mode depuis sessionStorage
    const mode = sessionStorage.getItem('gameMode') || '1vs1';
    const gameModes = {
        '1vs1': {
            type: '1vs1',
            minPlayers: 2,
            maxPlayers: 2,
            subtitle: 'Match 1 vs 1'
        },
        'tournament': {
            type: 'tournament',
            minPlayers: 3,
            maxPlayers: 8,
            subtitle: 'Tournament Mode'
        }
    };
    const currentMode = gameModes[mode];
    // Chargement du HTML de la page players
    const res = await fetch('/dist/html/players.html');
    console.log("Rendering players.html");
    const html = await res.text();
    // Injection du HTML dans l'app
    app.innerHTML = html;
    setTimeout(() => {
        animateLinesToFinalState([
            { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
            { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
        ]);
        // Réinitialiser les joueurs
        players = [];
        nextPlayerId = 1;
        // Initialisation de la logique selon le mode de jeu
        initialisePlayersLogic(currentMode);
    }, 10);
}
function initialisePlayersLogic(gameMode) {
    // Récupération des éléments DOM nécessaires, lien entre code ts et page html (préparation des elmts à manipuler)
    const modeIndicator = document.getElementById('mode-indicator');
    const playerLimits = document.getElementById('player-limits');
    const playerCount = document.getElementById('player-count');
    const playerInput = document.getElementById("player-input");
    const addPlayerBtn = document.getElementById("add-player-btn");
    const playersList = document.getElementById("players-list");
    const noPlayersMsg = document.getElementById("no-players");
    const beginGameBtn = document.getElementById("begin-game-btn");
    // Vérification que tous les éléments existent
    if (!modeIndicator || !playerLimits || !playerCount || !playerInput || !addPlayerBtn || !playersList || !noPlayersMsg || !beginGameBtn) {
        console.error("Some DOM elements have not been found");
        console.log("Missing elements:", {
            modeIndicator: !!modeIndicator,
            playerLimits: !!playerLimits,
            playerCount: !!playerCount,
            playerInput: !!playerInput,
            addPlayerBtn: !!addPlayerBtn,
            playersList: !!playersList,
            noPlayersMsg: !!noPlayersMsg,
            beginGameBtn: !!beginGameBtn
        });
        return;
    }
    // Définir le sous-titre du mode
    modeIndicator.textContent = gameMode.subtitle;
    console.log("Mode indicator set to:", gameMode.subtitle);
    function updateUI() {
        // Mettre à jour les textes informatifs
        playerLimits.textContent = gameMode.type === '1vs1' ? 'Exactly 2 players required'
            : `${gameMode.minPlayers} to ${gameMode.maxPlayers} players required`;
        // Mettre à jour le compteur
        playerCount.textContent = `${players.length}/${gameMode.maxPlayers}`;
        // État des boutons
        const atMaxCapacity = players.length >= gameMode.maxPlayers; // variable booléenne
        playerInput.disabled = atMaxCapacity;
        addPlayerBtn.disabled = atMaxCapacity;
        if (atMaxCapacity) {
            addPlayerBtn.textContent = gameMode.type === '1vs1' ? 'Players Complete' : 'Tournament Full';
        }
        else {
            addPlayerBtn.textContent = 'Add player';
        }
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
        // Affichage d'une alerte en cas d'alias invalide
        if (!isValidAlias(trimmedAlias)) {
            alert("Alias invalid or already used !");
            return;
        }
        // Affichage d'une alerte en cas de joueurs max atteint
        if (players.length >= gameMode.maxPlayers) {
            alert(`Maximum ${gameMode.maxPlayers} players allowed for ${gameMode.type}`);
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
        playerInput.value = "";
        // Mise à jour du bouton BEGIN
        updateBeginButton();
        updateUI();
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
        updateUI();
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
        const hasMinimumPlayers = players.length >= gameMode.minPlayers;
        if (hasMinimumPlayers) { // activer le bouton
            beginGameBtn.disabled = false;
            beginGameBtn.classList.remove("opacity-50", "cursor-not-allowed");
        }
        else { // désactiver le bouton
            beginGameBtn.disabled = true;
            beginGameBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
    }
    // EVENT LISTENERS
    // Clic sur le bouton "Ajouter joueur"
    addPlayerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Add player button clicked");
        addPlayer(playerInput.value);
    });
    // Appui sur Entrée dans le champ input
    playerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter")
            e.preventDefault();
        console.log("Enter key pressed");
        addPlayer(playerInput.value);
    });
    // Clic sur le bouton BEGIN
    beginGameBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (players.length >= gameMode.minPlayers) {
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
    updateUI();
    updatePlayersDisplay();
    updateBeginButton();
    // Focus automatique sur le champ input: met automatiquement le curseur dans le champ texte
    playerInput.focus();
    console.log("Players logic initialized successfully");
}
