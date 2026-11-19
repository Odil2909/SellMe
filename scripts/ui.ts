import { icon } from './icons';
import { readStore } from './store';
import type { Property } from './types';

const contactSheetUrl = new URL('../assets/images/property-contact-sheet.jpg', import.meta.url).href;
const brandLogoUrl = new URL('../logo/logo.png', import.meta.url).href;
export const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const money = (amount: number, {compact = false}: {compact?: boolean} = {}) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  notation: compact ? 'compact' : 'standard'
}).format(Number(amount) || 0);

export const priceLabel = (item: Property) => `${money(item.price)}${item.deal === 'Аренда' ? ' / мес.' : item.deal === 'Посуточно' ? ' / сутки' : ''}`;

export function imageView(src: string, alt: string, className = '') {
  const match = String(src).match(/property-contact-sheet\.jpg#tile-(\d+)/);
  if (match) {
    const tile = Math.max(1, Math.min(24, Number(match[1]))) - 1;
    const root = document.body.dataset.page === 'home' ? './' : '../';
    const col = tile % 6, row = Math.floor(tile / 6);
    const x = col * 20, y = row * (100 / 3);
    const path = contactSheetUrl || `${root}assets/images/property-contact-sheet.jpg`;
    return `<span class="property-image-crop ${className}" role="img" aria-label="${escapeHtml(alt)}" style="background-image:url('${escapeHtml(path)}');background-position:${x}% ${y}%"></span>`;
  }
  if (!src) return `<span class="property-image-placeholder ${className}" role="img" aria-label="${escapeHtml(alt)}">${icon('home',34)}</span>`;
  const safeSource = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  if (/\.(?:mp4|mov|webm)(?:[?#]|$)/i.test(src)) {
    const isDetailPage = document.body.dataset.page === 'property';
    const playback = isDetailPage ? 'controls' : 'autoplay loop';
    return `<video class="${className}" src="${safeSource}" aria-label="${safeAlt}" muted playsinline ${playback} preload="metadata"></video>`;
  }
  return `<img class="${className}" src="${safeSource}" alt="${safeAlt}" loading="lazy" decoding="async">`;
}

export function brand({footer = false}: {footer?: boolean} = {}) {
  const root = document.body.dataset.page === 'home' ? './' : '../';
  return `<a class="brand ${footer ? 'footer-brand-mark' : ''}" href="${root}index.html" aria-label="uy-ol — главная"><img src="${brandLogoUrl}" alt=""><span>uy-ol<em>.</em></span></a>`;
}

export function header(page: string, locale = 'ru') {
  const homePrefix = page === 'home' ? './' : '../';
  const p = page === 'home' ? './pages/' : './';
  const favCount = readStore('favorites', []).length;
  const drawerLinks = [
    ['home', 'Главная', `${homePrefix}index.html`, 'home'],
    ['catalog', 'Каталог', `${p}catalog.html`, 'building'],
    ['buy', 'Купить', `${p}catalog.html?deal=Продажа`, 'search'],
    ['rent', 'Арендовать', `${p}catalog.html?deal=Аренда`, 'clock'],
    ['valuation', 'Оценить недвижимость', `${p}valuation.html`, 'chart'],
    ['ai-search', 'AI-подбор', `${p}ai-search.html`, 'sparkle'],
    ['favorites', 'Избранное', `${p}favorites.html`, 'heart'],
    ['compare', 'Сравнение', `${p}compare.html`, 'compare'],
    ['profile', 'Личный кабинет', `${p}profile.html`, 'user'],
    ['login', 'Войти', `${p}login.html`, 'user']
  ];
  const links = drawerLinks.map(([key,label,href,ico]) => `<a class="menu-link ${page===key?'active':''}" href="${href}" data-action="menu-link" ${page===key?'aria-current="page"':''}><span class="menu-link-icon">${icon(ico,18)}</span><span>${label}</span>${icon('arrow',15,'menu-link-arrow')}</a>`).join('');
  const languages = [['uz','UZ'],['ru','RU'],['en','EN']].map(([key,label])=>`<button type="button" data-action="language" data-locale="${key}" aria-pressed="${locale===key}" class="${locale===key?'active':''}">${label}</button>`).join('');
  const dark = document.documentElement.dataset.theme==='dark';
  return `<header class="site-header"><div class="container header-inner">
    <button class="icon-button menu-toggle" type="button" data-action="menu" aria-controls="site-menu" aria-expanded="false" aria-label="Открыть меню">${icon('menu')}</button>
    ${brand()}
    <div class="header-actions"><div class="language-switch" role="group" aria-label="Язык сайта">${languages}</div><button class="icon-button theme-toggle" type="button" data-action="theme-toggle" aria-label="${dark?'Включить светлую тему':'Включить тёмную тему'}" aria-pressed="${dark}" title="${dark?'Светлая тема':'Тёмная тема'}">${icon(dark?'sun':'moon',18)}</button><a class="icon-button" href="${p}favorites.html" aria-label="Избранное">${icon('heart')}<span class="count-badge" data-count="favorites">${favCount}</span></a><a class="icon-button compare-header" href="${p}compare.html" aria-label="Сравнить объекты">${icon('compare')}<span class="count-badge" data-count="compare">${readStore('compare', []).length}</span></a><a class="icon-button profile-header" href="${p}profile.html" aria-label="Личный кабинет">${icon('user')}</a><a class="btn btn-quiet btn-small auth-header-link" href="${p}login.html">Войти</a><a class="btn btn-primary btn-small header-listing-link" href="${p}create-listing.html">Разместить</a></div>
  </div></header><button class="menu-backdrop" type="button" data-action="menu-close" aria-label="Закрыть меню" tabindex="-1"></button><aside class="mobile-nav" id="site-menu" role="dialog" aria-modal="true" aria-label="Меню uy-ol" aria-hidden="true" inert><div class="menu-panel-head">${brand()}<button class="icon-button menu-close" type="button" data-action="menu-close" aria-label="Закрыть меню">${icon('close')}</button></div><div class="mobile-language language-switch" role="group" aria-label="Язык сайта">${languages}</div><nav class="menu-links" aria-label="Основная навигация">${links}</nav><a class="btn btn-primary menu-listing-link" href="${p}create-listing.html" data-action="menu-link">${icon('plus',17)} Разместить объявление</a><div class="menu-panel-foot"><span>uy-ol</span><span>Недвижимость Узбекистана</span></div></aside>`;
}

export function footer() {
  const p = document.body.dataset.page === 'home' ? './pages/' : './';
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><div>${brand({footer:true})}<p>Помогаем находить место, которое станет вашим. Недвижимость Узбекистана — с вниманием к деталям.</p><div class="tag-row" style="margin-top:18px"><span class="pill">Продажа</span><span class="pill">Аренда</span><span class="pill">Оценка</span></div></div>
    <div class="footer-col"><h4>Платформа</h4><a href="${p}catalog.html">Каталог</a><a href="${p}ai-search.html">Умный подбор</a><a href="${p}valuation.html">Оценка объекта</a><a href="${p}compare.html">Сравнение</a></div>
    <div class="footer-col"><h4>Разместить</h4><a href="${p}create-listing.html">Продать недвижимость</a><a href="${p}create-listing.html">Сдать в аренду</a><a href="${p}profile.html">Личный кабинет</a><a href="${p}favorites.html">Избранное</a></div>
    <div class="footer-col"><h4>О uy-ol</h4><a href="mailto:drcoding.business@gmail.com">drcoding.business@gmail.com</a><a href="tel:+998950881760">+998 95 088 1760</a><a href="https://t.me/Ez1dKid" target="_blank" rel="noopener noreferrer">Telegram: @Ez1dKid</a><a href="https://t.me/Bredlyban2" target="_blank" rel="noopener noreferrer">Telegram: @Bredlyban2</a><a href="https://instagram.com/gofurovicc.a" target="_blank" rel="noopener noreferrer">Instagram: gofurovicc.a</a><a href="https://telegra.ph/POLITIKA-KONFIDENCIALNOSTI-11-16-75" target="_blank" rel="noopener noreferrer">Конфиденциальность</a><a href="https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-11-16-36" target="_blank" rel="noopener noreferrer">Условия использования</a></div></div>
    <div class="footer-bottom"><span>© 2026 uy-ol. Демонстрационный проект.</span><span>Цены и объявления приведены в учебных целях.</span></div></div></footer>`;
}

export function toast(message: string) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const node = document.createElement('div');
  node.className = 'toast'; node.textContent = message;
  region.append(node);
  setTimeout(() => { node.classList.add('out'); setTimeout(() => node.remove(), 220); }, 2800);
}

export function listingCard(item: Property, {compare = true}: {compare?: boolean} = {}) {
  const favorites = readStore('favorites', []);
  const compared = readStore('compare', []);
  const image = item.photos?.[0] || '';
  const propertyHref = document.body.dataset.page === 'home' ? './pages/property.html' : './property.html';
  const id = escapeHtml(item.id);
  const href = `${propertyHref}?id=${encodeURIComponent(item.id)}`;
  return `<article class="property-card fade-up" data-property-card="${id}">
    <div class="property-photo"><a href="${href}" aria-label="Открыть: ${escapeHtml(item.title)}">${imageView(image,item.title,'')}</a><span class="photo-label pill">${escapeHtml(item.status || 'Объявление')}</span>
      <button class="favorite-btn ${favorites.includes(item.id) ? 'is-saved' : ''}" data-action="favorite" data-id="${id}" aria-label="${favorites.includes(item.id) ? 'Убрать из избранного' : 'В избранное'}">${icon('heart',19)}</button></div>
    <div class="property-info"><div class="property-type">${escapeHtml(item.deal)} · ${escapeHtml(item.category)}</div><a href="${href}"><h3 class="property-title">${escapeHtml(item.title)}</h3></a><div class="property-location">${icon('pin',15)} ${escapeHtml(item.city)}, ${escapeHtml(item.district)}</div>
      <div class="property-meta">${item.rooms ? `<span>${icon('bed',15)} ${item.rooms} комн.</span>` : ''}<span>${icon('area',15)} ${item.area} м²</span><span>${money(Math.round(item.price / item.area))}/м²</span></div>
      <div class="property-bottom"><div><div class="property-price">${priceLabel(item)}</div></div>${compare ? `<button class="compare-toggle ${compared.includes(item.id) ? 'active' : ''}" data-action="compare" data-id="${item.id}" aria-label="Добавить в сравнение">${icon('compare',17)}</button>` : ''}</div>
    </div></article>`;
}

export function sectionTitle(kicker: string, title: string, desc = '') {
  return `<div class="section-head"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}</div></div>`;
}
