let currentLang = 'en'; 
let translations = {}; 


export function setTranslations(lang, parsedXliffData) {
    currentLang = lang;
    translations = parsedXliffData; 
    handleLangChange(); 
}

export function t(key) {
    return translations[key]?.target || key; 
}

export function handleLangChange() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        
        if (translations[key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', t(key));
            } else {
                el.textContent = t(key);
            }
        }
    });
}