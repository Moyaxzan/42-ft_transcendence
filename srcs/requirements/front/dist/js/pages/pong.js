var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function renderPong() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = document.getElementById('app');
        if (!app)
            return;
        const res = yield fetch('/dist/html/pong.html');
        const html = yield res.text();
        app.innerHTML = html;
        // Paddle movement setup
        let leftPaddle = document.getElementById("left-paddle");
        let rightPaddle = document.getElementById("right-paddle");
        let ball = document.getElementById("ball");
        if (!leftPaddle || !rightPaddle || !ball)
            return;
        let keysPressed = {};
        document.addEventListener("keydown", (e) => {
            keysPressed[e.key] = true;
        });
        document.addEventListener("keyup", (e) => {
            keysPressed[e.key] = false;
        });
        let ballPosx = 50;
        let ballPosy = 50;
        let leftPaddlePos = 0; // as %
        let rightPaddlePos = 0; // as %
        function movePaddles() {
            const speed = 0.65; // % per key press
            if ((keysPressed["s"] || keysPressed["S"]) && !(keysPressed["w"] || keysPressed["W"])) {
                leftPaddlePos += speed;
            }
            else if (keysPressed["w"] || keysPressed["W"] && !(keysPressed["s"] || keysPressed["S"])) {
                leftPaddlePos -= speed;
            }
            if (keysPressed["ArrowUp"] && !keysPressed["ArrowDown"]) {
                rightPaddlePos -= speed;
            }
            else if (keysPressed["ArrowDown"] && !keysPressed["ArrowUp"]) {
                rightPaddlePos += speed;
            }
            leftPaddlePos = Math.max(0, Math.min(82, leftPaddlePos));
            rightPaddlePos = Math.max(0, Math.min(82, rightPaddlePos));
            leftPaddle.style.top = `${leftPaddlePos}%`;
            rightPaddle.style.top = `${rightPaddlePos}%`;
            requestAnimationFrame(movePaddles);
        }
        requestAnimationFrame(movePaddles);
    });
}
