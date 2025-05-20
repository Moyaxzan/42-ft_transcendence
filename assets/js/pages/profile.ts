export async function renderProfile() {
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/profile.html');
	const html = await res.text();

	app.innerHTML = html;
}
