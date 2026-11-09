import { icon } from './icons';
import { listingCard } from './ui';
import type { Property } from './types';

const examples=['Найди квартиру в Ташкенте до $80 000','Хочу арендовать дом рядом с центром','Найди гараж возле моего дома','Подбери помещение под магазин','Найди землю для строительства'];
const cities=['Ташкент','Самарканд','Бухара','Андижан','Наманган','Фергана','Нукус'];

function extractBudget(text) {
  const match=text.match(/(?:до|бюджет(?:ом)?|не дороже|максимум)\s*\$?\s*([\d\s.,]+)\s*(тыс(?:яч)?|млн|k)?/i)||text.match(/\$\s*([\d\s.,]+)\s*(тыс(?:яч)?|млн|k)?/i);
  if(!match)return null;
  const numeric=Number(match[1].replace(/[\s,]/g,''));
  if(!Number.isFinite(numeric))return null;
  const unit=(match[2]||'').toLowerCase();
  return Math.round(numeric*(unit.startsWith('т')||unit==='k'?1000:unit==='млн'?1000000:1));
}

function understand(text, profile) {
  const q=text.toLowerCase();
  const category=q.includes('гараж')? 'Гараж':q.includes('земл')||q.includes('участ')? 'Земля':q.includes('дом')||q.includes('коттедж')? 'Дом':q.includes('офис')? 'Офис':q.includes('склад')? 'Склад':q.includes('магазин')||q.includes('помещ')||q.includes('коммер')? 'Коммерция':q.includes('квартир')||q.includes('апартамент')||q.includes('студи')? 'Квартира':'';
  const city=cities.find(name=>q.includes(name.toLowerCase()))||'';
  const budget=extractBudget(q)||Number(profile.budget)||null;
  const deal=/аренд|снять|сдавать|посуточ/i.test(q)?(q.includes('посуточ')?'Посуточно':'Аренда'):'';
  const roomsMatch=q.match(/(\d+)\s*(?:комнат|комн)/);
  return {category,city,budget,deal,rooms:roomsMatch?Number(roomsMatch[1]):null, district:profile.district||'', workplace:profile.workplace||'', commute:profile.commute||''};
}

export function aiSearchPage() {
  return `<div class="container"><header class="page-heading"><span class="eyebrow">Makon smart search · демо</span><h1>Расскажите, что ищете.</h1><p>Подбор учитывает слова в запросе и демонстрационные объявления в каталоге.</p></header>
  <div class="chat-shell"><aside class="chat-sidebar"><h3>Ваши ориентиры</h3><p class="muted" style="font-size:.75rem;margin:-10px 0 16px">Дополните запрос деталями</p><div class="field"><label for="ai-budget">Бюджет до, $</label><input id="ai-budget" type="number" placeholder="Любой"></div><div class="field" style="margin-top:13px"><label for="ai-workplace">Место работы</label><input id="ai-workplace" placeholder="Район или ориентир"></div><div class="field" style="margin-top:13px"><label for="ai-commute">Время в пути, мин</label><input id="ai-commute" type="number" placeholder="Например, 30"></div><div class="field" style="margin-top:13px"><label for="ai-district">Предпочитаемый район</label><input id="ai-district" placeholder="Любой"></div><button class="btn btn-quiet btn-block btn-small" style="margin-top:17px" type="button" id="clear-dialog">${icon('plus',15)} Новый подбор</button><div class="notice" style="margin-top:15px;font-size:.7rem">Демо анализирует только текст и поля. Маршруты до работы не рассчитываются.</div></aside>
  <section class="chat-main"><div class="chat-messages" id="chat-messages"><div class="chat-greeting"><div class="assistant-symbol">${icon('sparkles',23)}</div><h2>Привет! Помогу найти недвижимость, которая подходит именно вам.</h2><p>Напишите, что важно — например, тип жилья, город и бюджет.</p><div class="prompt-chips">${examples.map((example,i)=>`<button type="button" class="prompt-chip" data-prompt="${i}">${example}</button>`).join('')}</div></div></div>
  <form class="chat-input-area" id="ai-prompt-form"><div class="chat-input-wrap"><textarea id="ai-prompt" rows="1" placeholder="Опишите свой идеальный вариант…" required aria-label="Ваш запрос"></textarea><button class="btn btn-primary btn-small" type="submit">${icon('arrow',17)} Найти</button></div><p class="muted" style="font-size:.68rem;margin:9px 4px 0">Показываем демонстрационные варианты из каталога Makon.</p></form></section></div></div>`;
}

