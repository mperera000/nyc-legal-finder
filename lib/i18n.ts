import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/public/locales/en/common.json";
import es from "@/public/locales/es/common.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    es: { common: es },
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
