let currentLang = 'en';
export function setLanguage(lang) {
    //currentLang = lang;
    console.log('Setting language to:', lang);
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    const allLangElements = document.querySelectorAll('[lang]');
    allLangElements.forEach(el => {
        const elLang = el.getAttribute('lang');
        el.style.display = elLang === lang ? '' : 'none';
    });
    const currentMode = localStorage.getItem("mode") || sessionStorage.getItem("gameMode") || '1vs1';
    const modeSpans = document.querySelectorAll('span[mode]');
    modeSpans.forEach(span => {
        const spanMode = span.getAttribute('mode');
        span.style.display = spanMode === currentMode ? '' : 'none';
    });
}
export function getCurrentLang() {
    return document.documentElement.lang || 'en';
}
