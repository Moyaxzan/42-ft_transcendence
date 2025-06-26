import { animateLinesToFinalState } from './navbar.js';

let animationId: number = 0;

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

async function sendMatchResult(userId: number, score: number, opponentScore: number, opponentId: number) {
	try {

		const response = await fetch(`/api/users/history/${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				score,
				opponent_score: opponentScore,
				opponent_id: opponentId
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Erreur lors de l’envoi du score :', errorText);
			return;
		}

		const result = await response.json();
		console.log('Score enregistré avec succès :', result);
	} catch (err) {
		console.error('Erreur réseau ou serveur :', err);
	}
}

export function stopGame() {
	cancelAnimationFrame(animationId);
	animationId = 0;
}

export async function renderPong() {
	stopGame();
	console.log("🏓 renderPong()");
	const app = document.getElementById('app');
	if (!app)
		return;
	const res = await fetch(`/dist/html/pong.html`);
	console.log(res);
	const html = await res.text();
	app.innerHTML = html;

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
	const scoreDiv = document.getElementById("score") as HTMLDivElement;
	const player1Div = document.getElementById("player1-name") as HTMLDivElement;
	const player2Div = document.getElementById("player2-name") as HTMLDivElement;
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
	if (!scoreDiv) {
		console.log("error with scoreDiv");
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

	const trailBalls: HTMLDivElement[] = [];
	for (let i = 1; i < 10; i++) {
		let trail = document.getElementById(`trail${i}`) as HTMLDivElement | null;
		if (!trail) {
			return;
		}
		trailBalls.push(trail);
	}

	// keys handling
	let keysPressed: {[key: string] : boolean} = {};
	document.addEventListener("keydown", (e) => {
		keysPressed[e.key] = true;
	});
	document.addEventListener("keyup", (e) => {
		keysPressed[e.key] = false;
	});
	
	//utils
	function getRandomBound(min: number, max: number): number {
	  return Math.random() * (max - min + 1) + min;
	}

	function reflectAngle(ballVectx: number, ballVecty: number): number {
		let angle = Math.atan2(ballVecty, ballVectx);
		console.log("angle before :", angle * 180 / Math.PI);
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
			console.log("bounce tries > 10");
			return (Math.atan2(ballVecty, -ballVectx))
		}
		console.log("angle after :", newAngle * 180 / Math.PI);
		return newAngle;
	}

	let startRound = Date.now();
	let player1Score = 0;
	let player2Score = 0;
	scoreDiv.innerText = `${player1Score} - ${player2Score}`;

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

	  // After a short delay, relaunch the ball at a new random angle
		setTimeout(() => {
			const angle = getInitialAngle();
			ballVectx = Math.cos(angle);
			ballVecty = Math.sin(angle);
			lastbounce = Date.now();
			startRound = lastbounce;
			gameStarted = true;
			console.log("New serve angle:", angle);
		}, 1000); // 1 second pause before serve
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
	console.log("launch angle:", angle);

	function moveBall() {
		console.log("ball pos:", ballPosx[0], ", ", ballPosy[0]);
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

	async function playMatch(
		player1: { id: number, name: string },
		player2: { id: number, name: string }
	):
	Promise<{ winnerId: number, loserId: number, score: [number, number] }> {
		player1Score = 0;
		player2Score = 0;
		scoreDiv.innerText = "0 - 0";
		resetBall();
		player1Div.innerText = player1.name;
		player2Div.innerText = player2.name;
		console.log(player1.name);
		console.log(" vs ");
		console.log(player2.name);

		return new Promise(resolve => {
			function frame() {
				movePaddles();
				if (ballPosx[0] > 130) {
					player1Score++;
					resetBall();
				} else if (ballPosx[0] < -30) {
					player2Score++;
					resetBall();
				} else if (player1Score === 3 || player2Score === 3) {
					stopGame();
					const winnerId = player1Score > player2Score ? player1.id : player2.id;
					const loserId = player1Score > player2Score ? player2.id : player1.id;
					sendMatchResult(winnerId, Math.max(player1Score, player2Score), Math.min(player1Score, player2Score), loserId);
					resolve({ winnerId, loserId, score: [player1Score, player2Score] });
					return;
				} else if (gameStarted || keysPressed[" "] || Date.now() - startRound > 3000) {
					gameStarted = true;
					moveBall();
				}
				animationId = requestAnimationFrame(frame);
			}
			animationId = requestAnimationFrame(frame);
		});
	}



	const tournamentId = window.location.hash.slice(1);
	console.log("bonjour je suis dans renderPong");
	if (!tournamentId) {
		console.error("No tournament ID provided in URL");
		return;
	}

	console.log("after tournament");
	if (tournamentId) {
		console.log("inside tournament");
		const matchesRes = await fetch(`/api/tournaments/${tournamentId}`);
		if (!matchesRes.ok) {
			console.error("Failed to load tournament matches");
			return;
		}
		// const { matches }: { matches: Match[] } = await matchesRes.json();

		const data = await matchesRes.json();
		// console.log("matches json:", data);
		const matches = Array.isArray(data) ? data : data.matches;
		if (!Array.isArray(matches)) {
			console.error("'matches' n'est pas un tableau.");
			return;
		}
		const winners = new Map<number, boolean>();

		// Trie les matchs dans l'ordre round puis index
		matches.sort((a, b) => a.match_round - b.match_round || a.match_index - b.match_index);
		console.log(matches);

		for (const match of matches) {
			const { match_round, match_index } = match;

			// Récupère les deux joueurs de ce match
			const res = await fetch(`/api/play/${tournamentId}/${match_round}/${match_index}`);
			if (!res.ok) {
				console.warn(`Pas de match trouvé pour round ${match_round}, index ${match_index}`);
				continue;
			}
			const players = await res.json();
			if (players.length < 2) {
				console.warn("Pas assez de joueurs pour ce match", match);
				continue;
			}
			console.log("players: ", players);
			const [player1, player2] = players;

			// Ne joue le match que si les joueurs sont encore en course (round > 1)
			if (
				match_round > 1 &&
				(winners.get(player1.id) === false || winners.get(player2.id) === false)
			) {
				console.log(`Match ${match_round}-${match_index} ignoré car un joueur est éliminé.`);
				continue;
			}

			console.log(`🎮 Match ${match_round}-${match_index} entre ${player1.name} et ${player2.name}`);
			const result = await playMatch(player1, player2); // => { winnerId, loserId }

			winners.set(result.winnerId, true);
			winners.set(result.loserId, false);

			await new Promise((r) => setTimeout(r, 5000)); // Pause entre matchs
		}

		// Trouver le gagnant final
		const finalWinnerId = [...winners.entries()].find(([_, win]) => win)?.[0];
		if (finalWinnerId) {
			const allPlayers = matches.flatMap((m) => [m.user_id, m.opponent_id]);
			const res = await fetch(`/api/users/${finalWinnerId}`);
			const finalWinner = await res.json();
			alert(`🏆 Le gagnant du tournoi est : ${finalWinner.name} !`);
		} else {
			alert("Pas de gagnant trouvé");
		}
	}
}
