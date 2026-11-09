import { icon } from './icons';
import { money } from './ui';
import { readStore, writeStore } from './store';
import type { Property } from './types';

const categoryFields = {
  'Квартира': [['rooms','Количество комнат','number','1'],['floor','Этаж','number','2'],['floors','Этажность дома','number','5'],['renovation','Ремонт','select','']],
  'Дом': [['rooms','Количество комнат','number','3'],['stories','Этажность','number','1'],['plot','Площадь участка, м²','number',''],['utilities','Коммуникации','text','']],
  'Земля': [['purpose','Назначение участка','select',''],['utilities','Коммуникации','text','']],
  'Гараж': [['garageType','Тип гаража','select',''],['location','Расположение','select','']],
  'Коммерция': [['purpose','Назначение','text',''],['windows','Витринные окна','select','']],
  'Офис': [['floor','Этаж','number','1'],['buildingClass','Класс здания','select','']],
  'Склад': [['ceiling','Высота потолка, м','number','4'],['loading','Погрузочная зона','select','']],
  'Другая недвижимость': [['purpose','Тип объекта','text','']]
};
const categoryOptions = Object.keys(categoryFields);
const cityRates = { 'Ташкент':1, 'Самарканд':.72, 'Бухара':.62, 'Фергана':.58, 'Наманган':.55, 'Андижан':.55, 'Нукус':.48 };

const fieldMarkup = ([name,label,type]) => {
  if (type === 'select') {
    const options = name === 'renovation' ? ['Без отделки','Хорошее состояние','Свежий ремонт','Дизайнерский ремонт']
      : name === 'purpose' ? ['Жилое строительство','Коммерческое использование','Сельское хозяйство']
      : name === 'garageType' ? ['Капитальный','Подземный паркинг','Открытое место']
      : name === 'location' ? ['В жилом районе','В паркинге','Гаражный кооператив']
      : name === 'buildingClass' ? ['Стандарт','Бизнес','Премиум']
      : name === 'windows' ? ['Есть','Нет'] : ['Есть','Нет'];
    return `<div class="field"><label for="v-${name}">${label}</label><select id="v-${name}" name="${name}"><option value="">Выберите</option>${options.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>`;
  }
  return `<div class="field"><label for="v-${name}">${label}</label><input id="v-${name}" name="${name}" type="${type}" ${type==='number'?'min="0"':''} placeholder="${type==='number'?'Укажите значение':'Например, подключены'}"></div>`;
};

