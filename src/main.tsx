import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { aiSearchPage, bindAiSearch } from '../scripts/ai-search';
import { authPage, bindAuth } from '../scripts/auth';
import { catalogPage, bindCatalog } from '../scripts/catalog';
import { comparisonPage } from '../scripts/comparison';
import { favoritesPage } from '../scripts/favorites';
import { bindHome, homePage } from '../scripts/home';
import { bindListing, listingPage } from '../scripts/listing';
import { bindProfile, profilePage } from '../scripts/profile';
import { bindProperty, propertyPage } from '../scripts/property';
import { loadProperties } from '../scripts/mock-data';
import { getLocale, installTranslations, setLocale } from '../scripts/i18n';
import { readStore, toggleId, writeStore } from '../scripts/store';
import { footer, header, toast } from '../scripts/ui';
import type { PageName, Property } from '../scripts/types';
import { bindValuation, valuationPage } from '../scripts/valuation';

const loadingMarkup = '<div class="container page-skeleton" aria-label="Загрузка страницы"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-copy"></div><div class="skeleton skeleton-panel"></div><div class="skeleton skeleton-cards"><i></i><i></i><i></i></div></div>';

function pageMarkup(page: PageName, properties: Property[]): string {
  if (page === 'home') return homePage(properties);
  if (page === 'catalog') return catalogPage(properties);
  if (page === 'property') {
    const item = properties.find(entry => entry.id === new URLSearchParams(location.search).get('id'));
    return propertyPage(item, properties);
  }
  if (page === 'valuation') return valuationPage();
  if (page === 'ai-search') return aiSearchPage();
  if (page === 'favorites') return favoritesPage(properties);
  if (page === 'compare') return comparisonPage(properties);
  if (page === 'create-listing') return listingPage();
  if (page === 'profile') return profilePage();
  if (page === 'login') return authPage();
  return homePage(properties);
}

function App() {
  const page = (document.body.dataset.page || 'home') as PageName;
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const pageContent = useMemo(
    () => properties ? pageMarkup(page, properties) : loadingMarkup,
    [page, properties],
  );

  useEffect(() => {
    let active = true;
    loadProperties().then(data => {
      if (active) setProperties(data);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : String(cause));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!properties || !mainRef.current) return;

    const stopTranslations = installTranslations();
    document.getElementById('site-header')!.innerHTML = header(page, getLocale());
    document.getElementById('site-footer')!.innerHTML = footer();
    if (page === 'home') bindHome();
    else if (page === 'catalog') bindCatalog(properties);
    else if (page === 'property') bindProperty(properties.find(item => item.id === new URLSearchParams(location.search).get('id')));
    else if (page === 'valuation') bindValuation(properties);
    else if (page === 'ai-search') bindAiSearch(properties);
    else if (page === 'create-listing') bindListing();
    else if (page === 'profile') bindProfile(properties);
    else if (page === 'login') bindAuth();

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: .08 })
      : null;
    const revealNodes = document.querySelectorAll('.fade-up:not(.visible)');
    if (observer) revealNodes.forEach(node => observer.observe(node));
    else revealNodes.forEach(node => node.classList.add('visible'));

    const updateCounts = () => {
      document.querySelectorAll('[data-count="favorites"]').forEach(node => {
        node.textContent = String(readStore('favorites', []).length);
      });
      document.querySelectorAll('[data-count="compare"]').forEach(node => {
        node.textContent = String(readStore('compare', []).length);
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const action = event.target.closest<HTMLElement>('[data-action]');
      if (!action) return;
      const kind = action.dataset.action;

      if (kind === 'menu') {
        const menu = document.getElementById('mobile-nav');
        if (!menu) return;
        const open = menu.classList.toggle('open');
        action.setAttribute('aria-expanded', String(open));
        action.innerHTML = open
          ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>'
          : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
      } else if (kind === 'language') {
        const locale = action.dataset.locale;
        if (locale === 'uz' || locale === 'ru' || locale === 'en') {
          setLocale(locale);
          document.querySelectorAll<HTMLElement>('[data-action="language"]').forEach(button => {
            const active = button.dataset.locale === locale;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
          });
        }
      } else if (kind === 'legal') {
        toast('Документы будут опубликованы перед запуском сервиса.');
      } else if (kind === 'social') {
        toast('Ссылки на социальные сети появятся перед запуском Makon.');
      } else if (kind === 'message') {
        toast('Демонстрационный контакт. Отправка сообщений пока не подключена.');
      } else if (kind === 'favorite') {
        const result = toggleId('favorites', action.dataset.id || '');
        if (result === 'limit' || result === 'error') {
          toast(result === 'limit' ? 'Не удалось сохранить объект.' : 'Хранилище браузера недоступно.');
          return;
        }
        const saved = result === 'added';
        document.querySelectorAll<HTMLElement>(`[data-action="favorite"][data-id="${action.dataset.id}"]`).forEach(button => {
          button.classList.toggle('is-saved', saved);
          button.setAttribute('aria-label', saved ? 'Убрать из избранного' : 'В избранное');
          if (button.closest('.property-details')) {
            button.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"></path></svg> ${saved ? 'Сохранено' : 'В избранное'}`;
          }
        });
        updateCounts();
        toast(saved ? 'Добавлено в избранное' : 'Удалено из избранного');
        if (page === 'favorites') mainRef.current!.innerHTML = favoritesPage(properties);
      } else if (kind === 'compare' || kind === 'uncompare') {
        const id = action.dataset.id || '';
        const result = kind === 'uncompare'
          ? writeStore('compare', readStore('compare', []).filter(item => item !== id)) ? 'removed' : 'error'
          : toggleId('compare', id, 4);
        if (result === 'limit') {
          toast('Можно сравнить не более четырёх объектов.');
          return;
        }
        if (result === 'error') {
          toast('Не удалось сохранить изменения.');
          return;
        }
        const selected = result === 'added';
        document.querySelectorAll<HTMLElement>(`[data-action="compare"][data-id="${id}"]`).forEach(button => {
          button.classList.toggle('active', selected);
        });
        updateCounts();
        toast(selected ? 'Добавлено к сравнению' : 'Убрано из сравнения');
        if (page === 'compare') mainRef.current!.innerHTML = comparisonPage(properties);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      observer?.disconnect();
      stopTranslations();
      document.removeEventListener('click', handleClick);
    };
  }, [page, properties]);

  if (error) {
    return <main className="container section"><div className="empty-state">
      <h2>Не удалось открыть объявления</h2>
      <p>Запустите <code>npm run dev</code> из папки проекта и откройте адрес Vite, указанный в терминале. API каталога запускается вместе с ним.</p>
      <code>{error}</code>
    </div></main>;
  }

  return <>
    <div id="site-header" />
    <main
      id="main-content"
      ref={mainRef}
      aria-busy={!properties}
      dangerouslySetInnerHTML={{ __html: pageContent }}
    />
    <div id="site-footer" />
    <div className="toast-region" id="toast-region" aria-live="polite" />
  </>;
}

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('React root element "#app" was not found.');

createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
