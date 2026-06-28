"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEs = i18n.language === "es";

  return (
    <button
      onClick={() => i18n.changeLanguage(isEs ? "en" : "es")}
      aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
      className="text-sm font-medium px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
    >
      {isEs ? "English" : "Español"}
    </button>
  );
}
