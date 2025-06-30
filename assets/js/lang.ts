let currentLang: 'en' | 'fr' = 'en';

// export function applyTranslations(lang: 'en' | 'fr') {
// 	const t = translations[lang];
// 	if (!t) return;

// 	document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
// 		const key = el.dataset.i18n!;
// 		const value = key.split('.').reduce((o, k) => (o as any)?.[k], t);
// 		if (typeof value === 'string') el.textContent = value;
// 	});

// 	document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
// 		const key = el.dataset.i18nPlaceholder!;
// 		const value = key.split('.').reduce((o, k) => (o as any)?.[k], t);
// 		if (typeof value === 'string') el.placeholder = value;
// 	});
// }

export function setLanguage(lang: 'en' | 'fr') {
	//currentLang = lang;
	localStorage.setItem("lang", lang)
	document.documentElement.lang = lang;

	//applyTranslations(lang);
	//document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));

	const allLangElements = document.querySelectorAll('[lang]');
	allLangElements.forEach(el => {
		const elLang = el.getAttribute('lang');
		(el as HTMLElement).style.display = elLang === lang ? '' : 'none';
	});
}

// export function toggleLanguage() {
// 	setLanguage(currentLang === 'en' ? 'fr' : 'en');
// }

// export const translations = {
// 	en: {
// 		home: {
// 			ready: "Ready to lose?",
// 			play: "Play",
// 			username: "Username",
// 			password: "Password",
// 			login: "Login or Sign up",
// 			google: "Login with Google",
// 		}
// 	},
// 	fr: {
// 		home: {
// 			ready: "Prêt à perdre ?",
// 			play: "Jouer",
// 			username: "Nom d'utilisateur",
// 			password: "Mot de passe",
// 			login: "Se connecter ou s'inscrire",
// 			google: "Se connecter avec Google",
// 		}
// 	}
// };

