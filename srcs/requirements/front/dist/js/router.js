var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { renderHome } from './pages/home.js';
import { renderProfile } from './pages/profile.js';
import { renderPong, stopGame } from './pages/pong.js';
import { renderUser } from './pages/user.js';
import { animateNavbarForPong, resetNavbar } from './pages/navbar.js';
// Define a map of paths to render functions
const routes = {
    '/': renderHome,
    '/profile': renderProfile,
    '/pong': renderPong,
    '/users': renderUser,
};
// Run this when URL changes or app first loads
export function router() {
    const path = window.location.pathname;
    console.log("Routing to:", path);
    const render = routes[path] || renderHome;
    if (path === "/pong") {
        animateNavbarForPong();
    }
    else {
        resetNavbar();
        console.log("game should stop");
        stopGame();
    }
    render();
}
// Allow click links with data-link to pushState instead of full reload
export function enableLinkInterception() {
    console.log("Setting up link interception");
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('[data-link]')) {
            e.preventDefault();
            const href = target.getAttribute('href');
            console.log("Intercepted navigation to:", href);
            history.pushState(null, '', href);
            router();
        }
    });
}
export function displayUser() {
    const userLoadBtn = document.querySelector("#userLoad");
    const userList = document.querySelector("#userList");
    if (!userLoadBtn || !userList) {
        console.error("#userLoad or #userList not found.");
        return;
    }
    userLoadBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch('/users');
        if (!res.ok)
            throw new Error('Fail to load');
        const users = yield res.json();
        userList.innerHTML = '';
        if (users.length > 0) {
            const list = document.createElement("ul");
            users.forEach((user) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${user.name}`;
                list.appendChild(listItem);
            });
            userList.appendChild(list);
        }
        else {
            userList.innerHTML = '<p>No users found</p>';
        }
    }));
}
