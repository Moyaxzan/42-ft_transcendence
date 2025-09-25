import { animateLinesToFinalState } from './navbar.js';
import { setLanguage, getCurrentLang } from '../lang.js';
import '../tournament.js'
import { router } from '../router.js'
import { servicesVersion } from 'typescript';
import { getCurrentUser } from '../auth.js';

/* ---------------------------- INTERFACES ----------------------------------------------------------------------------------------------------- */
interface	GameMode {
	type: '1vs1' | 'tournament';
	minPlayers: number;
	maxPlayers: number;
	subtitle: Record<'en' | 'fr' | 'jp', string>;
}

// Interface pour définir les joueurs
interface	Player {
	id: number;
	alias: string;
}

interface	ConnectedUser {
	name: string;
	wins: number;
	losses: number;
	// ip_address: string;
	// email: string;
	// points: number;
}

// Interface for tournament creation response
interface TournamentResponse {
	success: boolean;
	message: string;
	tournamentId: number;
	players: string[];
}

// Variable globale pour stocker les joueurs
let	players: Player[] = [];
let	nextPlayerId = 1;
let connectedUser: ConnectedUser | null = null;

// Variable pour nettoyer les event listeners
let	currentEventListeners: (() => void)[] = [];

/* ---------------------------- FUNCTIONS ----------------------------------------------------------------------------------------------------- */

export async function	renderPlayers() {
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
	localStorage.setItem("mode", mode);

	const	gameModes: Record<string, GameMode> = {
		'1vs1': {
			type: '1vs1',
			minPlayers: 2,
			maxPlayers: 2,
			subtitle: {
				en: 'Match 1 vs 1',
				fr: 'Match 1 contre 1',
				jp: '1対1の試合'
			}
		},
		'tournament': {
			type: 'tournament',
			minPlayers: 3,
			maxPlayers: 8,
			subtitle: {
				en: 'Tournament',
				fr: 'Tournoi',
				jp: 'トーナメント'
			}
		}
	};

	const	currentMode = gameModes[mode];
	console.log("Mode indicator set to:", currentMode.type);

	// Chargement du HTML de la page players
	const	res = await fetch('/dist/html/players.html');
	console.log("Rendering players.html");
	const	html = await res.text();

	// Injection du HTML dans l'app
	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');
	
	requestAnimationFrame(async () => { //permet l'execution de ces fonctions juste avant d'afficher le contenu de l'écran, on est sur que DOM est pret
		animateLinesToFinalState([
			{ id: "line-top", rotationDeg: -7, translateYvh: -30, height: "50vh" },
			{ id: "line-bottom", rotationDeg: -7, translateYvh: 30, height: "50vh" },
		]);

	const	headLoginButton = document.getElementById('head-login-button');
	const	headLogoutButton = document.getElementById('head-logout-button');
	if (!headLoginButton || !headLogoutButton) {
		console.error("Some DOM elements have not been found");
		return;
	}

	if (await getCurrentUser()) {
		headLoginButton.classList.add('hidden');
		headLogoutButton.classList.remove('hidden');
	} else {
		headLoginButton.classList.remove('hidden');
		headLogoutButton.classList.add('hidden');
	}
		
	// Réinitialiser les joueurs
	// players = [];
	// nextPlayerId = 1;

		// Initialisation de la logique selon le mode de jeu
		const	addPlayerFunction = initialisePlayersLogic(currentMode);

		const	user = await getAuthUser();
		if (user) {
			connectedUser = user;
			if (addPlayerFunction)
				addPlayerFunction.addPlayer(user.name);
			console.log("Connected player automatically added:", user.name);
		} else {
			console.log("No authenticated user found or auth check failed", Error);
		}
	});
}

function	isConnectedUser(obj: any): obj is ConnectedUser {
	return (
		obj &&
		typeof obj.name === 'string' &&
		typeof obj.wins === 'number' &&
		typeof obj.losses === 'number'
		// typeof obj.ip_address === 'string' &&
		// typeof obj.email === 'string' &&
		// typeof obj.points === 'number'
	);
}

