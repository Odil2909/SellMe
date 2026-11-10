import { icon } from './icons';
import { escapeHtml, imageView, listingCard, sectionTitle } from './ui';
import type { Property } from './types';

const categoryData = [
  ['Квартиры', 'Квартира', 'assets/images/property-contact-sheet.jpg#tile-1'],
  ['Дома', 'Дом', 'assets/images/property-contact-sheet.jpg#tile-4'],
  ['Участки', 'Земля', 'assets/images/property-contact-sheet.jpg#tile-7'],
  ['Гаражи', 'Гараж', 'assets/images/property-contact-sheet.jpg#tile-8'],
  ['Коммерция', 'Коммерция', 'assets/images/property-contact-sheet.jpg#tile-10'],
  ['Офисы', 'Офис', 'assets/images/property-contact-sheet.jpg#tile-11'],
  ['Склады', 'Склад', 'assets/images/property-contact-sheet.jpg#tile-13']
];
const cities = [
  ['Ташкент', 'Столица возможностей', 'assets/images/property-contact-sheet.jpg#tile-22'],
  ['Самарканд', 'История и новый ритм', 'assets/images/property-contact-sheet.jpg#tile-18'],
  ['Бухара', 'Город с характером', 'assets/images/property-contact-sheet.jpg#tile-24'],
  ['Фергана', 'Зелёная долина', 'assets/images/property-contact-sheet.jpg#tile-5'],
  ['Андижан', 'Город у подножия гор', 'assets/images/property-contact-sheet.jpg#tile-19']
];
const offerCount = count => {
  const last=count%10,lastTwo=count%100;
  if(last===1&&lastTwo!==11)return `${count} объявление`;
  if(last>=2&&last<=4&&(lastTwo<12||lastTwo>14))return `${count} объявления`;
  return `${count} объявлений`;
};

