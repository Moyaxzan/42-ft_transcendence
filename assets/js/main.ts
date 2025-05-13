import { router, enableLinkInterception } from './router.js';

router();                      // Run on first load
enableLinkInterception();     // Intercept <a> clicks
console.log("main.js loaded");
window.addEventListener('popstate', router); // Handle back/forward browser buttons
