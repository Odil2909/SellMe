import { icon } from './icons';
import { listingCard } from './ui';
import { readStore } from './store';
import type { Property } from './types';

export function favoritesPage(properties: Property[]) {
  const ids = readStore('favorites', []);
  const saved = ids.map(id=>properties.find(item=>item.id===id)).filter(Boolean);
  if (!saved.length) return `<div class="container"><header class="page-heading"><span class="eyebrow">Ваш выбор</span><h1>Избранное</h1><p>Сохранённые объявления всегда будут здесь.</p></header><div class="empty-state"><div class="empty-icon">${icon('heart',29)}</div><h2>Пока ничего не сохранено</h2><p>Отметьте сердечком понравившийся объект — так вы сможете легко вернуться к нему.</p><a class="btn btn-primary" href="./catalog.html">Открыть каталог ${icon('arrow',16)}</a></div></div>`;
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Ваш выбор</span><h1>Избранное</h1><p>${saved.length} ${saved.length===1?'объект сохранён':'объекта сохранено'} для вас.</p></header><div class="card-grid">${saved.map(item=>listingCard(item)).join('')}</div></div>`;
}