async function getAuthUser(): Promise<ConnectedUser | null> {
	try {
		const	res = await fetch('/auth/me', {
			credentials: 'include',
		});
		if (!res.ok)
			return (null);
		const	user: ConnectedUser = await res.json();
		if (isConnectedUser(user))
			return (console.log("Authenticated user found: ", user.name), user);
		else
			return (console.error("Invalid user format received from backend: ", user), null)
	}
	catch (error) {
		console.error("Error fetching authenticated user:", error)
	}
	return (null);
}

function	cleanupEventListeners() {
	currentEventListeners.forEach(cleanup => cleanup());
	currentEventListeners = [];
}

async function createGuestUser(name: string): Promise<number> {
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


async function createTournamentFromPseudonyms(playerNames: string[]): Promise<{ success: boolean, tournamentId?: number, message?: string }> {
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
	} catch (err) {
		console.error("createTournamentFromPseudonyms error:", err);
		return { success: false, message: (err as Error).message };
	}
}

// Function to start tournament
async function startTournament(playerNames: string[]) {

	const lang = getCurrentLang();
	
	try {
		// Show loading state
		const beginButton = document.getElementById("begin-game-btn") as HTMLButtonElement;
		const originalText = beginButton.textContent;
		beginButton.disabled = true;

		// Create tournament via API
		const tournamentData = await createTournamentFromPseudonyms(playerNames);

		if (tournamentData.success && tournamentData.tournamentId) {
			console.log("Tournoi créé avec l'ID :", tournamentData.tournamentId);
			history.pushState(null, "", `/pong#${tournamentData.tournamentId}`);
			router();
		} else {
			throw new Error(tournamentData.message || 'Failed to create tournament');
		}

	} catch (error) {
		console.error('Failed to create tournament:', error);
		alert(`Failed to create tournament.`);
		
		// Reset button state
		const beginButton = document.getElementById("begin-game-btn") as HTMLButtonElement;
		beginButton.textContent = "BEGIN";
		beginButton.disabled = false;
	}
}

function getCurrentPlayerInput(): HTMLInputElement | null {
	const lang = getCurrentLang();
	return (document.getElementById(`player-input-${lang}`) as HTMLInputElement);
}

