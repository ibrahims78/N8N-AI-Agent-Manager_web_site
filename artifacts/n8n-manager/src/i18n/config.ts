import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ar from './ar.json';

const getInitialLanguage = () => {
  try {
    const storage = localStorage.getItem('app-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      return parsed.state?.language || 'ar';
    }
  } catch (e) {
    // ignore
  }
  return 'ar';
};

const initialLanguage = getInitialLanguage();
document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = initialLanguage;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
