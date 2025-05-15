import { router, enableLinkInterception, displayUser } from './router.js';
router(); // Run on first load
enableLinkInterception(); // Intercept <a> clicks
displayUser();
console.log("main.js loaded");
window.addEventListener('popstate', router); // Handle back/forward browser buttons
