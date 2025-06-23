import { animateLinesToFinalState } from './navbar.js';
let animationId = 0;
async function sendMatchResult(userId, score, opponentScore, opponentId) {
    try {
        const response = await fetch(`/api/users/history/${encodeURIComponent(userId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
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
    }
    catch (err) {
        console.error('Erreur réseau ou serveur :', err);
    }
}
export async function renderPong() {
    stopGame();
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch(`/dist/html/pong.html`);
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
    if (!leftPaddle || !rightPaddle || !ball || !scoreDiv)
        return;
    const trailBalls = [];
    for (let i = 1; i < 10; i++) {
        let trail = document.getElementById(`trail${i}`);
        if (!trail) {
            return;
        }
        trailBalls.push(trail);
    }
    // keys handling
    let keysPressed = {};
    document.addEventListener("keydown", (e) => {
        keysPressed[e.key] = true;
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
            return (Math.atan2(ballVecty, -ballVectx));
        }
        console.log("angle after :", newAngle * 180 / Math.PI);
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
    function framePong() {
        movePaddles();
        if (ballPosx[0] > 130) {
            gameStarted = false;
            player1Score++;
            console.log("player 1 scored !");
            scoreDiv.innerText = `${player1Score} - ${player2Score}`;
            resetBall();
        }
        else if (ballPosx[0] < -30) {
            gameStarted = false;
            player2Score++;
            console.log("player 2 scored !");
            scoreDiv.innerText = `${player1Score} - ${player2Score}`;
            resetBall();
        }
        else if (player1Score == 1 || player2Score == 1) {
            stopGame();
            gameStarted = false;
            console.log("game done !");
            const playerScore = player1Score;
            const opponentScore = player2Score;
            const opponentId = 0;
            sendMatchResult(0, playerScore, opponentScore, opponentId);
            return;
        }
        else if (gameStarted || keysPressed[" "] || Math.floor((Date.now() - startRound) / 1000) > 5) {
            gameStarted = true;
            moveBall();
        }
        animationId = requestAnimationFrame(framePong);
    }
    //get time of start
    if (!animationId) {
        console.log("game should start");
        animationId = requestAnimationFrame(framePong);
    }
}
export function stopGame() {
    cancelAnimationFrame(animationId);
    animationId = 0;
}
