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
    window.dispatchEvent(new Event("languageChanged"));
}
export function getCurrentLang() {
    const lang = document.documentElement.lang;
    if (lang === 'en' || lang === 'fr' || lang === 'jp')
        return (lang);
    return ('en');
}
export const qrCodeMessages = {
    failed: {
        en: '<p class="text-red-600">Failed to load QR code</p>',
        fr: '<p class="text-red-600">Echec du chargement du QR code</p>',
        jp: '<p class="text-red-600">QRコードの読み込みに失敗しました</p>',
    },
    network: {
        en: '<p class="text-red-600">Network error loading QR code</p>',
        fr: '<p class="text-red-600">Erreur réseau lors du chargement du QR code</p>',
        jp: '<p class="text-red-600">QRコードの読み込み中にネットワークエラーが発生しました</p>',
    },
    required: {
        en: 'Two-factor authentication setup required',
        fr: 'Authentification a deux facteurs nécessaire',
        jp: '二要素認証が必要です'
    },
    loading: {
        en: '<p>Loading QR code...</p>',
        fr: '<p>Chargement du QR code...</p>',
        jp: 'QRコードを読み込み中'
    },
    enter: {
        en: 'Please enter the 2FA code',
        fr: 'Veuillez entrer votre code 2FA',
        jp: '2FAコードを入力してください'
    },
    invalid: {
        en: 'Invalid 2FA code',
        fr: 'Code 2FA invalide',
        jp: '無効な2FAコード'
    }
};
export const loginMessages = {
    success: {
        en: "Successfully logged in",
        fr: "Connexion réussie",
        jp: "ログイン成功"
    },
    failed: {
        en: 'Authentication failed',
        fr: "Echec d'authentification",
        jp: '認証に失敗しました'
    },
    fields: {
        en: 'Please fill all the fields',
        fr: 'Veuillez remplir chaque champ',
        jp: 'すべての項目を入力してください'
    },
    notFound: {
        en: 'User not found in database',
        fr: 'Utilisateur non trouvé',
        jp: 'ユーザーが見つかりません'
    },
    incorrect: {
        en: 'Incorrect password',
        fr: 'Mot de passe invalide',
        jp: '無効なパスワード',
    },
    network: {
        en: 'Network error, try again later',
        fr: 'Erreur réseau, essayez plus tard',
        jp: 'ネットワークエラー。後で再試行してください'
    },
    successReg: {
        en: "Registered successfully",
        fr: "Inscription réussie",
        jp: "登録成功"
    },
    alreadyExists: {
        en: 'Error: User already exists (username or email)',
        fr: "Nom d'utilisateur ou email déjà utilisé",
        jp: 'ユーザー名またはメールアドレスは既に使用されています'
    }
};
