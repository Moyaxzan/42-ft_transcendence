import { router, enableLinkInterception } from './router';

router();                      // Run on first load
enableLinkInterception();     // Intercept <a> clicks

window.addEventListener('popstate', router); // Handle back/forward browser buttons