export function valuationPage() {
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Makon estimate</span><h1>Ориентир для важных решений.</h1><p>Добавьте основные характеристики, чтобы получить предварительный расчёт стоимости.</p></header>
  <div class="property-detail-layout" style="margin-top:0"><section><form class="form-card" id="valuation-form" novalidate><div class="form-grid">
    <div class="field"><label for="v-category">Тип недвижимости</label><select id="v-category" name="category" required>${categoryOptions.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
    <div class="field"><label for="v-city">Город</label><select id="v-city" name="city" required>${Object.keys(cityRates).map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div>
    <div class="field"><label for="v-district">Район</label><input id="v-district" name="district" placeholder="Например, Юнусабад" required></div>
    <div class="field"><label for="v-address">Адрес</label><input id="v-address" name="address" placeholder="Улица или ориентир"></div>
    <div class="field"><label for="v-area">Площадь, м²</label><input id="v-area" name="area" type="number" min="1" placeholder="Например, 82" required></div>
    <div class="field"><label for="v-condition">Состояние</label><select id="v-condition" name="condition"><option value="Хорошее состояние">Хорошее состояние</option><option value="Свежий ремонт">Свежий ремонт</option><option value="Дизайнерский ремонт">Дизайнерский ремонт</option><option value="Под отделку">Под отделку</option><option value="Новый">Новый</option></select></div>
  </div><div id="valuation-extra-fields" class="form-grid" style="margin-top:17px"></div>
  <div class="field" style="margin-top:17px"><label for="v-photos">Фотографии, если есть</label><input id="v-photos" name="photos" type="file" accept="image/*" multiple><small class="muted" id="photo-count" style="font-size:.72rem">Файлы останутся на этом устройстве и не загружаются.</small></div>
  <button class="btn btn-primary" type="submit" style="margin-top:21px">${icon('sparkle',17)} Получить ориентир</button></form>
  <div id="valuation-result" style="margin-top:20px"></div></section>
  <aside><div class="surface-card"><div class="empty-icon">${icon('chart',24)}</div><h3>Как читать результат</h3><p class="muted" style="margin-top:9px;font-size:.83rem">Расчёт ориентируется на демонстрационные объявления похожего типа. Он поможет начать разговор о цене, но не заменяет профессиональную оценку.</p><hr class="divider"><div class="tag-row"><span class="pill">Категория</span><span class="pill">Площадь</span><span class="pill">Город</span><span class="pill">Состояние</span></div></div><div class="notice" style="margin-top:14px">Реальные цены на платформе не подключены. Значения ниже — пример интерфейса, а не рыночная статистика.</div></aside></div></div>`;
}

export function bindValuation(properties: Property[]) {
  const form=document.getElementById('valuation-form') as HTMLFormElement;
  const category=document.getElementById('v-category') as HTMLSelectElement;
  const extra=document.getElementById('valuation-extra-fields')!;
  const updateFields=()=>{extra.innerHTML=categoryFields[category.value].map(fieldMarkup).join('');};
  category.addEventListener('change',updateFields); updateFields();
  document.getElementById('v-photos')!.addEventListener('change',event=>{const files=(event.currentTarget as HTMLInputElement).files;document.getElementById('photo-count')!.textContent=files?.length?`${files.length} ${files.length===1?'файл выбран':'файла выбрано'} — файлы останутся на этом устройстве.`:'Файлы останутся на этом устройстве и не загружаются.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity()) return;
    const data=Object.fromEntries(new FormData(form)) as Record<string,string>;
    const size=Number(data.area);
    const comparable=properties.filter(item=>item.category===data.category);
    const cityComparable=comparable.filter(item=>item.city===data.city);
    const useSet=cityComparable.length?cityComparable:comparable;
    const perMeter=useSet.length?useSet.reduce((sum,item)=>sum+item.price/(item.area||1),0)/useSet.length:(data.category==='Земля'?110:data.category==='Гараж'?500:850);
    const conditionFactor: Record<string,number> = {'Свежий ремонт':1.07,'Дизайнерский ремонт':1.1,'Под отделку':.88,'Новый':1.05,'Хорошее состояние':1};
    const estimate=Math.round(size*perMeter*(cityComparable.length?1:(cityRates[data.city]||.55))*(conditionFactor[data.condition]||1)/500)*500;
    const min=Math.round(estimate*.9/500)*500, max=Math.round(estimate*1.1/500)*500;
    const matches=useSet.slice(0,3);
    const record={...data,estimate,min,max,createdAt:new Date().toISOString()};
    const history=readStore('valuations',[]); writeStore('valuations',[record,...history].slice(0,10));
    document.getElementById('valuation-result')!.innerHTML=`<article class="surface-card"><div class="inline" style="justify-content:space-between"><span class="pill">Демонстрационный расчёт</span>${icon('trend',20)}</div><p class="muted" style="margin-top:20px">Предварительный ориентир</p><h2 style="font-size:2.65rem;color:var(--green);margin:5px 0">${money(estimate)}</h2><p class="muted">Диапазон: ${money(min)} – ${money(max)}</p><hr class="divider"><div class="detail-feature-grid"><div class="detail-feature">${icon('area')} ${size} м²</div><div class="detail-feature">${icon('chart')} ≈ ${money(Math.round(estimate/size))} / м²</div><div class="detail-feature">${icon('pin')} ${data.city}, ${data.district}</div></div><p style="margin:20px 0 9px;font-weight:700">${matches.length?'Похожие объявления':'Как получился ориентир'}</p><p class="muted" style="font-size:.83rem">Расчёт использовал ${useSet.length} демонстрационных объектов категории «${data.category}»${cityComparable.length?` в городе ${data.city}`:', в разных городах'} и поправку на состояние. Ваши параметры и адрес могут заметно изменить цену.</p>${matches.length?`<div class="tag-row" style="margin-top:13px">${matches.map(item=>`<span class="pill pill-neutral">${item.city} · ${item.area} м² · ${money(item.price)}</span>`).join('')}</div>`:''}<div class="notice" style="margin-top:18px">Предварительная демонстрационная оценка. Для определения реальной рыночной стоимости необходимы актуальные данные рынка и проверка характеристик объекта.</div><button class="btn btn-quiet" type="button" style="margin-top:17px" id="retry-valuation">${icon('back',16)} Повторить оценку</button></article>`;
    document.getElementById('retry-valuation').addEventListener('click',()=>{document.getElementById('valuation-result').innerHTML='';form.scrollIntoView({behavior:'smooth',block:'center'});});
    document.getElementById('valuation-result').scrollIntoView({behavior:'smooth',block:'start'});
  });
}
