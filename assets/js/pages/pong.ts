export async function renderPong() {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/pong.html');
	const html = await res.text();

	app.innerHTML = html;






	// Paddle movement setup
	let leftPaddle = document.getElementById("left-paddle") as HTMLDivElement;
	let rightPaddle = document.getElementById("right-paddle") as HTMLDivElement;
	let ball = document.getElementById("ball") as HTMLDivElement;
	if (!leftPaddle || !rightPaddle || !ball) return;


	let keysPressed: {[key: string] : boolean} = {};

	document.addEventListener("keydown", (e) => {
		keysPressed[e.key] = true;
	});

	document.addEventListener("keyup", (e) => {
		keysPressed[e.key] = false;
	});

	let ballPosx = 50;
	let ballPosy = 50;


	let leftPaddlePos = 0;   // as %
	let rightPaddlePos = 0;  // as %

	function movePaddles() {
		const speed = 0.65;     // % per key press

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
		requestAnimationFrame(movePaddles)
	}


	requestAnimationFrame(movePaddles)
}


//TODO
// generer un nombre entre -1 et 1 (y) != 0
// get x avec x = sqrt(1 - y**2)
// vect(x, y) ou -vect(x, y)
// tourner vect de 45d au contact. (faire equation)