export function bindAiSearch(properties: Property[]) {
  const form=document.getElementById('ai-prompt-form') as HTMLFormElement;
  const textarea=document.getElementById('ai-prompt') as HTMLTextAreaElement;
  const messages=document.getElementById('chat-messages') as HTMLDivElement;
  const bindPrompts = (root: ParentNode) => root.querySelectorAll<HTMLButtonElement>('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{textarea.value=examples[Number(button.dataset.prompt)];form.requestSubmit();}));
  bindPrompts(document);
  (document.getElementById('clear-dialog') as HTMLButtonElement).addEventListener('click',()=>{messages.innerHTML=`<div class="chat-greeting"><div class="assistant-symbol">${icon('sparkles',23)}</div><h2>Хорошо, начнём новый подбор.</h2><p>Напишите запрос или выберите пример ниже.</p><div class="prompt-chips">${examples.map((example,i)=>`<button type="button" class="prompt-chip" data-prompt="${i}">${example}</button>`).join('')}</div></div>`;bindPrompts(messages);});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const text=textarea.value.trim(); if(!text)return;
    const profile={budget:(document.getElementById('ai-budget') as HTMLInputElement).value,workplace:(document.getElementById('ai-workplace') as HTMLInputElement).value,commute:(document.getElementById('ai-commute') as HTMLInputElement).value,district:(document.getElementById('ai-district') as HTMLInputElement).value};
    messages.querySelector('.chat-greeting')?.remove();
    const user=document.createElement('div');user.className='chat-message user';user.textContent=text;messages.append(user);
    const pending=document.createElement('div');pending.className='chat-message assistant';pending.textContent='Сопоставляю запрос с демонстрационными объявлениями…';messages.append(pending);
    textarea.value='';
    setTimeout(()=>{
      const criteria=understand(text,profile);
      let matches=properties.filter(item=>{
        if(criteria.category&&item.category!==criteria.category)return false;
        if(criteria.city&&item.city!==criteria.city)return false;
        if(criteria.deal&&item.deal!==criteria.deal)return false;
        if(criteria.budget&&item.price>criteria.budget)return false;
        if(criteria.rooms&&(!item.rooms||item.rooms<criteria.rooms))return false;
        if(criteria.district&&!`${item.district} ${item.city}`.toLowerCase().includes(criteria.district.toLowerCase()))return false;
        if(criteria.workplace&&!`${item.district} ${item.city}`.toLowerCase().includes(criteria.workplace.toLowerCase()))return false;
        return true;
      });
      if(!matches.length&&criteria.workplace){matches=properties.filter(item=>(!criteria.category||item.category===criteria.category)&&(!criteria.city||item.city===criteria.city)&&(!criteria.budget||item.price<=criteria.budget));}
      const details=[];if(criteria.category)details.push(criteria.category.toLowerCase());if(criteria.city)details.push(criteria.city);if(criteria.budget)details.push(`до ${new Intl.NumberFormat('en-US').format(criteria.budget)} $`);if(criteria.deal)details.push(criteria.deal.toLowerCase());
      const explanation=matches.length?`Нашёл ${matches.length} ${matches.length===1?'вариант':'варианта'}${details.length?` по параметрам: ${details.join(', ')}`:''}. Совпадения основаны на типе, городе, бюджете и районе из объявления.`:`Точных совпадений в каталоге пока нет${details.length?` (${details.join(', ')})`:''}. Попробуйте расширить бюджет или убрать одно условие.`;
      pending.innerHTML=`<p>${explanation}</p>${criteria.workplace&&criteria.commute?`<p style="font-size:.76rem;margin-top:7px">Пожелание по поездке сохранено. Расстояние и время в пути в демо не рассчитываются.</p>`:''}${matches.length?`<div class="card-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:13px">${matches.slice(0,4).map(item=>listingCard(item,{compare:false})).join('')}</div>`:''}`;
      pending.querySelectorAll('.fade-up').forEach(card=>requestAnimationFrame(()=>card.classList.add('visible')));
      messages.scrollTop=messages.scrollHeight;
    },350);
    messages.scrollTop=messages.scrollHeight;
  });
}
