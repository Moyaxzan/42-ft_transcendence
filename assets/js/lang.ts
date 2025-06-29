let currentLang: 'en' | 'fr' = 'en';

export function setLanguage(lang: 'en' | 'fr') {
	currentLang = lang;
	document.documentElement.lang = lang;

	const allLangElements = document.querySelectorAll('[lang]');
	allLangElements.forEach(el => {
		const elLang = el.getAttribute('lang');
		(el as HTMLElement).style.display = elLang === lang ? '' : 'none';
	});
}

export function toggleLanguage() {
	setLanguage(currentLang === 'en' ? 'fr' : 'en');
}