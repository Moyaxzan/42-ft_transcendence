let currentLang = 'en';
export function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    const allLangElements = document.querySelectorAll('[lang]');
    allLangElements.forEach(el => {
        const elLang = el.getAttribute('lang');
        el.style.display = elLang === lang ? '' : 'none';
    });
}
export function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'fr' : 'en');
}
