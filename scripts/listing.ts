import { icon } from './icons';
import { money, toast } from './ui';
import { readStore, writeStore } from './store';
import { mountLocationPicker } from './maps';
import { applyPhoneValidation } from './phone';
import type { ListingDraft } from './types';

const steps=['Действие','Тип','Адрес','Детали','Цена','Фото','Описание','Контакт','Проверка','Готово'];
const blank=(): ListingDraft => ({deal:'',category:'',city:'Ташкент',district:'',address:'',area:'',rooms:'',floor:'',floors:'',condition:'Хорошее состояние',price:'',photos:[],title:'',description:'',name:'',phone:''});
const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const choices=(items,name,value)=>`<div class="choice-grid">${items.map(item=>`<label class="choice-card ${value===item.value?'selected':''}"><input type="radio" name="${name}" value="${item.value}" ${value===item.value?'checked':''}><span>${item.title}</span>${item.note?`<small>${item.note}</small>`:''}</label>`).join('')}</div>`;

function contentForStep(step,data) {
  if(step===0)return `<span class="eyebrow">Шаг 1 из 10</span><h2>Что вы хотите сделать?</h2><p class="muted" style="margin:9px 0 22px">Выберите формат объявления.</p>${choices([{value:'Продажа',title:'Продать',note:'Найти покупателя'},{value:'Аренда',title:'Сдать в аренду',note:'Долгосрочное размещение'},{value:'Посуточно',title:'Посуточная аренда',note:'Краткосрочная сдача'}],'deal',data.deal)}`;
  if(step===1)return `<span class="eyebrow">Шаг 2 из 10</span><h2>Какой это объект?</h2><p class="muted" style="margin:9px 0 22px">Тип недвижимости поможет показать объявление нужным людям.</p>${choices(['Квартира','Дом','Земля','Гараж','Коммерция','Офис','Склад'].map(item=>({value:item,title:item,note:item==='Земля'?'Участок под ваши планы':item==='Офис'?'Рабочее пространство':''})),'category',data.category)}`;
  if(step===2)return `<span class="eyebrow">Шаг 3 из 10</span><h2>Где находится объект?</h2><div class="form-grid" style="margin-top:22px"><div class="field"><label>Город</label><select name="city" required>${['Ташкент','Самарканд','Бухара','Андижан','Наманган','Фергана','Нукус','Другой город'].map(x=>`<option value="${e(x)}" ${data.city===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Район</label><input name="district" value="${e(data.district)}" required placeholder="Например, Мирабад"></div><div class="field address-search-field" style="grid-column:1/-1"><label>Адрес или ориентир</label><div class="address-search-row"><input name="address" value="${e(data.address)}" required placeholder="Улица, жилой комплекс или ближайший ориентир"><button class="btn btn-quiet" type="button" id="find-listing-address">${icon('search',16)} Найти на карте</button></div></div></div><div class="notice" style="margin-top:16px">Найдите адрес или нажмите на карту, чтобы поставить метку. Поиск отправляет адрес в OpenStreetMap для определения координат.</div><div class="location-picker-map" id="listing-location-map" aria-label="Выберите место объекта на OpenStreetMap"></div><div class="form-grid coordinate-fields"><div class="field"><label for="listing-lat">Широта</label><input id="listing-lat" name="lat" value="${e(data.lat||'')}" readonly></div><div class="field"><label for="listing-lng">Долгота</label><input id="listing-lng" name="lng" value="${e(data.lng||'')}" readonly></div></div>`;
  if(step===3)return `<span class="eyebrow">Шаг 4 из 10</span><h2>Добавьте характеристики.</h2><div class="form-grid" style="margin-top:22px"><div class="field"><label>Площадь, м²</label><input name="area" type="number" min="1" required value="${e(data.area)}" placeholder="Например, 85"></div>${['Квартира','Дом'].includes(data.category)?`<div class="field"><label>Количество комнат</label><input name="rooms" type="number" min="1" value="${e(data.rooms)}" placeholder="Например, 3"></div>`:''}${['Квартира','Офис'].includes(data.category)?`<div class="field"><label>Этаж</label><input name="floor" type="number" min="1" value="${e(data.floor)}" placeholder="Например, 5"></div><div class="field"><label>Этажность здания</label><input name="floors" type="number" min="1" value="${e(data.floors)}" placeholder="Например, 12"></div>`:''}${data.category==='Дом'?`<div class="field"><label>Площадь участка, м²</label><input name="plot" type="number" min="0" value="${e(data.plot||'')}" placeholder="Например, 400"></div>`:''}<div class="field"><label>Состояние</label><select name="condition">${['Хорошее состояние','Свежий ремонт','Дизайнерский ремонт','Под отделку','Новый','Рабочее состояние'].map(x=>`<option value="${e(x)}" ${data.condition===x?'selected':''}>${x}</option>`).join('')}</select></div></div>`;
  if(step===4)return `<span class="eyebrow">Шаг 5 из 10</span><h2>Какую цену вы рассматриваете?</h2><p class="muted" style="margin:9px 0 20px">Укажите сумму в долларах США. Это демонстрационное объявление.</p><div class="field" style="max-width:410px"><label>Стоимость, $</label><input name="price" type="number" min="1" required value="${e(data.price)}" placeholder="Например, 120 000"></div>${data.deal!=='Продажа'?'<p class="muted" style="font-size:.78rem;margin-top:10px">Для аренды укажите стоимость за месяц или сутки согласно выбранному типу.</p>':''}`;
  if(step===5)return `<span class="eyebrow">Шаг 6 из 10</span><h2>Покажите объект.</h2><p class="muted" style="margin:9px 0 18px">Добавьте фотографии и видео — первое медиа станет обложкой.</p><label class="upload-zone" for="listing-photos">${icon('camera',26)}<strong>Выберите фотографии или видео</strong><span>PNG, JPG, WebP, GIF · MP4, MOV или WebM до 10 МБ</span><input id="listing-photos" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm" multiple></label><div class="photo-preview-list" id="listing-photo-names">${(data.photos||[]).map(name=>`<span class="pill pill-neutral">${e(name)}</span>`).join('')}</div><p class="muted" style="font-size:.72rem;margin-top:12px">Видео до 10 МБ каждое; фотографии — до 15 МБ. Медиа появится в каталоге после публикации.</p>`;
  if(step===6)return `<span class="eyebrow">Шаг 7 из 10</span><h2>Расскажите о своём объекте.</h2><div class="field" style="margin-top:22px"><label>Заголовок объявления</label><input name="title" maxlength="80" required value="${e(data.title)}" placeholder="Например, Светлая квартира рядом с парком"></div><div class="field" style="margin-top:16px"><label>Описание</label><textarea name="description" minlength="20" required placeholder="Расскажите о планировке, состоянии, удобствах и важных деталях">${e(data.description)}</textarea><small class="muted">Минимум 20 символов, чтобы покупатели узнали главное.</small></div>`;
  if(step===7)return `<span class="eyebrow">Шаг 8 из 10</span><h2>Как с вами связаться?</h2><div class="form-grid" style="margin-top:22px"><div class="field"><label>Имя</label><input name="name" required value="${e(data.name)}" placeholder="Ваше имя"></div><div class="field"><label>Номер телефона</label><input name="phone" type="tel" required maxlength="18" value="${e(data.phone)}" placeholder="+998 90 123 45 67"></div></div><div class="notice" style="margin-top:16px">В прототипе контактные данные сохраняются только в локальном браузере.</div>`;
  if(step===8)return `<span class="eyebrow">Шаг 9 из 10</span><h2>Проверьте объявление.</h2><p class="muted" style="margin:9px 0 20px">Перед публикацией можно вернуться на любой предыдущий шаг.</p><article class="listing-preview"><div class="listing-preview-photo">${icon('home',34)}</div><div class="listing-preview-body"><span class="pill">${e(data.deal)} · ${e(data.category)}</span><h3>${e(data.title||'Заголовок объявления')}</h3><p class="muted">${e(data.city)}, ${e(data.district)} · ${e(data.area)} м²${data.rooms?` · ${e(data.rooms)} комн.`:''}</p><strong>${money(data.price)}</strong><p class="muted">${e(data.description)}</p><div class="tag-row">${data.photos?.length?data.photos.map(name=>`<span class="pill pill-neutral">${e(name)}</span>`).join(''):'<span class="pill pill-neutral">Фото не добавлены</span>'}</div><hr class="divider"><p><b>${e(data.name)}</b> · ${e(data.phone)}</p></div></article>`;
  return `<div class="publish-success"><div class="empty-icon">${icon('check',30)}</div><span class="eyebrow">Шаг 10 из 10</span><h2>Объявление размещено.</h2><p class="muted">Объявление опубликовано и появится в общем каталоге.</p><a class="btn btn-primary" href="./catalog.html" style="margin-top:20px">Открыть каталог</a><button class="btn btn-quiet" style="margin:20px 0 0 8px" id="new-listing">Создать ещё одно</button></div>`;
}

export function listingPage() {
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Разместить на Makon</span><h1>Хороший объект заслуживает внимания.</h1><p>Подготовьте объявление в несколько простых шагов.</p></header><div class="listing-builder" id="listing-builder"></div></div>`;
}

export function bindListing() {
  const mount=document.getElementById('listing-builder')!;
  let data=readStore<ListingDraft>('listingDraft',blank()); let step=Number(readStore('listingStep',0));
  let photoUrls: string[]=[];
  let mediaFiles: File[]=[];
  const saveFieldValues=()=>{
    const form=document.getElementById('listing-step-form') as HTMLFormElement | null; if(!form)return;
    const values=new FormData(form);
    for(const [key,value] of values.entries()) if(typeof value==='string')data[key]=value;
    const selected=form.querySelector<HTMLInputElement>('input[type="radio"]:checked'); if(selected)data[selected.name]=selected.value;
    writeStore('listingDraft',data);
  };
  const render=()=>{
    step=Math.max(0,Math.min(9,step));
    mount.innerHTML=`<div class="listing-progress"><div class="step-dots">${steps.map((label,i)=>`<span class="${i===step?'current':''}">${i+1}. ${label}</span>`).join('')}</div><div class="progress-track"><span style="width:${(step+1)*10}%"></span></div></div><form class="form-card listing-step" id="listing-step-form" novalidate>${contentForStep(step,data)}${step<9?`<div class="listing-actions">${step>0?'<button class="btn btn-quiet" type="button" id="listing-back">Назад</button>':'<a class="btn btn-quiet" href="./catalog.html">Сохранить на потом</a>'}<button class="btn btn-primary" type="button" id="listing-next">${step===8?'Опубликовать объявление':'Продолжить'} ${icon('arrow',16)}</button></div>`:''}</form>`;
    if(step===8&&photoUrls.length){const preview=mount.querySelector('.listing-preview-photo');const first=mediaFiles[0];preview.innerHTML=`${first?.type.startsWith('video/')?`<video src="${photoUrls[0]}" muted playsinline preload="metadata"></video>`:`<img src="${photoUrls[0]}" alt="Фото объекта">`}<span>${photoUrls.length} медиа</span>`;}
    const form=document.getElementById('listing-step-form') as HTMLFormElement;
    if(step===2){
      const locationMap=document.getElementById('listing-location-map')!;
      const cityField=form.elements.namedItem('city') as HTMLSelectElement;
      const picker=mountLocationPicker(locationMap,form,cityField.value,typeof data.lat==='string'?data.lat:'',typeof data.lng==='string'?data.lng:'',data.category);
      cityField.addEventListener('change',()=>picker.setCity(cityField.value));
      document.getElementById('find-listing-address')!.addEventListener('click',async event=>{
        const button=event.currentTarget as HTMLButtonElement;
        const address=(form.elements.namedItem('address') as HTMLInputElement).value.trim();
        const city=cityField.value==='Другой город'?'':cityField.value;
        const query=[address,(form.elements.namedItem('district') as HTMLInputElement).value,city].filter(Boolean).join(', ');
        if(!address){toast('Сначала укажите адрес или ориентир.');return;}
        button.disabled=true;
        try{
          const response=await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
          const result=await response.json() as {lat?:number;lng?:number;error?:string};
          if(!response.ok||!Number.isFinite(result.lat)||!Number.isFinite(result.lng)){toast(result.error||'Не удалось найти этот адрес.');return;}
          picker.setLocation(result.lat!,result.lng!);
          toast('Адрес найден, отметка установлена на карте.');
        }catch(error){
          toast(error instanceof Error?`Ошибка поиска адреса: ${error.message}`:'Не удалось выполнить поиск адреса.');
        }finally{
          button.disabled=false;
        }
      });
    }
    if(step===7)applyPhoneValidation(form.elements.namedItem('phone') as HTMLInputElement);
    form.addEventListener('input',saveFieldValues);form.addEventListener('change',saveFieldValues);
    form.querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{saveFieldValues();render();}));
    document.getElementById('listing-back')?.addEventListener('click',()=>{saveFieldValues();step--;writeStore('listingStep',step);render();});
    document.getElementById('listing-next')?.addEventListener('click',async()=>{
      saveFieldValues();
      if(step!==5&&!form.reportValidity())return;
      if(step===0&&!data.deal){toast('Выберите тип размещения, чтобы продолжить.');return;}
      if(step===1&&!data.category){toast('Выберите тип недвижимости.');return;}
      if(step===2&&(!data.lat||!data.lng)){toast('Укажите точку объекта на карте.');return;}
      if(step===8){
        const button=document.getElementById('listing-next') as HTMLButtonElement;
        button.disabled=true;
        try{
          let response: Response;
          if(__VERCEL__){
            const extensions:Record<string,string>={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','image/gif':'.gif','video/mp4':'.mp4','video/quicktime':'.mov','video/webm':'.webm'};
            const {upload}=await import('@vercel/blob/client');
            const uploads=await Promise.all(mediaFiles.map(file=>upload(`listing-media/${crypto.randomUUID()}${extensions[file.type]}`,file,{access:'public',handleUploadUrl:'/api/upload-token'})));
            response=await fetch('/api/listings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,photos:uploads.map(file=>file.url)})});
          }else{
            const payload=new FormData();
            payload.append('listing',JSON.stringify(data));
            mediaFiles.forEach(file=>payload.append('media',file,file.name));
            response=await fetch('/api/listings',{method:'POST',body:payload});
          }
          const result=await response.json() as {id?:string;date?:string;photos?:string[];error?:string};
          if(!response.ok){toast(result.error||'Не удалось опубликовать объявление.');button.disabled=false;return;}
          const previous=readStore<Record<string,unknown>[]>('listings',[]);
          if(!writeStore('listings',[{...data,id:result.id,date:result.date,photos:result.photos||[],status:'Новое объявление'},...previous])){
            toast('Объявление опубликовано, но не удалось обновить список в личном кабинете.');
          }
          photoUrls.forEach(url=>URL.revokeObjectURL(url));
          photoUrls=[];
          writeStore('listingStep',9);step=9;render();return;
        }catch(error){
          toast(error instanceof Error?`Ошибка публикации: ${error.message}`:'Не удалось опубликовать объявление.');
          button.disabled=false;
          return;
        }
      }
      step++;writeStore('listingStep',step);render();
    });
    document.getElementById('listing-photos')?.addEventListener('change',event=>{
      const input=event.currentTarget as HTMLInputElement;
      const files=Array.from(input.files||[]);
      const supportedTypes=new Set(['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/quicktime','video/webm']);
      if(files.length>10||files.some(file=>!supportedTypes.has(file.type))){toast('Выберите не более 10 фото или видео поддерживаемого формата.');input.value='';return;}
      const invalid=files.find(file=>file.type.startsWith('video/')?file.size>10*1024*1024:file.size>15*1024*1024);
      if(invalid){toast(invalid.type.startsWith('video/')?'Размер видео не должен превышать 10 МБ.':'Размер фотографии не должен превышать 15 МБ.');input.value='';return;}
      photoUrls.forEach(url=>URL.revokeObjectURL(url));
      mediaFiles=files;
      photoUrls=files.map(file=>URL.createObjectURL(file));
      data.photos=files.map(file=>file.name);
      writeStore('listingDraft',data);
      document.getElementById('listing-photo-names')!.innerHTML=files.map((file,index)=>`<span class="listing-photo-thumb">${file.type.startsWith('video/')?`<video src="${photoUrls[index]}" muted playsinline preload="metadata"></video>`:`<img src="${photoUrls[index]}" alt="Предпросмотр ${e(file.name)}">`}<small>${e(file.name)}</small></span>`).join('');
    });
    document.getElementById('new-listing')?.addEventListener('click',()=>{photoUrls.forEach(url=>URL.revokeObjectURL(url));photoUrls=[];mediaFiles=[];data=blank();step=0;writeStore('listingDraft',data);writeStore('listingStep',step);render();});
  };
  render();
}
