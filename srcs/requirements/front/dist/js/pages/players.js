import { animateLinesToFinalState } from './navbar.js';
import { setLanguage, getCurrentLang } from '../lang.js';
import '../tournament.js';
import { router } from '../router.js';
// Variable globale pour stocker les joueurs
let players = [];
let nextPlayerId = 1;
let connectedUser = null;
// Variable pour nettoyer les event listeners
let currentEventListeners = [];
/* ---------------------------- FUNCTIONS ----------------------------------------------------------------------------------------------------- */
export async function renderPlayers() {
    document.title = "Choose players";
    // NETTOYAGE : Réinitialiser complètement à chaque rendu
    cleanupEventListeners();
    // Réinitialiser les joueurs
    players = [];
    nextPlayerId = 1;
    connectedUser = null;
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
    setLanguage(document.documentElement.lang);
    requestAnimationFrame(async () => {
        animateLinesToFinalState([
            { id: "line-top", rotationDeg: -7, translateYvh: -30, height: "50vh" },
            { id: "line-bottom", rotationDeg: -7, translateYvh: 30, height: "50vh" },
        ]);
        const headLoginButton = document.getElementById('head-login-button');
        if (!headLoginButton) {
            console.error("Some DOM elements have not been found");
            return;
        }
        headLoginButton.classList.remove('hidden');
        // Réinitialiser les joueurs
        players = [];
        nextPlayerId = 1;
        // Initialisation de la logique selon le mode de jeu
        const addPlayerFunction = initialisePlayersLogic(currentMode);
        const user = await getAuthUser();
        if (user) {
            connectedUser = user;
            if (addPlayerFunction)
                addPlayerFunction.addPlayer(user.name);
            console.log("Connected player automatically added:", user.name);
        }
        else {
            console.log("No authenticated user found or auth check failed", Error);
        }
    });
}
function isConnectedUser(obj) {
    return (obj &&
        typeof obj.name === 'string' &&
        typeof obj.ip_address === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.points === 'number');
}
async function getAuthUser() {
    try {
        const res = await fetch('/auth/me', {
            credentials: 'include',
        });
        if (!res.ok)
            return (null);
        const user = await res.json();
        if (isConnectedUser(user))
            return (console.log("Authenticated user found: ", user.name), user);
        else
            return (console.error("Invalid user format received from backend: ", user), null);
    }
    catch (error) {
        console.error("Error fetching authenticated user:", error);
    }
    return (null);
}
function cleanupEventListeners() {
    currentEventListeners.forEach(cleanup => cleanup());
    currentEventListeners = [];
}
async function createGuestUser(name) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, is_guest: true }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create user "${name}"`);
    }
    const data = await response.json();
    return data.userId; // attendu: { userId: 42 }
}
// Function to create tournament via API
async function createTournamentFromPseudonyms(playerNames) {
    try {
        const response = await fetch('/api/tournaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players: playerNames }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, message: data?.error || "Unknown error" };
        }
        return { success: true, tournamentId: data.tournamentId };
    }
    catch (err) {
        console.error("createTournamentFromPseudonyms error:", err);
        return { success: false, message: err.message };
    }
}
// Function to start tournament
async function startTournament(playerNames) {
    const lang = getCurrentLang();
    try {
        // Show loading state
        const beginButton = document.getElementById("begin-game-btn");
        const originalText = beginButton.textContent;
        beginButton.disabled = true;
        // Create tournament via API
        const tournamentData = await createTournamentFromPseudonyms(playerNames);
        if (tournamentData.success && tournamentData.tournamentId) {
            console.log("Tournoi créé avec l'ID :", tournamentData.tournamentId);
            history.pushState(null, "", `/pong#${tournamentData.tournamentId}`);
            router();
        }
        else {
            throw new Error(tournamentData.message || 'Failed to create tournament');
        }
    }
    catch (error) {
        console.error('Failed to create tournament:', error);
        alert(`Failed to create tournament.`);
        // Reset button state
        const beginButton = document.getElementById("begin-game-btn");
        beginButton.textContent = "BEGIN";
        beginButton.disabled = false;
    }
}
function initialisePlayersLogic(gameMode) {
    console.log("Initialising players logic for mode:", gameMode.type);
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
        return (null);
    }
    // Définir le sous-titre du mode
    modeIndicator.textContent = gameMode.subtitle;
    console.log("Mode indicator set to:", gameMode.subtitle);
    function updateUI() {
        // Mettre à jour les textes informatifs
        playerLimits.innerHTML = gameMode.type === '1vs1'
            ? `
			<span lang="en">Exactly 2 players required</span>
			<span lang="fr">Exactement 2 joueurs requis</span>
			<span lang="jp">ちょうど2人のプレイヤーが必要です</span>
			`
            : `
			<span lang="en">${gameMode.minPlayers} to ${gameMode.maxPlayers} players required</span>
			<span lang="fr">${gameMode.minPlayers} à ${gameMode.maxPlayers} joueurs requis</span>
			<span lang="jp">${gameMode.minPlayers} à ${gameMode.maxPlayers} プレイヤーが必要です</span>
			`;
        // État des boutons
        const atMaxCapacity = players.length >= gameMode.maxPlayers;
        // // Mettre à jour le compteur
        playerCount.textContent = `${players.length}/${gameMode.maxPlayers}`;
        playerInput.disabled = atMaxCapacity;
        addPlayerBtn.disabled = atMaxCapacity;
        addPlayerBtn.innerHTML = atMaxCapacity
            ? (gameMode.type === '1vs1'
                ? `<span lang="en">Players Complete</span><span lang="fr">Joueurs au complet</span><span lang="jp">プレイヤーが揃いました</span>`
                : `<span lang="en">Tournament Full</span><span lang="fr">Tournoi complet</span><span lang="jp">トーナメントは満員です</span>`)
            : `<span lang="en">Add player</span><span lang="fr">Ajouter un joueur</span><span lang="jp">プレイヤーを追加</span>`;
        setLanguage(document.documentElement.lang);
    }
    // Fonction pour valider un alias
    function isValidAlias(alias) {
        // Vérifier que l'alias n'est pas vide
        if (alias.length === 0)
            return (false);
        if (alias.toLowerCase() === "admin")
            return (false);
        // Vérifier que l'alias n'existe pas déjà
        if (players.some(player => player.alias.toLowerCase() === alias.toLowerCase())) // some() = verifie si un joueur a déjà cet alias, equivalent à find()
            return (false);
        return (true);
    }
    // Fonction pour ajouter un joueur
    function addPlayer(alias) {
        const lang = getCurrentLang();
        // Trim pour enlever les espaces au début et à la fin
        const trimmedAlias = alias.trim();
        // Affichage d'une alerte en cas d'alias invalide
        if (!isValidAlias(trimmedAlias)) {
            if (lang == "en")
                alert("Alias invalid or already used!");
            else if (lang == "fr")
                alert("Pseudo invalide ou deja utilise !");
            else if (lang == "jp")
                alert("無効なエイリアス、または既に使用されています");
            return;
        }
        // Affichage d'une alerte en cas de joueurs max atteint
        if (players.length >= gameMode.maxPlayers) {
            if (lang == "en")
                alert(`Maximum ${gameMode.maxPlayers} players allowed for ${gameMode.type}`);
            else if (lang == "fr")
                alert(`Un maximum de ${gameMode.maxPlayers} joueurs sont autorises pour un ${gameMode.type}`);
            else if (lang == "jp")
                alert(`${gameMode.maxPlayers} には最大X人のプレイヤーが参加できます ${gameMode.type}`);
            return;
        }
        // Création du nouveau joueur
        const newPlayer = {
            id: nextPlayerId++,
            alias: trimmedAlias,
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
                playerElement.className = "flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200";
                if (connectedUser && player.alias === connectedUser.name) {
                    playerElement.innerHTML = `<div class="flex items-center space-x-2">
													<span class="text-sm font-bold text-[#218DBE]">
														${index + 1}. </span>
													<span class="text-sm font-bold text-gray-800">
														${player.alias} </span>
												</div>`;
                }
                else {
                    playerElement.innerHTML = `<div class="flex items-center space-x-2">
													<span class="text-sm font-bold text-[#218DBE]">
														${index + 1}. </span>
													<span class="text-sm font-bold text-gray-800">
														${player.alias} </span>
												</div>
												<button class="w-6 h-6 flex items-center justify-center bg-red-500 text-white
															   text-xs rounded hover:bg-red-600 transition-colors duration-200 font-bold
															   remove-player-btn" data-player-id="${player.id}">
													✕ 
												</button>`;
                    // Ajout de l'event listener pour chaque player
                    const removeBtn = playerElement.querySelector('.remove-player-btn');
                    if (removeBtn) {
                        const clickHandler = () => removePlayer(player.id);
                        removeBtn.addEventListener("click", clickHandler);
                        currentEventListeners.push(() => removeBtn.removeEventListener("click", clickHandler));
                    }
                }
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
    // EVENT LISTENERS avec nettoyage
    // Clic sur le bouton "Ajouter joueur"
    const addPlayerHandler = (e) => {
        console.log("Add player button clicked");
        e.preventDefault();
        addPlayer(playerInput.value);
    };
    addPlayerBtn.addEventListener("click", addPlayerHandler);
    currentEventListeners.push(() => addPlayerBtn.removeEventListener("click", addPlayerHandler));
    // Appui sur Entrée dans le champ input
    const keyPressHandler = (e) => {
        if (e.key === "Enter") {
            console.log("Enter key pressed");
            e.preventDefault();
            addPlayer(playerInput.value);
        }
    };
    playerInput.addEventListener("keypress", keyPressHandler);
    currentEventListeners.push(() => playerInput.removeEventListener("keypress", keyPressHandler));
    // Clic sur le bouton BEGIN
    const beginGameHandler = async (e) => {
        e.preventDefault();
        if (players.length >= gameMode.minPlayers) {
            // Stocker les joueurs dans le sessionStorage pour les récupérer dans le jeu
            // await startTournament(playerNames);
            // sessionStorage.setItem("gamePlayers", JSON.stringify(players));
            // window.history.pushState({}, '', '/pong');
            const playerNames = players.map(player => player.alias);
            await startTournament(playerNames);
            // Déclencher le routeur pour injecter la page
            // window.dispatchEvent(new CustomEvent('routeChanged'));
            console.log("Launching the game with players:", players);
        }
    };
    beginGameBtn.addEventListener("click", beginGameHandler);
    currentEventListeners.push(() => beginGameBtn.removeEventListener("click", beginGameHandler));
    // Initialisation de l'affichage au tout début
    updateUI();
    updatePlayersDisplay();
    updateBeginButton();
    // Focus automatique sur le champ input: met automatiquement le curseur dans le champ texte
    playerInput.focus();
    console.log("Players logic initialized successfully");
    return { addPlayer };
}
/* DOM = Document Object Model = représentation en mémoire du contenu HTML d'une page web
objet construit à partir du fichier html ; on ne manipule jamais le html directement avec JS mais le DOM
permet de modifier la page sans la recharger*/
