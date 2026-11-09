import { icon } from './icons';
import { imageView, listingCard, money, priceLabel } from './ui';
import { readStore } from './store';
import type { Property } from './types';

export function propertyPage(item: Property | undefined, properties: Property[]) {
  if (!item) return `<div class="container section"><div class="empty-state"><div class="empty-icon">${icon('home',28)}</div><h2>Объявление не найдено</h2><p>Возможно, ссылка устарела. Посмотрите другие объекты в каталоге.</p><a class="btn btn-primary" href="./catalog.html">Открыть каталог</a></div></div>`;
  const photos = item.photos || [];
  const related = properties.filter(other => other.id !== item.id && (other.city === item.city || other.category === item.category)).slice(0,3);
  const saved = readStore('favorites', []).includes(item.id);
  const compared = readStore('compare', []).includes(item.id);
  const priceSqm = money(Math.round(item.price / item.area));
  const dateLocale = document.documentElement.lang || 'ru-RU';
  return `<div class="container"><div class="property-page-head"><a class="muted" href="./catalog.html" style="font-size:.8rem">Каталог <span aria-hidden="true">/</span> ${item.city}</a><h1>${item.title}</h1><div class="inline" style="flex-wrap:wrap;color:var(--muted);font-size:.83rem">${icon('pin',16)} ${item.address}, ${item.district}, ${item.city}<span class="pill">${item.status}</span></div></div>
  <div class="gallery-grid" id="property-gallery">${photos.slice(0,4).map((src,i)=>`<button type="button" data-gallery-index="${i}" aria-label="Посмотреть фотографию ${i+1}">${imageView(src,`${item.title} — фото ${i+1}`)}</button>`).join('')}<button type="button" class="gallery-more btn btn-light" data-gallery-index="0">${icon('camera',16)} Смотреть фото</button></div>
  <div class="property-detail-layout"><div class="property-details">
    <section class="detail-section"><div class="inline" style="justify-content:space-between;align-items:flex-start"><div><span class="eyebrow">${item.deal} · ${item.category}</span><h2 style="margin-top:9px">${item.city}, ${item.district}</h2><p class="muted">Опубликовано ${new Date(`${item.date}T12:00:00`).toLocaleDateString(dateLocale,{day:'numeric',month:'long',year:'numeric'})}</p></div><div class="inline"><button class="btn btn-quiet btn-small ${saved?'is-saved':''}" data-action="favorite" data-id="${item.id}">${icon('heart',17)} ${saved?'Сохранено':'В избранное'}</button><button class="btn btn-quiet btn-small ${compared?'active':''}" data-action="compare" data-id="${item.id}">${icon('compare',17)} Сравнить</button></div></div></section>
    <section class="detail-section"><h2>Главное об объекте</h2><div class="detail-feature-grid"><div class="detail-feature">${icon('area')} <span>${item.area} м² общей площади</span></div>${item.rooms?`<div class="detail-feature">${icon('bed')} <span>${item.rooms} комнаты</span></div>`:''}${item.floor?`<div class="detail-feature">${icon('building')} <span>${item.floor}${item.floors?` из ${item.floors}`:''} этаж</span></div>`:''}<div class="detail-feature">${icon('chart')} <span>${priceSqm} за м²</span></div><div class="detail-feature">${icon('shield')} <span>${item.condition}</span></div><div class="detail-feature">${icon('pin')} <span>${item.district}, ${item.city}</span></div></div></section>
    <section class="detail-section"><h2>Об объекте</h2><p class="muted" style="line-height:1.8">${item.description}</p></section>
    <section class="detail-section"><h2>Характеристики</h2><div class="tag-row">${(item.features || []).map(feature=>`<span class="pill pill-neutral">${feature}</span>`).join('')}</div></section>
    <section class="detail-section"><h2>Расположение</h2><div class="map-preview" style="height:250px"><span class="map-pin" style="left:47%;top:44%">${icon('pin',15)} ${item.district}</span></div><p class="muted" style="margin-top:10px;font-size:.76rem">Положение на карте показано схематично для демонстрации.</p></section>
  </div>
  <aside class="contact-card"><div class="price">${priceLabel(item)}</div><div class="price-note">≈ ${priceSqm} / м² · цена объявления</div><hr class="divider"><div class="contact-person"><div class="contact-avatar">${item.contact.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>${item.contact.name}</b><small>${item.contact.role}</small></div></div><a class="btn btn-primary btn-block" href="tel:${item.contact.phone.replaceAll(' ','')}">${icon('phone',17)} Позвонить</a><button class="btn btn-quiet btn-block" type="button" style="margin-top:9px" data-action="message" data-id="${item.id}">${icon('message',17)} Написать сообщение</button><p class="muted" style="font-size:.69rem;margin-top:14px;text-align:center">Демонстрационный контакт. Не отправляйте личные данные.</p></aside></div></div>
  ${related.length?`<section class="section"><div class="container">${'<div class="section-head"><div><span class="eyebrow">Рядом с вашим выбором</span><h2>Похожие предложения</h2></div></div>'}<div class="card-grid">${related.map(other=>listingCard(other)).join('')}</div></div></section>`:''}
  <div id="lightbox-root"></div>`;
}

export function bindProperty(item: Property | undefined) {
  const gallery = document.getElementById('property-gallery');
  if (!gallery || !item) return;
  gallery.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-gallery-index]');
    if (!button) return;
    const index = Number(button.dataset.galleryIndex);
    document.getElementById('lightbox-root').innerHTML = `<div class="lightbox" role="dialog" aria-modal="true" aria-label="Фотографии объекта"><button type="button" aria-label="Закрыть" data-lightbox-close>×</button>${imageView(item.photos[index],item.title,'lightbox-crop')}</div>`;
  });
  document.getElementById('lightbox-root')!.addEventListener('click',event=>{if(event.target instanceof Element && (event.target.closest('[data-lightbox-close]')||event.target.classList.contains('lightbox')))(event.currentTarget as HTMLElement).innerHTML='';});
}
