import { animateLinesToFinalState } from './navbar.js';
let animationId = 0;
async function sendMatchResult(userId, score, opponentScore, opponentId, tournamentId, matchRound, matchIndex) {
    // // 1. store result inside user stats
    // try {
    // 	const response = await fetch(`/api/users/history/${userId}`, {
    // 		method: 'POST',
    // 		headers: {
    // 			'Content-Type': 'application/json',
    // 		},
    // 		body: JSON.stringify({
    // 			score,
    // 			opponent_score: opponentScore,
    // 			opponent_id: opponentId
    // 		})
    // 	});
    // 	if (!response.ok) {
    // 		const errorText = await response.text();
    // 		console.error('Erreur lors de l’envoi du score :', errorText);
    // 		return;
    // 	}
    // 	const result = await response.json();
    // 	console.log('Score enregistré avec succès :', result);
    // } catch (err) {
    // 	console.error('Erreur réseau ou serveur :', err);
    // }
    //2. get winner_id
    let winnerId = -1;
    if (score > opponentScore) {
        winnerId = userId;
    }
    else {
        winnerId = opponentId;
    }
    //3. advance winner inside bracket
    try {
        const response = await fetch(`/api/play/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tournament_id: tournamentId,
                match_round: matchRound,
                match_index: matchIndex,
                winner_id: winnerId
            })
        });
        // if (!response.ok) {
        // 	const errorText = await response.text();
        // 	console.error('Erreur lors de l’avancement du winner :', errorText);
        // 	return;
        // }
        // const result = await response.json();
        // console.log('Score enregistré avec succès :', result);
    }
    catch (err) {
        console.error('Erreur réseau ou serveur :', err);
    }
}
export function stopGame() {
    cancelAnimationFrame(animationId);
    animationId = 0;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    const leftPaddle = document.getElementById("left-paddle");
    const rightPaddle = document.getElementById("right-paddle");
    const ball = document.getElementById("ball");
    const scoreDiv = document.getElementById("score");
    const player1Div = document.getElementById("player1-name");
    const player2Div = document.getElementById("player2-name");
    const countdownDiv = document.getElementById("countdown");
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
    if (!countdownDiv) {
        console.log("error with countdown div");
        return;
    }
    const trailBalls = [];
    for (let i = 1; i < 10; i++) {
        let trail = document.getElementById(`trail${i}`);
        if (!trail) {
            return;
        }
        trailBalls.push(trail);
    }
    // keys handling
    let launchRound = false;
    let keysPressed = {};
    document.addEventListener("keydown", (e) => {
        keysPressed[e.key] = true;
        if (!launchRound && e.key === " ") {
            launchRound = true;
        }
    });
    document.addEventListener("keyup", (e) => {
        keysPressed[e.key] = false;
    });
    //utils
    function getRandomBound(min, max) {
        return Math.random() * (max - min + 1) + min;
    }
    function reflectAngle(ballVectx, ballVecty) {
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
            return (Math.atan2(ballVecty, -ballVectx));
        }
        return newAngle;
    }
    let startRound = Date.now();
    let player1Score = 0;
    let player2Score = 0;
    scoreDiv.innerText = `${player1Score} - ${player2Score}`;
    //initializations
    let leftPaddlePos = 41; // as %
    let rightPaddlePos = 41; // as %
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
    function getInitialAngle() {
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
        }
        else if (ballPosx[0] <= 0 && ballPosx[0] > -2 && (ballPosy[0] >= leftPaddlePos && ballPosy[0] <= leftPaddlePos + 18)) {
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
    function startCountdown(afterCountdown, duration = 3) {
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
                }
                else {
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
                    return;
                }
            }, 1000);
        });
    }
    function waitForSpacePress() {
        return new Promise(resolve => {
            function onKeyDown(e) {
                if (e.code === "Space") {
                    document.removeEventListener("keydown", onKeyDown);
                    countdownDiv.innerText = "";
                    resolve();
                }
            }
            countdownDiv.innerText = "Press space to start!";
            countdownDiv.style.display = 'block';
            document.addEventListener("keydown", onKeyDown);
        });
    }
    async function playMatch(player1, player2, tournamentId, matchRound, matchIndex) {
        player1Score = 0;
        player2Score = 0;
        scoreDiv.innerText = "0 - 0";
        resetBall();
        resetPaddles();
        player1Div.innerText = player1.name;
        player2Div.innerText = player2.name;
        console.log(player1.name);
        console.log(" vs ");
        console.log(player2.name);
        return new Promise(async (resolve) => {
            countdownDiv.style.display = 'block';
            countdownDiv.innerText = "Press space to start !";
            ball.style.top = `50%`;
            ball.style.left = `50%`;
            await waitForSpacePress();
            await startCountdown(() => requestAnimationFrame(frame), 3);
            console.log("start countdown function called");
            function frame() {
                movePaddles();
                if (ballPosx[0] > 130) {
                    player1Score++;
                    resetBall();
                    scoreDiv.innerText = `${player1Score} - ${player2Score}`;
                    resetPaddles();
                    if (player1Score != 3) {
                        startCountdown(() => requestAnimationFrame(frame), 3);
                        return;
                    }
                }
                else if (ballPosx[0] < -30) {
                    player2Score++;
                    resetBall();
                    scoreDiv.innerText = `${player1Score} - ${player2Score}`;
                    resetPaddles();
                    if (player2Score != 3) {
                        startCountdown(() => requestAnimationFrame(frame), 3);
                        return;
                    }
                }
                if (player1Score === 3 || player2Score === 3) {
                    stopGame();
                    launchRound = false;
                    sendMatchResult(player1.id, player1Score, player2Score, player2.id, tournamentId, matchRound, matchIndex);
                    let winnerId;
                    let winnerName;
                    if (player2Score < player1Score) {
                        winnerId = player1.id;
                        winnerName = player1.name;
                    }
                    else {
                        winnerId = player2.id;
                        winnerName = player2.name;
                    }
                    resolve({ winnerId, winnerName });
                    return (winnerId);
                }
                else {
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
        // const { matches }: { matches: Match[] } = await matchesRes.json();
        const data = await matchesRes.json();
        // console.log("matches json:", data);
        const matches = Array.isArray(data) ? data : data.matches;
        if (!Array.isArray(matches)) {
            console.error("'matches' n'est pas un tableau.");
            return;
        }
        let lastWinner = "None";
        // trie les matchs dans l'ordre round puis index
        matches.sort((a, b) => a.match_round - b.match_round || a.match_index - b.match_index);
        console.log(matches);
        for (const match of matches) {
            resetPaddles();
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
            const [player1, player2] = players;
            console.log(`🎮 Match ${match_round}-${match_index} entre ${player1.name} et ${player2.name}`);
            const matchRes = await playMatch(player1, player2, Number(tournamentId), match_round, match_index);
            lastWinner = matchRes.winnerName;
            // change this
            await new Promise((r) => setTimeout(r, 5000)); // Pause entre matchs
        }
        // not working as i would like
        if (lastWinner != "None") {
            alert(`🏆 Le gagnant du tournoi est : ${lastWinner} !`);
        }
        else {
            alert("Pas de gagnant trouvé");
        }
    }
}
