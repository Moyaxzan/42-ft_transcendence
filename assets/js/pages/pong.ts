export async function renderPong() {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/js/pages/pong.html');
	const html = await res.text();

	app.innerHTML = html;
}
