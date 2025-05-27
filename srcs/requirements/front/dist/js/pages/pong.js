let animationId = 0;
export async function renderPong() {
    stopGame();
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch(`/dist/html/pong.html`);
    const html = await res.text();
    app.innerHTML = html;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    //get elements of html
    const leftPaddle = document.getElementById("left-paddle");
    const rightPaddle = document.getElementById("right-paddle");
    const ball = document.getElementById("ball");
    if (!leftPaddle || !rightPaddle || !ball)
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
        let angle = Math.atan2(ballVectx, ballVecty);
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
            return (Math.atan2(-ballVectx, ballVecty));
        }
        return newAngle;
    }
    const startTime = Date.now();
    //initializations
    let leftPaddlePos = 41; // as %
    let rightPaddlePos = 41; // as %
    // ballPosx[0] is the actual pos of the ball. The others are the trail.
    let ballPosx = Array(10).fill(50);
    let ballPosy = Array(10).fill(50);
    let ballVectx = 0;
    let ballVecty = 0;
    let lastbounce = startTime;
    let ballSpeed = 0.6;
    function getInitialAngle() {
        // Launch angle: avoid too vertical or horizontal
        let angle;
        let normalized;
        do {
            angle = Math.random() * 2 * Math.PI;
            normalized = Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle)));
        } while (normalized < Math.PI / 6 || normalized > 5 * Math.PI / 6); // avoid near-horizontal/vertical
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
        if (ballPosy[0] <= 2 || ballPosy[0] >= 98) {
            ballVecty = -ballVecty;
        }
        //paddle collisions
        if (Date.now() - lastbounce > 100) {
            if (ballPosx[0] >= 100 && ballPosx[0] < 102 && ballPosy[0] >= rightPaddlePos && ballPosy[0] <= rightPaddlePos + 18) {
                const newAngle = reflectAngle(ballVecty, ballVectx);
                ballVectx = Math.cos(newAngle);
                ballVecty = Math.sin(newAngle);
                lastbounce = Date.now();
                ballSpeed = ballSpeed + 0.02;
                console.log("ball speed: ", ballSpeed);
            }
            else if (ballPosx[0] <= 0 && ballPosx[0] > -2 && (ballPosy[0] >= leftPaddlePos && ballPosy[0] <= leftPaddlePos + 18)) {
                const newAngle = reflectAngle(ballVecty, ballVectx);
                ballVectx = Math.cos(newAngle);
                ballVecty = Math.sin(newAngle);
                lastbounce = Date.now();
                ballSpeed = ballSpeed + 0.02;
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
        if (gameStarted || keysPressed[" "] || Math.floor((Date.now() - startTime) / 1000) > 5) {
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
