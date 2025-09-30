export async function render404() {
    document.title = "404 - Page Not Found";
    const app = document.getElementById('app');
    if (!app)
        return;
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
}
