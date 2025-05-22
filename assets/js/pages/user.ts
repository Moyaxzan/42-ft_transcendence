export function renderUser() {
	const app = document.getElementById('app')!;
	if (!app)
		return ;
/*
	const res = await fetch('/dist/html/users.html');
	const html = await res.text();
	app.innerHTML = html;
*/
app.innerHTML = `<span>Display users</span>`;
console.log("app div found?", app);
}
