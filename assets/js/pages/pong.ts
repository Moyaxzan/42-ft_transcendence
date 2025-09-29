import { animateLinesToFinalState } from './navbar.js';
import { setLanguage, getCurrentLang } from '../lang.js';
import { showWinnerModal, hideWinnerModal, showHelpModal, hideHelpModal } from './modals.js';
import { sendMatchResult, advanceWinner } from '../tournament.js';
import { router } from '../router.js'
import { getCurrentUser } from '../auth.js';

declare const confetti: any; 

let animationId: number = 0;

const pressTranslation: Record<string, string> = {
	en: "Press space to start",
	fr: "Appuyez sur espace",
	jp: "スタートでプレイ"
};

type Match = {
  id: number;
  user_id: number;
  opponent_id: number;
  match_round: number;
  match_index: number;
  winner_id: number | null;
  score: number;
  opponent_score: number;
  tournament_id: number;
};


let gameStopped = false;

export function stopGame() {
	cancelAnimationFrame(animationId);
	animationId = 0;
	gameStopped = true;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export async function renderPong() {
	document.title = "Pong";
	stopGame();
	console.log("🏓 renderPong()");
	const app = document.getElementById('app');
	if (!app)
		return;
	const res = await fetch(`/dist/html/pong.html`);
	console.log(res);
	const html = await res.text();
	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');

	await new Promise((resolve) => requestAnimationFrame(resolve));


	// Animate the lines
	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: 0, translateYvh: 0, height: "7%" },
		{ id: "line-bottom", rotationDeg: 0, translateYvh: 0, height: "23%" },
	]);

	// Fade in the "Home" link
	const home_link = document.getElementById("home-link-pong");
	if (home_link) {
		home_link.classList.remove("opacity-0", "translate-y-2");
		home_link.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-700", "ease-in-out");
	}

	//get elements of html
	const leftPaddle = document.getElementById("left-paddle") as HTMLDivElement;
	const rightPaddle = document.getElementById("right-paddle") as HTMLDivElement;
	const ball = document.getElementById("ball") as HTMLDivElement;
	const scorePlayer1Div = document.getElementById("score-player1") as HTMLDivElement;
	const scorePlayer2Div = document.getElementById("score-player2") as HTMLDivElement;
	const player1Div = document.getElementById("player1-name") as HTMLDivElement;
	const player2Div = document.getElementById("player2-name") as HTMLDivElement;
	const countdownDiv = document.getElementById("countdown") as HTMLDivElement;
	const helpModal = document.getElementById("help-modal") as HTMLDivElement;

	if (!leftPaddle) {
		console.log("error with left paddle");
		return;
	}
	if (!rightPaddle) {
		console.log("error with right paddle");
		return;
	}
	if (!ball) {
		console.log("error with ball");
		return;
	}
	if (!scorePlayer1Div) {
		console.log("error with scoreDiv1");
		return;
	}
	if (!scorePlayer2Div) {
		console.log("error with scoreDiv2");
		return;
	}
	if (!player1Div) {
		console.log("error with player1div");
		return;
	}
	if (!player2Div) {
		console.log("error with player2div");
		return;
	}

	if (!countdownDiv) {
		console.log("error with countdown div");
		return;
	}
	if (!helpModal) {
		console.log("error with help modal");
		return;
	}
	const trailBalls: HTMLDivElement[] = [];
	for (let i = 1; i < 10; i++) {
		let trail = document.getElementById(`trail${i}`) as HTMLDivElement | null;
		if (!trail) {
			return;
		}
		trailBalls.push(trail);
	}

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

	window.addEventListener("languageChanged", (e: Event) => {
	const lang = (e as CustomEvent<string>).detail;

		if (countdownDiv && countdownDiv.style.display === "block") {
			countdownDiv.innerText = pressTranslation[getCurrentLang()];
		}
	});

	// keys handling
	let launchRound = false;
	let keysPressed: {[key: string] : boolean} = {};
	const controller = new AbortController();
	document.addEventListener("keydown", (e) => {
		keysPressed[e.key] = true;
		if (e.key === " " && !launchRound) {
			launchRound = true;
		}
		if (e.key === "Escape") {
			if (helpModal.classList.contains("hidden")) {
				showHelpModal();
			} else {
				hideHelpModal();
			}
		}
	}, {signal: controller.signal});
	document.addEventListener("keyup", (e) => {
		keysPressed[e.key] = false;
	}, {signal: controller.signal});
	
	//utils
	function getRandomBound(min: number, max: number): number {
	  return Math.random() * (max - min + 1) + min;
	}

	function reflectAngle(ballVectx: number, ballVecty: number): number {
		let angle = Math.atan2(ballVecty, ballVectx);
		let newAngle;
		let tries = 0;
		do {
			const offset = (Math.random() - 0.5) * (Math.PI / 6); // ±π/12
			newAngle = Math.PI - angle + offset;
			const a = Math.abs(Math.atan2(Math.sin(newAngle), Math.cos(newAngle))); // normalize
			if (a < Math.PI / 3 || a > 2 * Math.PI / 3)
				break;
		} while (++tries < 10);
		if (tries == 10) {
			return (Math.atan2(ballVecty, -ballVectx))
		}
		return newAngle;
	}

	let startRound = Date.now();
	let player1Score = 0;
	let player2Score = 0;
	scorePlayer1Div.innerText = `${player1Score}`;
	scorePlayer2Div.innerText = `${player2Score}`;

	//initializations
	let leftPaddlePos = 41;   // as %
	let rightPaddlePos = 41;  // as %

	// ballPosx[0] is the actual pos of the ball. The others are the trail.
	let ballPosx = Array(10).fill(50);
	let ballPosy = Array(10).fill(50); 
	let ballVectx = 0;
	let ballVecty = 0;
	let lastbounce = startRound;
	let lastWallTouch = startRound;
	let ballSpeed = 0.666;

	function resetBall() {
		ballPosx = Array(10).fill(50);
		ballPosy = Array(10).fill(50);
		ballSpeed = 0.666;

		ballVectx = 0;
		ballVecty = 0;
		const angle = getInitialAngle();
		ballVectx = Math.cos(angle);
		ballVecty = Math.sin(angle);
		lastbounce = Date.now();
		startRound = lastbounce;
		gameStarted = true;
	}

	function getInitialAngle(): number {
		let angle;
		let x, y;
		do {
			angle = Math.random() * 2 * Math.PI;
			x = Math.cos(angle);
			y = Math.sin(angle);
		} while (Math.abs(x) < 0.3 || Math.abs(y) < 0.3);
		return angle;

	}

	let angle = getInitialAngle();
	ballVectx = Math.cos(angle);
	ballVecty = Math.sin(angle);

	function moveBall() {
		for (let index = 9; index > 0; index--) {
			ballPosy[index] = ballPosy[index - 1];
			ballPosx[index] = ballPosx[index - 1];
		}
		ballPosy[0] = ballPosy[0] + ballSpeed * (ballVecty);
		ballPosx[0] = ballPosx[0] + ballSpeed * (ballVectx);
		ball.style.top = `${ballPosy[0]}%`;
		ball.style.left = `${ballPosx[0]}%`;

		//render tail balls
		for (let index = 0; index < trailBalls.length; index++) {
			trailBalls[index].style.top = `${ballPosy[index + 1]}%`;
			trailBalls[index].style.left = `${ballPosx[index + 1]}%`;
		}

		//wall collisions
		if ((ballPosy[0] <= 2 || ballPosy[0] >= 98) && Date.now() - lastWallTouch > 100) {
			ballVecty = -ballVecty;
		}

		//paddle collisions
		if (ballPosx[0] >= 100 && ballPosx[0] < 102 && ballPosy[0] >= rightPaddlePos && ballPosy[0] <= rightPaddlePos + 18) {
			if (Date.now() - lastbounce > 100) {
				const newAngle = reflectAngle(ballVectx, ballVecty);
				ballVectx = Math.cos(newAngle);
				ballVecty = Math.sin(newAngle);
				lastbounce = Date.now();
				ballSpeed = ballSpeed + 0.03;
				console.log("ball speed: ", ballSpeed);
			}
		} else if (ballPosx[0] <= 0 && ballPosx[0] > -2 && (ballPosy[0] >= leftPaddlePos && ballPosy[0] <= leftPaddlePos + 18)) {
			if (Date.now() - lastbounce > 100) {
				const newAngle = reflectAngle(ballVectx, ballVecty);
				ballVectx = Math.cos(newAngle);
				ballVecty = Math.sin(newAngle);
				lastbounce = Date.now();
				ballSpeed = ballSpeed + 0.03;
				console.log("ball speed: ", ballSpeed);
			}
		}

	}

	function resetPaddles() {
		leftPaddlePos = 41;
		rightPaddlePos = 41;
		leftPaddle.style.top = `41%`;
		rightPaddle.style.top = `41%`;
	}

	function movePaddles() {
		const paddleSpeed = 0.65;

		if ((keysPressed["s"] || keysPressed["S"]) && !(keysPressed["w"] || keysPressed["W"])) {
			leftPaddlePos += paddleSpeed;
		}
		else if (keysPressed["w"] || keysPressed["W"] && !(keysPressed["s"] || keysPressed["S"])) {
			leftPaddlePos -= paddleSpeed;
		}
		if (keysPressed["ArrowUp"] && !keysPressed["ArrowDown"]) {
			rightPaddlePos -= paddleSpeed;
		}
		else if (keysPressed["ArrowDown"] && !keysPressed["ArrowUp"]) {
			rightPaddlePos += paddleSpeed;
		}
		leftPaddlePos = Math.max(0, Math.min(82, leftPaddlePos));
		rightPaddlePos = Math.max(0, Math.min(82, rightPaddlePos));

		leftPaddle.style.top = `${leftPaddlePos}%`;
		rightPaddle.style.top = `${rightPaddlePos}%`;
	}
	
	let gameStarted = false;

	function startCountdown(afterCountdown?: () => void, duration = 3): Promise<void> {
		return new Promise(resolve => {
			countdownDiv.style.display = 'block';
			let count = duration;
			countdownDiv.innerText = count.toString();
			ball.style.top = `50%`;
			ball.style.left = `50%`;

			const interval = setInterval(() => {
				count--;
				if (count > 0) {
					countdownDiv.innerText = count.toString();
				} else {
					countdownDiv.innerText = 'GO!';
				}

				if (count < 0) {
					clearInterval(interval);
					countdownDiv.style.display = 'none';
					if (afterCountdown) {
						resetBall();
						console.log("afterCountdown");
						afterCountdown();
					}
					return ;
				}
			}, 1000);
		});
	}

	function waitForSpacePress(): Promise<void> {
		return new Promise(resolve => {
			function onKeyDown(e: KeyboardEvent) {
				if (e.code === "Space") {
					document.removeEventListener("keydown", onKeyDown);
					countdownDiv.innerText = "";
					resolve();
				}
			}
			countdownDiv.innerText = pressTranslation[getCurrentLang()];
			countdownDiv.style.display = 'block';
			document.addEventListener("keydown", onKeyDown, {signal: controller.signal});
		});
	}

	async function playMatch(
		player1: { id: number, name: string },
		player2: { id: number, name: string },
		tournamentId: number,
		matchRound: number,
		matchIndex: number
	):
	Promise<{ winnerId: number, winnerName: string }> {
		let path = window.location.pathname;
		if (path == "/pong/" || path == "/pong")
			gameStopped = false;
		player1Score = 0;
		player2Score = 0;
		scorePlayer1Div.innerText = "0";
		scorePlayer2Div.innerText = "0";
		resetBall();
		resetPaddles();
		player1Div.innerText = player1.name;
		player2Div.innerText = player2.name;
		console.log(player1.name);
		console.log(" vs ");
		console.log(player2.name);


		return new Promise(async resolve => {
			countdownDiv.style.display = 'block';
			countdownDiv.innerText = pressTranslation[getCurrentLang()];
			ball.style.top = `50%`;
			ball.style.left = `50%`;
			await waitForSpacePress();
			await startCountdown(() => requestAnimationFrame(frame), 3);
			async function frame() {
				if (gameStopped)
					return;
				while (!helpModal.classList.contains("hidden")) {
					await delay(500);
				}
				movePaddles();
				if (ballPosx[0] > 130) {
					player1Score++;
					resetBall();
					scorePlayer1Div.innerText = `${player1Score}`;
					resetPaddles();
					if (player1Score != 3) {
			 			startCountdown(() => requestAnimationFrame(frame), 3);
						return ;
					}
				} else if (ballPosx[0] < -30) {
					player2Score++;
					resetBall();
					scorePlayer2Div.innerText = `${player2Score}`;
					resetPaddles();
					if (player2Score != 3) {
						startCountdown(() => requestAnimationFrame(frame), 3);
						return ;
					}
				}
				if (player1Score === 3 || player2Score === 3) {
					launchRound = false;
					// console.log("Player1Name = ", player1.name);
					// console.log("Player1ID = ", player1.id);
					// console.log("Player2Name = ", player2.name);
					// console.log("Player2ID = ", player2.id);
					sendMatchResult(player1.id, player1Score, player2Score, player2.id, tournamentId, matchRound, matchIndex);
					stopGame();
					let winnerId: number;
					let winnerName: string;
					if (player2Score < player1Score) {
						winnerId = player1.id;
						winnerName = player1.name;
					} else {
						winnerId = player2.id;
						winnerName = player2.name;
					}
					resolve({ winnerId, winnerName});
					// const result = await Response.json();
					// console.log("Update response:", result);
					return (winnerId);
				} else {
					moveBall();
				}
				animationId = requestAnimationFrame(frame);
			}
			animationId = requestAnimationFrame(frame);
		});
	}


	const tournamentId = window.location.hash.slice(1);
	if (!tournamentId) {
		console.error("No tournament ID provided in URL");
		return;
	}

	if (tournamentId) {
		const matchesRes = await fetch(`/api/tournaments/${tournamentId}`);
		if (!matchesRes.ok) {
			console.error("Failed to load tournament matches");
			return;
		}

		const data = await matchesRes.json();
		const matches = Array.isArray(data) ? data : data.matches;
		if (!Array.isArray(matches)) {
			console.error("'matches' n'est pas un tableau.");
			return;
		}
		let lastWinner = "None" ;

		// trie les matchs dans l'ordre round puis index
		matches.sort((a, b) => a.match_round - b.match_round || a.match_index - b.match_index);
		// console.log(matches);

		for (const match of matches) {

			//DEBUG
			const result = await fetch(`/api/tournaments/${tournamentId}/matches`);
			const { matches } = await result.json();
			console.table(matches);

			if (window.location.pathname != "/pong")
				return;
			gameStopped = false;
			resetPaddles();
			const { match_round, match_index } = match;

			// Récupère les deux joueurs de ce match
			const res = await fetch(`/api/play/${tournamentId}/${match_round}/${match_index}`);
			if (!res.ok) {
				console.warn(`Pas de match trouvé pour round ${match_round}, index ${match_index}`);
				continue;
			}
			const resMatch = await res.json();
			console.log("resMatch:");
			console.log(resMatch);
			if (resMatch.match.winner_id !==  null && resMatch.match.winner_id !== -1) {
				continue;
			}
			if (resMatch.players.length < 1) {
				console.warn("Pas assez de joueurs pour ce match", match);
				continue;
			}
			const [player1, player2] = resMatch.players;
			if (!player1) {
				await advanceWinner(Number(tournamentId), match_round, match_index, player2.id)
			} else if (!player2) {
				await advanceWinner(Number(tournamentId), match_round, match_index, player1.id)
			} else {
				console.log(`🎮 Match ${match_round}-${match_index} entre ${player1.name} et ${player2.name}`);
				const matchRes = await playMatch(player1, player2, Number(tournamentId), match_round, match_index);
				lastWinner = matchRes.winnerName;
			}
			await new Promise(resolve => setTimeout(resolve, 1000));

		}
		
		//clears all event listeners
		// controller.abort();
		if (window.location.pathname != "/pong/" && window.location.pathname != "/pong")
			return;

		const lang = getCurrentLang();

		if (lastWinner != "None") {
			//winner pop up
			showWinnerModal(lastWinner);
			//confettis
			FireCannon();

			const winnerModal = document.getElementById("winner-modal") as HTMLDivElement;
			if (!winnerModal) {
				window.history.pushState({}, "", "/game-mode");
				router();
				return;
			}
			// Closes modal when clicking outside the content
			winnerModal.addEventListener('click', (e) => {
				const content = document.getElementById('modal-content')!;
				if (!content.contains(e.target as Node)) {
					hideWinnerModal();
					// window.location.href = "/game-mode";
					window.history.pushState({}, "", "/game-mode");
					router();
				}
			});
		} else {
			if (lang == "en")
				alert("No winner found");
			else if (lang == "fr")
				alert("Pas de gagnant trouvé");
			if (lang == "jp")
				alert("勝者が見つかりませんでした");
			console.log("Tournament finished");
			// window.location.href = "/game-mode";
			window.history.pushState({}, "", "/game-mode");
			router();
		}
	}
}

const count = 200;
const defaults: confetti.Options = {
  origin: { y: 0.7 }
};

function Fire(particleRatio: number, opts: confetti.Options) {
  confetti(Object.assign({}, defaults, opts, {
    particleCount: Math.floor(count * particleRatio)
  }));
}

export function FireCannon() {
  Fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  Fire(0.2, {
    spread: 60,
  });

  Fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.4,
  });

  Fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  Fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });

  Fire(0.3, {
    spread: 200,
    startVelocity: 40,
  });
}

