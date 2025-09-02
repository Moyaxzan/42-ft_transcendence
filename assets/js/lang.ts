let currentLang: 'en' | 'fr' | 'jp' = 'en';

export function setLanguage(lang: 'en' | 'fr' | 'jp') {
	//currentLang = lang;
	console.log('Setting language to:', lang);
	localStorage.setItem("lang", lang)
	document.documentElement.lang = lang;

	const allLangElements = document.querySelectorAll('[lang]');
	allLangElements.forEach(el => {
		const elLang = el.getAttribute('lang');
		(el as HTMLElement).style.display = elLang === lang ? '' : 'none';
	});

	const currentMode = localStorage.getItem("mode") || sessionStorage.getItem("gameMode") || '1vs1';
	const modeSpans = document.querySelectorAll('span[mode]');
	modeSpans.forEach(span => {
		const spanMode = span.getAttribute('mode');
		(span as HTMLElement).style.display = spanMode === currentMode ? '' : 'none';
	});
}

export function getCurrentLang(): string {
	return document.documentElement.lang || 'en';
}
