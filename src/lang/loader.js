import en from './en.js';
import bn from './bn.js';

let currentLang = 'en';
let translations = en;

export const setLanguage = (lang) => {
  currentLang = lang;
  translations = lang === 'bn' ? bn : en;
  return translations;
};

export const t = (key, ...args) => {
  let text = translations[key] || key;
  args.forEach((arg, i) => {
    text = text.replace(`{${i}}`, arg);
  });
  return text;
};