/*
import { animateLinesToFinalState } from './navbar.js'
import { setLanguage } from '../lang.js';

export async function render404() {
	document.title = "404 - Page Not Found";
	const app = document.getElementById('app');
	if (!app)
		return;

	const res = await fetch('/dist/html/error404.html');
	const html = await res.text();

	app.innerHTML = html;

	setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');


	animateLinesToFinalState([
		{ id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
		{ id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
	]);

	const	headLoginButton = document.getElementById('head-login-button');
	const	headLogoutButton = document.getElementById('head-logout-button');

	headLoginButton?.classList.add('hidden');
	headLogoutButton?.classList.add('hidden');
}
*/
import { animateLinesToFinalState, setLinesFinalState } from './navbar.js'
import { setVideoFinalState } from './bg_video.js';
import { setLanguage } from '../lang.js';

export async function render404() {
  document.title = "404 - Page Not Found";
  const app = document.getElementById('app');
  if (!app) return;

  // Injecte directement le contenu HTML
  app.innerHTML = `
    <div class="flex flex-col items-center justify-start h-full text-center px-6 pt-20 relative">
      <h1 class="text-[8rem] font-extrabold text-[#FFB942] drop-shadow-lg leading-none animate-bounce">404</h1>
      <p class="text-2xl font-semibold text-[#00303C] mb-4">
        <span lang="en">Page not found</span>
        <span lang="fr">Page introuvable</span>
        <span lang="jp">ページが見つかりません</span>
      </p>
      <p class="text-lg text-gray-600 mb-8">
        <span lang="en">Oops! The page you're looking for doesn't exist.</span>
        <span lang="fr">Oups ! La page que vous recherchez n'existe pas.</span>
        <span lang="jp">おっと！お探しのページは存在しません</span>
      </p>
      <a href="/" data-link class="px-6 py-3 bg-[#218DBE] text-white rounded-lg text-lg font-bold shadow hover:bg-[#1a6f96] transition-all">
        <span lang="en">Return to home</span>
        <span lang="fr">Retour à l'accueil</span>
        <span lang="jp">ホームに戻る</span>
      </a>
    </div>
  `;

  setLanguage(document.documentElement.lang as 'en' | 'fr' | 'jp');

  setLinesFinalState([
    { id: "line-top", rotationDeg: -9, translateYvh: -30, height: "50vh" },
    { id: "line-bottom", rotationDeg: -9, translateYvh: 30, height: "50vh" },
  ]);

  setVideoFinalState({
    height: "55%",
    objectFit: "contain",
    bottom: "0",
    left: "0",
    opacity: "1"
  });

  document.getElementById('head-login-button')?.classList.add('hidden');
  document.getElementById('head-logout-button')?.classList.add('hidden');
}

