import i18next from 'i18next';

// Define all translations needed for the menu
const resources = {
  en: {
    translation: {
      "MAIN_MENU": "MAIN MENU",
      "Statistics": "Statistics",
      "Home": "Home",
      "Attendance": "Attendance",
      "Absence": "Absence",
      "Late": "Late",
      "Excuses": "Excuses"
    }
  },
  ar: {
    translation: {
      "MAIN_MENU": "القائمة الرئيسية",
      "Statistics": "الإحصائيات",
      "Home": "الصفحة الرئيسية",
      "Attendance": "الحضور",
      "Absence": "الغياب",
      "Late": "التأخير",
      "Excuses": "الأعذار"
    }
  }
};

export const getTranslator = (lang: string) => {
  const instance = i18next.createInstance();
  instance.init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initImmediate: false // Important for server-side usage
  });
  return instance.t;
};

// Optional helper for direct translation
export const t = (key: string, lang: string = 'en') => {
  const translator = getTranslator(lang);
  return translator(key);
};