export function homePage(properties: Property[]) {
  const hero = properties[0];
  const cityCount = new Set(properties.map(item => item.city)).size;
  const cards = properties.slice(0, 6);
  return `<section class="hero"><div class="container"><div class="hero-layout">
    <div class="hero-copy"><span class="hero-kicker">${icon('sparkle',15)} Недвижимость с умным подходом</span><h1>Найдите место,<br>которое станет <span>вашим.</span></h1><p>Покупайте, продавайте и арендуйте. Оценивайте недвижимость и находите свой вариант по-настоящему удобно.</p>
    <div class="hero-stats"><div class="hero-stat"><strong>${properties.length}</strong><small>объявлений в каталоге</small></div><div class="hero-stat"><strong>${cityCount} городов</strong><small>по всему Узбекистану</small></div><div class="hero-stat"><strong>Ваш выбор</strong><small>без лишней суеты</small></div></div>
    </div><div class="hero-media"><div class="hero-main-image">${hero?imageView(hero.photos?.[0]||'',hero.title):`<div class="property-image-placeholder">${icon('home',54)}<span>Здесь появятся объявления владельцев</span></div>`}<div class="hero-image-shade"></div>${hero?`<div class="hero-caption"><strong>${escapeHtml(hero.title)}</strong><span>${escapeHtml(hero.city)}, ${escapeHtml(hero.district)} · ${hero.area} м²</span></div>`:''}</div>
      <div class="hero-float rating"><div class="avatar">${icon('shield',19)}</div><div><b>Подбор с заботой</b><small>Объявления владельцев</small></div></div><div class="hero-float insight"><small>Местоположение</small><strong>На интерактивной карте</strong><small>для каждого объявления</small></div>
    </div></div>
    <div class="hero-search"><form class="search-box" id="home-search"><div class="search-tabs" role="tablist"><button type="button" class="search-tab active" data-deal="Продажа">Купить</button><button type="button" class="search-tab" data-deal="Аренда">Арендовать</button><button type="button" class="search-tab" data-deal="Посуточно">Посуточно</button></div><input type="hidden" name="deal" value="Продажа"><div class="search-fields">
      <div class="field search-field-icon"><label for="home-city">Город</label>${icon('pin',16)}<input id="home-city" name="city" placeholder="Например, Ташкент" list="city-options"><datalist id="city-options">${['Ташкент','Самарканд','Бухара','Андижан','Наманган','Фергана','Нукус'].map(city=>`<option value="${city}">${city}</option>`).join('')}</datalist></div>
      <div class="field"><label for="home-district">Район</label><input id="home-district" name="district" placeholder="Любой район"></div>
      <div class="field"><label for="home-category">Тип объекта</label><select id="home-category" name="category"><option value="">Любой</option>${['Квартира','Дом','Земля','Гараж','Коммерция','Офис','Склад'].map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
      <div class="field"><label for="home-min">Цена от, $</label><input id="home-min" name="min" type="number" min="0" placeholder="Любая"></div><div class="field"><label for="home-max">Цена до, $</label><input id="home-max" name="max" type="number" min="0" placeholder="Любая"></div>
      <button class="btn btn-primary" type="submit">${icon('search',17)} Найти</button>
    </div></form></div>
  </div></section>

  <section class="section"><div class="container">${sectionTitle('Выберите направление','Найдите свой формат','Для первого дома, новых планов, бизнеса или инвестиций.')}
    <div class="category-grid">${categoryData.map(([name,key,img])=>{const count=properties.filter(item=>item.category===key).length;return `<a class="category-tile" href="./pages/catalog.html?category=${encodeURIComponent(key)}">${imageView(img,name)}<span>${name}<small>${offerCount(count)}</small></span></a>`;}).join('')}</div>
  </div></section>

  <section class="section section-tint"><div class="container">${sectionTitle('Объявления владельцев','Найдите свой следующий адрес.','Актуальные объекты, добавленные пользователями Makon.')}
    ${cards.length?`<div class="card-grid">${cards.map(item=>listingCard(item)).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${icon('home',28)}</div><h3>Пока нет объявлений</h3><p>Разместите первое объявление — оно появится в общем каталоге.</p><a class="btn btn-primary" href="./pages/create-listing.html">Разместить объявление</a></div>`}<div style="text-align:center;margin-top:27px"><a class="btn btn-quiet" href="./pages/catalog.html">Смотреть каталог ${icon('arrow',16)}</a></div>
  </div></section>

  <section class="section"><div class="container"><div class="ai-banner"><div class="ai-banner-copy"><span class="eyebrow">Makon estimate</span><h2>Узнайте, сколько может стоить ваша недвижимость.</h2><p>Ориентировочная стоимость по характеристикам объекта.</p><a class="btn btn-light" href="./pages/valuation.html">Оценить объект ${icon('arrow',16)}</a></div><div class="ai-banner-art">${imageView('assets/images/property-contact-sheet.jpg#tile-4','Фасад современного дома')}</div></div></div></section>

  <section class="section"><div class="container">${sectionTitle('Города Узбекистана','Где бы вы хотели жить?','Выбирайте привычный темп или откройте для себя новый город.')}
    <div class="city-grid">${cities.map(([name,note,img])=>`<a class="city-tile" href="./pages/catalog.html?city=${encodeURIComponent(name)}">${imageView(img,name)}<div><strong>${name}</strong><small>${note}</small></div></a>`).join('')}</div>
  </div></section>

  <section class="section section-tint"><div class="container">${sectionTitle('Почему Makon','Весь путь — в одном месте','Удобные инструменты, чтобы принимать решения с большим спокойствием.')}
    <div class="benefit-grid"><article class="benefit"><div class="benefit-icon">${icon('sparkle')}</div><h3>Поиск под ваш ритм</h3><p>Сформулируйте пожелания простыми словами — подбор поможет сузить выбор.</p></article><article class="benefit"><div class="benefit-icon">${icon('chart')}</div><h3>Ориентир по стоимости</h3><p>Получите демонстрационную оценку по ключевым характеристикам объекта.</p></article><article class="benefit"><div class="benefit-icon">${icon('shield')}</div><h3>Детали под рукой</h3><p>Сравнивайте параметры, сохраняйте варианты и возвращайтесь к ним позже.</p></article><article class="benefit"><div class="benefit-icon">${icon('clock')}</div><h3>Меньше лишних шагов</h3><p>Каталог, оценка и публикация объявления собраны в едином пространстве.</p></article></div>
  </div></section>`;
}

export function bindHome() {
  document.querySelectorAll<HTMLButtonElement>('.search-tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.search-tab').forEach(tab => tab.classList.toggle('active', tab === button));
    (document.querySelector('#home-search [name="deal"]') as HTMLInputElement).value = button.dataset.deal || '';
  }));
  const form = document.querySelector<HTMLFormElement>('#home-search');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => params.append(key, String(value)));
    window.location.href = `./pages/catalog.html?${params}`;
  });
}
