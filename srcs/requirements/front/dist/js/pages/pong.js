var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let animationId;
export function renderPong() {
    return __awaiter(this, void 0, void 0, function* () {
        stopGame();
        const app = document.getElementById('app');
        if (!app)
            return;
        const res = yield fetch('/dist/html/pong.html');
        const html = yield res.text();
        app.innerHTML = html;
        //get elements of html
        let leftPaddle = document.getElementById("left-paddle");
        let rightPaddle = document.getElementById("right-paddle");
        let ball = document.getElementById("ball");
        if (!leftPaddle || !rightPaddle || !ball)
            return;
        const trailBalls = [];
        for (let i = 2; i <= 10; i++) {
            const ball = document.getElementById(`ball${i}`);
            if (!ball) {
                return;
            }
            trailBalls.push(ball);
        }
        //get time of start
        const startTime = Date.now();
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
        function reflectAngle(angle) {
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
                return -angle;
            }
            return newAngle;
        }
        //initializations
        let leftPaddlePos = 0; // as %
        let rightPaddlePos = 0; // as %
        // ballPosx[0] is the actual pos of the ball. The others are the trail.
        let ballPosx = Array(10).fill(50);
        let ballPosy = Array(10).fill(50);
        let ballVectx = 0;
        let ballVecty = 0;
        let lastbounce = startTime;
        let ballSpeed = 0.6;
        let angle = Math.random() * 2 * Math.PI;
        let atan = Math.atan2(ballVectx, ballVecty);
        if (atan > Math.PI / 3 && atan <= Math.PI / 2) {
            angle = Math.PI / 3 * 0.95;
        }
        else if (atan < 2 * Math.PI / 3 && atan > Math.PI / 2) {
            angle = 2 * Math.PI / 3 * 1.05;
        }
        else if (atan > 4 * Math.PI / 3 && atan <= 3 * Math.PI / 2) {
            angle = 4 * Math.PI / 3 * 0.95;
        }
        else if (atan < 5 * Math.PI / 3 && atan > 3 * Math.PI / 2) {
            angle = 5 * Math.PI / 3 * 1.05;
        }
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
            if (ballPosy[0] <= 2 || ballPosy[0] >= 98) {
                ballVecty = -ballVecty;
            }
            //paddle collisions
            if (Date.now() - lastbounce > 100) {
                if (ballPosx[0] >= 100 && ballPosx[0] < 102 && ballPosy[0] >= rightPaddlePos && ballPosy[0] <= rightPaddlePos + 18) {
                    const newAngle = reflectAngle(Math.atan2(ballVecty, ballVectx));
                    ballVectx = Math.cos(newAngle);
                    ballVecty = Math.sin(newAngle);
                    lastbounce = Date.now();
                    ballSpeed = ballSpeed + 0.02;
                    console.log("ball speed: ", ballSpeed);
                }
                else if (ballPosx[0] <= 0 && ballPosx[0] > -2 && (ballPosy[0] >= leftPaddlePos && ballPosy[0] <= leftPaddlePos + 18)) {
                    const newAngle = reflectAngle(Math.atan2(ballVecty, ballVectx));
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
            if (gameStarted || Math.floor((Date.now() - startTime) / 1000) > 5) {
                gameStarted = true;
                try {
                    moveBall();
                }
                catch (err) {
                    console.log("moveBall crashed: ", err);
                }
            }
            animationId = requestAnimationFrame(framePong);
        }
        animationId = requestAnimationFrame(framePong);
    });
}
export function stopGame() {
    cancelAnimationFrame(animationId);
}
