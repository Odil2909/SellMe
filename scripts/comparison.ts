import { icon } from './icons';
import { escapeHtml, imageView, money, priceLabel } from './ui';
import { readStore } from './store';
import type { Property } from './types';

export function comparisonPage(properties: Property[]) {
  const ids=readStore('compare',[]);
  const items=ids.map(id=>properties.find(item=>item.id===id)).filter(Boolean);
  if(!items.length) return `<div class="container"><header class="page-heading"><span class="eyebrow">Решение с ясностью</span><h1>Сравнение объектов</h1><p>Сопоставьте ключевые детали и выберите то, что вам ближе.</p></header><div class="empty-state"><div class="empty-icon">${icon('compare',28)}</div><h2>Добавьте объекты для сравнения</h2><p>На карточке нажмите значок сравнения. Здесь можно сопоставить до четырёх объявлений.</p><a class="btn btn-primary" href="./catalog.html">Перейти в каталог</a></div></div>`;
  const rows: [string, (item: Property) => string][]=[
    ['Цена', (item: Property)=>priceLabel(item)],['Цена за м²',(item: Property)=>`${money(Math.round(item.price/item.area))} / м²`],['Тип объекта',(item: Property)=>item.category],['Сделка',(item: Property)=>item.deal],['Город',(item: Property)=>item.city],['Район',(item: Property)=>item.district],['Площадь',(item: Property)=>`${item.area} м²`],['Комнаты',(item: Property)=>item.rooms?`${item.rooms}`:'—'],['Этаж',(item: Property)=>item.floor?`${item.floor}${item.floors?` из ${item.floors}`:''}`:'—'],['Состояние',(item: Property)=>item.condition],['Статус',(item: Property)=>item.status]
  ];
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Решение с ясностью</span><h1>Сравнение объектов</h1><p>Можно сравнить до четырёх вариантов · ${items.length} из 4 добавлено.</p></header><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Характеристика</th>${items.map(item=>`<th>${imageView(item.photos[0],item.title,'compare-image')}<a href="./property.html?id=${encodeURIComponent(item.id)}" style="display:block;color:var(--ink)">${escapeHtml(item.title)}</a><button class="btn btn-ghost btn-small" data-action="uncompare" data-id="${escapeHtml(item.id)}">${icon('trash',14)} Убрать</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,get])=>`<tr><th>${label}</th>${items.map(item=>`<td>${escapeHtml(get(item))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:13px;font-size:.75rem">Цены и характеристики — демонстрационные данные.</p></div>`;
}
