import { icon } from './icons';
import { listingCard, money } from './ui';
import { mountPropertyMap, type MapListing } from './maps';
import { readStore } from './store';
import type { Property } from './types';
import type { Map as LeafletMap } from 'leaflet';

const typeOptions = ['Квартира','Дом','Земля','Гараж','Коммерция','Офис','Склад'];
const cityOptions = ['Ташкент','Самарканд','Бухара','Андижан','Наманган','Фергана','Нукус'];

export function catalogPage(properties: Property[]) {
  const params = new URLSearchParams(location.search);
  const cities = [...new Set(properties.map(item => item.city))];
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Каталог Makon</span><h1>Найдите свой следующий адрес.</h1><p>Объекты по всему Узбекистану — с нужными деталями и без лишнего шума.</p></header>
  <div class="catalog-layout"><aside class="filters-panel"><div class="inline" style="justify-content:space-between"><h3>Фильтры</h3><button class="btn btn-ghost btn-small" type="button" id="clear-filters">Сбросить</button></div>
    <div class="filter-group"><h4>Тип сделки</h4><select class="input" id="filter-deal"><option value="">Любой</option>${['Продажа','Аренда','Посуточно'].map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
    <div class="filter-group"><h4>Недвижимость</h4><select class="input" id="filter-category"><option value="">Любой тип</option>${typeOptions.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
    <div class="filter-group"><h4>Местоположение</h4><select class="input" id="filter-city"><option value="">Все города</option>${cities.map(x=>`<option value="${x}">${x}</option>`).join('')}<option value="Другие города">Другие города</option></select><div class="field" style="margin-top:9px"><input id="filter-district" placeholder="Район"></div></div>
    <div class="filter-group"><h4>Цена, $</h4><div class="form-grid"><input class="input" id="filter-min" type="number" placeholder="От"><input class="input" id="filter-max" type="number" placeholder="До"></div></div>
    <div class="filter-group"><h4>Площадь, м²</h4><div class="form-grid"><input class="input" id="filter-area-min" type="number" placeholder="От"><input class="input" id="filter-area-max" type="number" placeholder="До"></div></div>
    <div class="filter-group" id="rooms-filter"><h4>Комнаты</h4><select class="input" id="filter-rooms"><option value="">Любое количество</option><option value="1">1 комната</option><option value="2">2 комнаты</option><option value="3">3 комнаты</option><option value="4">4 и более</option></select></div>
    <div class="filter-group" id="condition-filter"><h4>Состояние</h4><select class="input" id="filter-condition"><option value="">Любое</option>${['Свежий ремонт','Дизайнерский ремонт','Хорошее состояние','Под отделку','Новый','С ремонтом'].map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
    <div class="filter-group" id="floor-filter"><h4>Этаж</h4><select class="input" id="filter-floor"><option value="">Любой</option><option value="first">Не первый</option><option value="last">Не последний</option></select></div>
    <label class="filter-check"><input type="checkbox" id="filter-verified"> Только проверенные</label>
  </aside>
  <section class="catalog-results"><form class="toolbar" id="catalog-search"><input class="input" id="catalog-query" style="max-width:360px" placeholder="Поиск по объявлениям" aria-label="Поиск по объявлениям"><div class="inline"><span class="muted" id="result-count"></span><select class="input" id="sort-select" style="width:180px"><option value="relevance">Сначала подходящие</option><option value="newest">Сначала новые</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select><div class="view-switch" role="group" aria-label="Вид каталога"><button type="button" class="active" data-view="grid">${icon('building',16)} Сетка</button><button type="button" data-view="list">Список</button><button type="button" data-view="map">${icon('pin',16)} Карта</button></div></div></form>
    <div id="catalog-listing"></div>
  </section></div></div>`;
}

export function bindCatalog(properties: Property[]) {
  const params = new URLSearchParams(location.search);
  const setIf = (id: string, value: string | null) => { const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null; if (el && value) el.value = value; };
  setIf('filter-deal', params.get('deal')); setIf('filter-category', params.get('category')); setIf('filter-city', params.get('city'));
  setIf('filter-district', params.get('district')); setIf('filter-min', params.get('min')); setIf('filter-max', params.get('max'));
  const container = document.getElementById('catalog-listing')!;
  let activeMap: LeafletMap | undefined;
  let currentView = 'grid';
  const controls = ['filter-deal','filter-category','filter-city','filter-district','filter-min','filter-max','filter-area-min','filter-area-max','filter-rooms','filter-condition','filter-floor','filter-verified','catalog-query','sort-select'];
  const update = () => {
    const val = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value || '';
    const category = val('filter-category');
    const showRooms = !category || ['Квартира','Дом'].includes(category);
    document.getElementById('rooms-filter').hidden = !showRooms;
    document.getElementById('floor-filter').hidden = !!category && !['Квартира','Дом','Офис'].includes(category);
    let result = properties.filter(item => {
      const query = val('catalog-query').trim().toLowerCase();
      const price = Number(item.price), area = Number(item.area);
      const city = val('filter-city');
      if (val('filter-deal') && item.deal !== val('filter-deal')) return false;
      if (category && item.category !== category) return false;
      if (city && item.city !== city && !(city === 'Другие города' && !cityOptions.includes(item.city))) return false;
      if (val('filter-district') && !item.district.toLowerCase().includes(val('filter-district').toLowerCase())) return false;
      if (val('filter-min') && price < Number(val('filter-min'))) return false;
      if (val('filter-max') && price > Number(val('filter-max'))) return false;
      if (val('filter-area-min') && area < Number(val('filter-area-min'))) return false;
      if (val('filter-area-max') && area > Number(val('filter-area-max'))) return false;
      if (val('filter-rooms') && (!item.rooms || (val('filter-rooms') === '4' ? item.rooms < 4 : item.rooms !== Number(val('filter-rooms'))))) return false;
      if (val('filter-condition') && !item.condition.includes(val('filter-condition'))) return false;
      if (val('filter-floor') === 'first' && item.floor === 1) return false;
      if (val('filter-floor') === 'last' && item.floor && item.floor === item.floors) return false;
      if ((document.getElementById('filter-verified') as HTMLInputElement).checked && item.status !== 'Проверено') return false;
      return !query || `${item.title} ${item.city} ${item.district} ${item.category} ${item.description}`.toLowerCase().includes(query);
    });
    const sort = val('sort-select');
    if (sort === 'price-asc') result.sort((a,b)=>a.price-b.price);
    if (sort === 'price-desc') result.sort((a,b)=>b.price-a.price);
    if (sort === 'newest') result.sort((a,b)=>b.date.localeCompare(a.date));
    const localListings = readStore<MapListing[]>('listings', []);
    const localMapResult = currentView === 'map' ? localListings.filter(item => {
      const price = Number(item.price) || 0;
      const area = Number(item.area) || 0;
      const rooms = Number(item.rooms) || 0;
      const floor = Number(item.floor) || 0;
      const floors = Number(item.floors) || 0;
      const city = val('filter-city');
      if (val('filter-deal') && item.deal !== val('filter-deal')) return false;
      if (category && item.category !== category) return false;
      if (city && item.city !== city && !(city === 'Другие города' && !cityOptions.includes(item.city || ''))) return false;
      if (val('filter-district') && !(item.district || '').toLowerCase().includes(val('filter-district').toLowerCase())) return false;
      if (val('filter-min') && price < Number(val('filter-min'))) return false;
      if (val('filter-max') && price > Number(val('filter-max'))) return false;
      if (val('filter-area-min') && area < Number(val('filter-area-min'))) return false;
      if (val('filter-area-max') && area > Number(val('filter-area-max'))) return false;
      if (val('filter-rooms') && (!rooms || (val('filter-rooms') === '4' ? rooms < 4 : rooms !== Number(val('filter-rooms'))))) return false;
      if (val('filter-condition') && !(item.condition || '').includes(val('filter-condition'))) return false;
      if (val('filter-floor') === 'first' && floor === 1) return false;
      if (val('filter-floor') === 'last' && floor && floors && floor === floors) return false;
      if ((document.getElementById('filter-verified') as HTMLInputElement).checked && item.status !== 'Проверено') return false;
      const query = val('catalog-query').trim().toLowerCase();
      return !query || `${item.title || ''} ${item.city || ''} ${item.district || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase().includes(query);
    }) : [];
    const visibleCount = result.length + localMapResult.length;
    document.getElementById('result-count')!.textContent = `${visibleCount} ${visibleCount === 1 ? 'объект' : 'объектов'}`;
    activeMap?.remove();
    activeMap = undefined;
    if (!result.length && !localMapResult.length) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('search',28)}</div><h3>По этим параметрам пока нет вариантов</h3><p>Измените пару условий — возможно, подходящий объект совсем рядом.</p><button class="btn btn-quiet" id="empty-reset">Сбросить фильтры</button></div>`; return; }
    if (currentView === 'map') {
      container.innerHTML = '<div id="catalog-property-map" class="map-canvas" aria-label="Объявления на карте OpenStreetMap"></div><p class="muted map-note" id="catalog-map-note"></p>';
      const mapResult = mountPropertyMap(container.querySelector<HTMLElement>('#catalog-property-map')!, [...result, ...localMapResult]);
      activeMap = mapResult.map;
      if (!mapResult.markerCount) {
        container.querySelector('#catalog-map-note')!.textContent = 'Для этих городов пока нет координат, поэтому отметки не показаны.';
      } else {
        const exactCount = mapResult.markerCount - mapResult.approximateCount;
        container.querySelector('#catalog-map-note')!.textContent = `Точные отметки: ${exactCount}; примерные отметки (центр города): ${mapResult.approximateCount}. Карта © OpenStreetMap.`;
      }
    } else {
      container.innerHTML = `<div class="card-grid ${currentView === 'list' ? 'list-view' : ''}">${result.map(item=>listingCard(item)).join('')}</div>`;
      if (currentView === 'list') (container.querySelector('.card-grid') as HTMLElement).style.gridTemplateColumns = '1fr';
    }
    container.querySelectorAll('.fade-up').forEach(card=>requestAnimationFrame(()=>card.classList.add('visible')));
  };
  controls.forEach(id => document.getElementById(id)?.addEventListener('input', update));
  controls.forEach(id => document.getElementById(id)?.addEventListener('change', update));
  document.getElementById('catalog-search')?.addEventListener('submit',event=>event.preventDefault());
  document.getElementById('clear-filters')?.addEventListener('click',()=>{ controls.forEach(id=>{const el=document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;if(el){if(el.type==='checkbox')(el as HTMLInputElement).checked=false;else el.value='';}}); update(); });
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>{currentView=button.dataset.view || 'grid';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===button));update();}));
  container.addEventListener('click',event=>{if(event.target instanceof Element && event.target.closest('#empty-reset'))(document.getElementById('clear-filters') as HTMLButtonElement).click();});
  update();
}
