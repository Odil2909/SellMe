import { icon } from './icons';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('uyol:theme:v2', theme); } catch { /* Theme still applies for this page view. */ }
  const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = theme === 'dark' ? '#596b71' : '#087c55';
  const language = document.documentElement.lang === 'en' ? 'en' : document.documentElement.lang.startsWith('uz') ? 'uz' : 'ru';
  const labels = language === 'en'
    ? { action: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', title: theme === 'dark' ? 'Light theme' : 'Dark theme' }
    : language === 'uz'
      ? { action: theme === 'dark' ? 'Yorug‘ mavzuga o‘tish' : 'Qorong‘i mavzuga o‘tish', title: theme === 'dark' ? 'Yorug‘ mavzu' : 'Qorong‘i mavzu' }
      : { action: theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему', title: theme === 'dark' ? 'Светлая тема' : 'Тёмная тема' };
  document.querySelectorAll<HTMLButtonElement>('[data-action="theme-toggle"]').forEach(button => {
    button.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon', 18);
    button.setAttribute('aria-label', labels.action);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = labels.title;
  });
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}