function	initialisePlayersLogic(gameMode: GameMode) {	
	console.log("Initialising players logic for mode:", gameMode.type);

	// Récupération des éléments DOM nécessaires, lien entre code ts et page html (préparation des elmts à manipuler)
	// const	lang = getCurrentLang();
	const	modeIndicator = document.getElementById('mode-indicator') as HTMLParagraphElement;
	const	playerLimits = document.getElementById('player-limits') as HTMLParagraphElement;
	const	playerCount = document.getElementById('player-count') as HTMLSpanElement;
	// const	playerInput = document.getElementById(`player-input-${lang}`) as HTMLInputElement;
	const	addPlayerBtn = document.getElementById("add-player-btn") as HTMLButtonElement;
	const	playersList = document.getElementById("players-list") as HTMLDivElement;
	const	noPlayersMsg = document.getElementById("no-players") as HTMLDivElement;
	const	beginGameBtn = document.getElementById("begin-game-btn") as HTMLButtonElement;

	// Vérification que tous les éléments existent
	if (!modeIndicator || !playerLimits || !playerCount || !addPlayerBtn || !playersList || !noPlayersMsg || !beginGameBtn) {
		console.error("Some DOM elements have not been found");
		console.log("Missing elements:", {
			modeIndicator: !!modeIndicator,
			playerLimits: !!playerLimits,
			playerCount: !!playerCount,
			// playerInput: !!playerInput,
			addPlayerBtn: !!addPlayerBtn,
			playersList: !!playersList,
			noPlayersMsg: !!noPlayersMsg,
			beginGameBtn: !!beginGameBtn
		});
		return (null);
	}

	// modeIndicator.innerHTML = `	<span lang="en">${gameMode.subtitle.en}</span>
	// 							<span lang="fr">${gameMode.subtitle.fr}</span>
	// 							<span lang="jp">${gameMode.subtitle.jp}</span>
	// `;

	function	updateSubtitle() {
		modeIndicator.textContent = gameMode.subtitle[getCurrentLang()];
	}

	// Définir le sous-titre du mode
	// modeIndicator.textContent = gameMode.subtitle[getCurrentLang()];
	// console.log("Mode indicator set to:", gameMode.subtitle);

	function	updateUI() {
		// Mettre à jour les textes informatifs
		updateSubtitle();
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

		// Mettre à jour le compteur
		playerCount.textContent = `${players.length}/${gameMode.maxPlayers}`;
		['en', 'fr', 'jp'].forEach(lang => {
			const	input = document.getElementById(`player-input-${lang}`) as HTMLInputElement;
			if (input)
				input.disabled = atMaxCapacity;
		})
		addPlayerBtn.disabled = atMaxCapacity;

		addPlayerBtn.innerHTML = atMaxCapacity
			? (gameMode.type === '1vs1'
				? `<span lang="en">Players Complete</span><span lang="fr">Joueurs au complet</span><span lang="jp">プレイヤーが揃いました</span>`
				: `<span lang="en">Tournament Full</span><span lang="fr">Tournoi complet</span><span lang="jp">トーナメントは満員です</span>`)
			: `<span lang="en">Add player</span><span lang="fr">Ajouter un joueur</span><span lang="jp">プレイヤーを追加</span>`;

		setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');
	}

	// Fonction pour valider un alias
	function	isValidAlias(alias: string): boolean {
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
	function	addPlayer(alias: string) {
		// Trim pour enlever les espaces au début et à la fin
		const trimmedAlias = alias.trim();

		const lang = getCurrentLang();

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
		const	newPlayer: Player = {
			id: nextPlayerId++,
			alias: trimmedAlias,
		};
		// Ajout à la liste des joueurs
		players.push(newPlayer);
		// Mise à jour de l'affichage
		updatePlayersDisplay();
		// Reset du champ input actif
		const	activeInput = getCurrentPlayerInput();
		if (activeInput)
			activeInput.value = "";
		// Mise à jour du bouton BEGIN
		updateBeginButton();
		updateUI();
		console.log("Added player:", newPlayer);
	}

	// Fonction pour supprimer un joueur
	function	removePlayer(playerId: number) {
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
	// function	updatePlayersDisplay() {
	// 	// Vider la liste actuelle
	// 	playersList.innerHTML = "";

	// 	if (players.length === 0)
	// 		noPlayersMsg.style.display = "block"; // Afficher le message "aucun joueur"
	// 	else {
	// 		noPlayersMsg.style.display = "none"; // Cacher le message "aucun joueur"

	// 		// Créer un élément pour chaque joueur
	// 		players.forEach((player, index) => {
	// 			const	playerElement = document.createElement("div");
	// 			playerElement.className = "flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200";

	// 			if (connectedUser && player.alias === connectedUser.name) {
	// 				playerElement.innerHTML =	`<div class="flex items-center space-x-2">
	// 												<span class="text-sm font-bold text-[#218DBE]">
	// 													${index + 1}. </span>
	// 												<span class="text-sm font-bold text-gray-800">
	// 													${player.alias} </span>
	// 											</div>`
	// 			} else {
	// 				playerElement.innerHTML =	`<div class="flex items-center space-x-2">
	// 												<span class="text-sm font-bold text-[#218DBE]">
	// 													${index + 1}. </span>
	// 												<span class="text-sm font-bold text-gray-800">
	// 													${player.alias} </span>
	// 											</div>
	// 											<button class="w-6 h-6 flex items-center justify-center bg-red-500 text-white
	// 														   text-xs rounded hover:bg-red-600 transition-colors duration-200 font-bold
	// 														   remove-player-btn" data-player-id="${player.id}">
	// 												✕ 
	// 											</button>`;
	// 				// Ajout de l'event listener pour chaque player
	// 				const	removeBtn = playerElement.querySelector('.remove-player-btn') as HTMLButtonElement;
	// 				if (removeBtn) {
	// 					const	clickHandler = () => removePlayer(player.id);
	// 					removeBtn.addEventListener("click", clickHandler);
	// 					currentEventListeners.push(() => removeBtn.removeEventListener("click", clickHandler));
	// 				}
	// 			}
	// 			playersList.appendChild(playerElement);
	// 		});
	// 	}
	// }

	function updatePlayersDisplay() {
  	// Vider la liste actuelle
		playersList.innerHTML = "";

		if (players.length === 0) {
			noPlayersMsg.style.display = "block"; // Afficher le message "aucun joueur"
		} else {
			noPlayersMsg.style.display = "none"; // Cacher le message "aucun joueur"

			players.forEach((player, index) => {
			const playerElement = document.createElement("div");
			playerElement.className = "flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200";

			// Partie gauche (index + alias)
			const leftDiv = document.createElement("div");
			leftDiv.className = "flex items-center space-x-2";

			const indexSpan = document.createElement("span");
			indexSpan.className = "text-sm font-bold text-[#218DBE]";
			indexSpan.textContent = `${index + 1}. `;

			const aliasSpan = document.createElement("span");
			aliasSpan.className = "text-sm font-bold text-gray-800";
			aliasSpan.textContent = player.alias; 

			leftDiv.appendChild(indexSpan);
			leftDiv.appendChild(aliasSpan);
			playerElement.appendChild(leftDiv);

			// Partie droite (bouton supprimer)
			if (!connectedUser || player.alias !== connectedUser.name) {
				const removeBtn = document.createElement("button");
				removeBtn.className = "w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200 font-bold remove-player-btn";
				removeBtn.textContent = "✕";
				removeBtn.setAttribute("data-player-id", String(player.id));

				const clickHandler = () => removePlayer(player.id);
				removeBtn.addEventListener("click", clickHandler);
				currentEventListeners.push(() => removeBtn.removeEventListener("click", clickHandler));

				playerElement.appendChild(removeBtn);
			}

			playersList.appendChild(playerElement);
			});
		}
	}


	// Fonction pour mettre à jour le bouton BEGIN
	function	updateBeginButton() {
		const	hasMinimumPlayers = players.length >= gameMode.minPlayers;

		if (hasMinimumPlayers) { // activer le bouton
			beginGameBtn.disabled = false;
			beginGameBtn.classList.remove("opacity-50", "cursor-not-allowed");
		} else { // désactiver le bouton
			beginGameBtn.disabled = true;
			beginGameBtn.classList.add("opacity-50", "cursor-not-allowed");
		}
	}

	// EVENT LISTENERS avec nettoyage

	// Changement de la langue
	const	langHandler = () => updateSubtitle();
	window.addEventListener("languageChanged", langHandler);
	currentEventListeners.push(() => window.removeEventListener("languageChanged", langHandler));

	// Clic sur le bouton "Ajouter joueur"
	const	addPlayerHandler = (e: Event) => {
		console.log("Add player button clicked");
		e.preventDefault();
		const	activeInput = getCurrentPlayerInput();
		if (activeInput)
    		addPlayer(activeInput.value);
	}
	addPlayerBtn.addEventListener("click",addPlayerHandler);
	currentEventListeners.push(() => addPlayerBtn.removeEventListener("click", addPlayerHandler));

	// Appui sur Entrée dans le champ input
	['en', 'fr', 'jp'].forEach(lang => {
		const	input = document.getElementById(`player-input-${lang}`) as HTMLInputElement;
		if (input) {
			const	keyPressHandler = (e: KeyboardEvent) => {
				if (e.key === "Enter") {
					console.log("Enter key pressed");
					e.preventDefault();
					addPlayer(input.value);
				}
			};
			input.addEventListener("keypress", keyPressHandler);
			currentEventListeners.push(() => input.removeEventListener("keypress", keyPressHandler));
		}
	});

	// Clic sur le bouton BEGIN
	const	beginGameHandler = async (e: Event) => {
		e.preventDefault();
		if (players.length >= gameMode.minPlayers) {
			// Stocker les joueurs dans le sessionStorage pour les récupérer dans le jeu
			// await startTournament(playerNames);
			// sessionStorage.setItem("gamePlayers", JSON.stringify(players));
			// window.history.pushState({}, '', '/pong');
			const playerNames = players.map(player => player.alias);
			console.log("PlayerNames = ", playerNames);
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
	const	activeInput = getCurrentPlayerInput();
	if (activeInput)
		activeInput.focus();

	console.log("Players logic initialized successfully");
	return {addPlayer};
}

/* DOM = Document Object Model = représentation en mémoire du contenu HTML d'une page web
objet construit à partir du fichier html ; on ne manipule jamais le html directement avec JS mais le DOM
permet de modifier la page sans la recharger*/
