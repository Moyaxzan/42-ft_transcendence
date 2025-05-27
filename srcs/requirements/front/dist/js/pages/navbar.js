export function animateNavbarForPong() {
    const navbar = document.getElementById('navbar');
    const homeLink = document.getElementById('home-link');
    const profileLink = document.getElementById('profile-link');
    const pongLink = document.getElementById('pong-link');
    const authLink = document.getElementById('auth-link');
    if (!navbar || !profileLink || !pongLink || !homeLink || !authLink) {
        return;
    }
    navbar.classList.remove('h-[15vh]');
    navbar.classList.add('h-[10vh]');
    homeLink.classList.remove('justify-center');
    homeLink.classList.add('justify-start');
    homeLink.classList.add('px-6');
    // Animate profile and pong links with fade-out + slide
    [profileLink, pongLink].forEach((el) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-10px)';
        }
    });
    setTimeout(() => {
        profileLink === null || profileLink === void 0 ? void 0 : profileLink.remove();
        pongLink === null || pongLink === void 0 ? void 0 : pongLink.remove();
    }, 500);
}
export function resetNavbar() {
    const navbar = document.getElementById('navbar');
    const homeLink = document.getElementById('home-link');
    const profileExists = document.getElementById('profile-link');
    if (!profileExists && navbar) {
        navbar.classList.remove('h-[10vh]');
        navbar.classList.add('h-[15vh]');
        if (homeLink) {
            homeLink.classList.remove('justify-start');
            homeLink.classList.remove('px-6');
            homeLink.classList.add('justify-center');
        }
        // Recreate profile and pong links
        const profileDiv = document.createElement('div');
        profileDiv.id = 'profile-link';
        profileDiv.className = 'flex-1 flex items-center justify-center h-full transition-opacity duration-500';
        profileDiv.innerHTML = `<a href="/profile" data-link class="text-lg font-bold hover:underline">Profile</a>`;
        const pongDiv = document.createElement('div');
        pongDiv.id = 'pong-link';
        pongDiv.className = 'flex-1 flex items-center justify-center h-full transition-opacity duration-500';
        pongDiv.innerHTML = `<a href="/pong" data-link class="text-lg font-bold hover:underline">Play Pong</a>`;
        const authDiv = document.createElement('div');
        pongDiv.id = 'auth-linl';
        pongDiv.className = 'flex-1 flex items-center justify-center h-full transition-opacity duration-500';
        pongDiv.innerHTML = `<a href="/auth" data-link class="text-lg font-bold hover:underline">LogIn</a>`;
        navbar.appendChild(profileDiv);
        navbar.appendChild(pongDiv);
        navbar.appendChild(authDiv);
    }
}
