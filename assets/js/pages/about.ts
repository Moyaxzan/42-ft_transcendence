export function renderAbout() {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <h1 class="text-3xl font-bold text-purple-600">About Page</h1>
      <p class="mt-2">This is the about page.</p>
    `;
  }
  