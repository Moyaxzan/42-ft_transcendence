export async function renderHome() {
    const app = document.getElementById('app');
    if (!app)
        return;
    const res = await fetch('/dist/html/home.html');
    const html = await res.text();
    app.innerHTML = html;
}
