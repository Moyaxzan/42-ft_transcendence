export function renderHome() {
    const app = document.getElementById('app')!;
    app.innerHTML = `
    <div class="p-8">
    	<h1 class="text-3xl font-bold text-blue-600">Home Page</h1>
    </div>
	<button id="userLoad">Display users</button>
	<div id="userList" style="margin-top: 10px;"></div>
    `;
  }
  
