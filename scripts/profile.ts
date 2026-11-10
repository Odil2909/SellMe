import { icon } from './icons';
import { money, listingCard, toast } from './ui';
import { readStore, writeStore } from './store';
import type { Property } from './types';
import { applyPhoneValidation } from './phone';

const sections=[['overview','Обзор','chart'],['personal','Мой профиль','user'],['listings','Мои объявления','building'],['favorites','Избранное','heart'],['valuations','Мои оценки','trend'],['collections','Мои подборки','sparkle'],['messages','Сообщения','message'],['settings','Настройки','filter']];
const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

export function profilePage() {
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Ваше пространство</span><h1>Личный кабинет</h1><p>Демонстрационный профиль — данные хранятся в этом браузере.</p></header><div class="dashboard-layout"><nav class="dashboard-nav" id="dashboard-nav" aria-label="Разделы кабинета">${sections.map(([id,label,ico],i)=>`<a href="#${id}" data-section="${id}" class="${i===0?'active':''}">${icon(ico,17)} ${label}${id==='messages'?'<span class="pill" style="margin-left:auto">2</span>':''}</a>`).join('')}</nav><section id="dashboard-content"></section></div></div>`;
}

export function bindProfile(properties: Property[]) {
  const content=document.getElementById('dashboard-content');
  const nav=document.getElementById('dashboard-nav');
  const getProfile=()=>readStore('profile',{name:'Гость Makon',email:'guest@makon.uz',phone:'+998 90 000 00 00',avatar:''});
  const render=(section='overview')=>{
    nav.querySelectorAll<HTMLAnchorElement>('[data-section]').forEach(link=>link.classList.toggle('active',link.dataset.section===section));
    const user=getProfile(), listings=readStore('listings',[]), valuations=readStore('valuations',[]), favorites=readStore('favorites',[]);
    const initials=e(user.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase());
    const avatarMarkup=user.avatar?`<img class="profile-avatar-image" src="${e(user.avatar)}" alt="Аватар профиля">`:initials;
    if(section==='overview')content.innerHTML=`<div class="surface-card"><div class="profile-card"><div class="profile-avatar">${avatarMarkup}</div><div><span class="eyebrow">Рады видеть</span><h2 style="font-size:1.7rem;margin-top:5px">${e(user.name)}</h2><p class="muted">${e(user.email)} · Демо-аккаунт</p></div></div></div><div class="metric-grid" style="margin-top:15px"><div class="metric-card"><small>Мои объявления</small><strong>${listings.length}</strong></div><div class="metric-card"><small>Избранное</small><strong>${favorites.length}</strong></div><div class="metric-card"><small>Оценки</small><strong>${valuations.length}</strong></div></div><div class="surface-card" style="margin-top:15px"><div class="inline" style="justify-content:space-between"><div><span class="eyebrow">Быстрый доступ</span><h3 style="margin-top:7px">Что будем делать сегодня?</h3></div></div><div class="tag-row" style="margin-top:20px"><a class="btn btn-quiet btn-small" href="./create-listing.html">${icon('plus',15)} Добавить объявление</a><a class="btn btn-quiet btn-small" href="./valuation.html">${icon('chart',15)} Оценить объект</a><a class="btn btn-quiet btn-small" href="./favorites.html">${icon('heart',15)} Избранное</a></div></div><div class="notice" style="margin-top:15px">Makon не использует регистрацию в этой версии. Все пользовательские данные остаются в localStorage браузера.</div>`;
    if(section==='personal')content.innerHTML=`<div class="surface-card"><span class="eyebrow">Личные данные</span><h2 style="font-size:1.5rem;margin:8px 0 20px">Профиль</h2><form id="profile-form" class="form-grid"><div class="field"><label>Имя</label><input name="name" required value="${e(user.name)}"></div><div class="field"><label>Email</label><input name="email" type="email" required value="${e(user.email)}"></div><div class="field"><label>Телефон</label><input name="phone" type="tel" maxlength="18" value="${e(user.phone)}"></div><div class="avatar-editor"><div class="profile-avatar">${avatarMarkup}</div><div class="avatar-actions"><label class="field-label" for="avatar-file">Фото профиля</label><input id="avatar-file" type="file" accept="image/*"><div class="avatar-url-row"><input class="input" id="avatar-url" type="url" placeholder="https://example.com/avatar.jpg" value="${e(user.avatar?.startsWith('http')?user.avatar:'')}"><button class="btn btn-quiet btn-small" type="button" id="avatar-url-apply">Сохранить URL</button></div><small class="muted">Файл хранится в браузере в сжатом виде. Пароль здесь не хранится.</small></div></div><div style="align-self:end"><button class="btn btn-primary" type="submit">Сохранить изменения</button></div></form><div class="notice" style="margin-top:20px">Профиль сохранится локально на этом устройстве.</div></div>`;
    if(section==='listings')content.innerHTML=`<div class="surface-card"><div class="section-head" style="margin-bottom:18px"><div><span class="eyebrow">Активность</span><h2 style="font-size:1.5rem;margin-top:7px">Мои объявления</h2></div><a class="btn btn-primary btn-small" href="./create-listing.html">${icon('plus',15)} Разместить</a></div>${listings.length?`<div class="local-list">${listings.map(item=>`<article class="local-list-row"><div class="listing-row-icon">${icon('home',19)}</div><div><b>${e(item.title)}</b><p class="muted">${e(item.category)} · ${e(item.city)}, ${e(item.district)} · ${e(item.area)} м²</p></div><strong>${money(item.price)}</strong><span class="pill">${e(item.status||'Сохранено локально')}</span></article>`).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${icon('building',26)}</div><h3>Объявлений пока нет</h3><p>Добавьте объект — после публикации он появится в общем каталоге.</p><a class="btn btn-primary" href="./create-listing.html">Создать объявление</a></div>`}</div>`;
    if(section==='favorites')content.innerHTML=`<div class="surface-card"><span class="eyebrow">Сохранённые объекты</span><h2 style="font-size:1.5rem;margin:8px 0 18px">Избранное</h2><a class="btn btn-quiet btn-small" href="./favorites.html">Открыть страницу избранного ${icon('arrow',15)}</a><p class="muted" style="margin-top:15px">${favorites.length} сохранённых ${favorites.length===1?'объект':'объекта'}.</p>${favorites.length?`<div class="card-grid" style="margin-top:19px">${favorites.map(id=>properties.find(item=>item.id===id)).filter(Boolean).slice(0,3).map(item=>listingCard(item,{compare:false})).join('')}</div>`:''}</div>`;
    if(section==='valuations')content.innerHTML=`<div class="surface-card"><span class="eyebrow">История расчётов</span><h2 style="font-size:1.5rem;margin:8px 0 18px">Мои оценки</h2>${valuations.length?`<div class="local-list">${valuations.map(item=>`<article class="local-list-row"><div class="listing-row-icon">${icon('chart',19)}</div><div><b>${e(item.category)} · ${e(item.city)}</b><p class="muted">${e(item.area)} м² · ${e(item.district)}</p></div><strong>${money(item.estimate)}</strong><span class="pill pill-neutral">Демо</span></article>`).join('')}</div>`:`<div class="empty-state"><div class="empty-icon">${icon('chart',26)}</div><h3>Оценок пока нет</h3><p>Попробуйте оценить объект и вернитесь к истории позже.</p><a class="btn btn-primary" href="./valuation.html">Оценить недвижимость</a></div>`}</div>`;
    if(section==='collections'){const picks=properties.filter(item=>item.city==='Ташкент'&&['Квартира','Дом'].includes(item.category)).slice(0,2);content.innerHTML=`<div class="surface-card"><span class="eyebrow">Мои подборки</span><h2 style="font-size:1.5rem;margin:8px 0 18px">Сохранённые поиски</h2><div class="surface-card" style="background:#f7faf7"><div class="inline" style="justify-content:space-between"><div><span class="pill">Демо-подборка</span><h3 style="margin-top:12px">Первый дом в Ташкенте</h3><p class="muted" style="font-size:.78rem;margin-top:5px">Квартиры и дома · 2 варианта · обновлено недавно</p></div>${icon('sparkle',22)}</div><div class="card-grid" style="margin-top:18px">${picks.map(item=>listingCard(item,{compare:false})).join('')}</div></div><a class="btn btn-quiet btn-small" href="./ai-search.html" style="margin-top:16px">Собрать свой подбор ${icon('arrow',15)}</a></div>`;}
    if(section==='messages')content.innerHTML=`<div class="surface-card"><span class="eyebrow">Переписка</span><h2 style="font-size:1.5rem;margin:8px 0 18px">Сообщения</h2><div class="message-thread"><div class="contact-avatar">МК</div><div><b>Мадина Каримова</b><p class="muted">По объявлению «Светлая квартира с видом на город»</p><small>Здравствуйте! Когда удобно посмотреть объект?</small></div><span class="pill">Демо</span></div><div class="message-thread"><div class="contact-avatar">АН</div><div><b>Азиз Рахимов</b><p class="muted">По объявлению «Дом с тихим садом и террасой»</p><small>Спасибо, отправил дополнительную информацию.</small></div><span class="pill pill-neutral">Прочитано</span></div><div class="notice" style="margin-top:20px">Сообщения представлены как примеры интерфейса; отправка пока не подключена.</div></div>`;
    if(section==='settings'){const settings=readStore('settings',{notifications:false,saveSearch:false});content.innerHTML=`<div class="surface-card"><span class="eyebrow">Предпочтения</span><h2 style="font-size:1.5rem;margin:8px 0 20px">Настройки</h2><form id="settings-form"><label class="setting-row"><span><b>Уведомления о новых объектах</b><small>Показывать новые варианты в интерфейсе</small></span><input name="notifications" type="checkbox" ${settings.notifications?'checked':''}></label><label class="setting-row"><span><b>Сохранять поисковые фильтры</b><small>Оставлять параметры каталога на этом устройстве</small></span><input name="saveSearch" type="checkbox" ${settings.saveSearch?'checked':''}></label><button class="btn btn-primary" type="submit" style="margin-top:20px">Сохранить настройки</button></form><div class="notice" style="margin-top:20px">Тема и уведомления сервера недоступны в демонстрационной версии.</div></div>`;}
    const phoneInput=content.querySelector<HTMLInputElement>('#profile-form input[name="phone"]');
    if(phoneInput)applyPhoneValidation(phoneInput);
  };
  nav.addEventListener('click',event=>{if(!(event.target instanceof Element))return;const link=event.target.closest<HTMLAnchorElement>('[data-section]');if(!link)return;event.preventDefault();render(link.dataset.section);history.replaceState(null,'',`#${link.dataset.section}`);});
  const saveAvatar=(avatar:string)=>{
    const profile={...getProfile(),avatar};
    if(!writeStore('profile',profile)){toast('Не удалось сохранить фото. Попробуйте изображение меньшего размера.');return false;}
    render('personal');
    toast('Фото профиля сохранено.');
    return true;
  };
  const compressAvatar=(file:File)=>new Promise<string>((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Не удалось прочитать файл.'));
    reader.onload=()=>{
      const image=new Image();
      image.onerror=()=>reject(new Error('Файл не является поддерживаемым изображением.'));
      image.onload=()=>{
        const scale=Math.min(1,256/Math.max(image.naturalWidth,image.naturalHeight));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const context=canvas.getContext('2d');
        if(!context){reject(new Error('Браузер не смог обработать это изображение.'));return;}
        context.drawImage(image,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',.78));
      };
      image.src=String(reader.result);
    };
    reader.readAsDataURL(file);
  });
  content.addEventListener('change',event=>{
    if(!(event.target instanceof HTMLInputElement)||event.target.id!=='avatar-file')return;
    const file=event.target.files?.[0];
    if(!file)return;
    compressAvatar(file).then(saveAvatar).catch((error:unknown)=>toast(error instanceof Error?error.message:String(error)));
  });
  content.addEventListener('click',event=>{
    if(!(event.target instanceof Element)||!event.target.closest('#avatar-url-apply'))return;
    const field=document.getElementById('avatar-url') as HTMLInputElement;
    try{
      const url=new URL(field.value);
      if(!['http:','https:'].includes(url.protocol))throw new Error('URL должен начинаться с http:// или https://.');
      saveAvatar(url.href);
    }catch(error){toast(error instanceof Error&&error.message.includes('http')?error.message:'Введите корректный URL изображения.');}
  });
  content.addEventListener('submit',event=>{event.preventDefault();if(!(event.target instanceof HTMLFormElement))return;const form=event.target;if(form.id==='profile-form'){if(!form.reportValidity())return;const previous=getProfile();const profileFields=Object.fromEntries(Array.from(new FormData(form).entries()).filter(([,value])=>typeof value==='string').map(([key,value])=>[key,String(value)]));const next={...previous,...profileFields};if(!writeStore('profile',next)){toast('Не удалось сохранить профиль в браузере.');return;}render('personal');toast('Профиль сохранён на этом устройстве.');}if(form.id==='settings-form'){writeStore('settings',{notifications:(form.elements.namedItem('notifications') as HTMLInputElement).checked,saveSearch:(form.elements.namedItem('saveSearch') as HTMLInputElement).checked});render('settings');toast('Настройки сохранены.');}});
  render(sections.some(([id])=>id===location.hash.slice(1))?location.hash.slice(1):'overview');
}
