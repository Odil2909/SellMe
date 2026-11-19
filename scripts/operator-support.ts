type TelegramMiniApp = { initData?: string; ready?: () => void; expand?: () => void; setHeaderColor?: (color: string) => void; setBackgroundColor?: (color: string) => void };
declare global { interface Window { Telegram?: { WebApp?: TelegramMiniApp } } }

type SupportMessage = { id: number; sender: string; text: string; createdAt: string };
type Ticket = { id: string; status: string; locale: string; preview: string; lastSender: string; updatedAt: string };
type Thread = { id: string; status: string; locale: string; updatedAt: string; messages: SupportMessage[] };

const app = window.Telegram?.WebApp;
app?.ready?.(); app?.expand?.(); app?.setHeaderColor?.('#101a17'); app?.setBackgroundColor?.('#101a17');
const initData = app?.initData ?? '';
const listElement = document.querySelector<HTMLElement>('#conversation-list')!;
const conversationElement = document.querySelector<HTMLElement>('#conversation')!;
const noticeElement = document.querySelector<HTMLElement>('#notice')!;
const pendingCount = document.querySelector<HTMLElement>('#pending-count')!;
let filter = 'pending';
let selectedId = '';
let tickets: Ticket[] = [];
let busy = false;

function showNotice(message: string, error = false) {
  noticeElement.textContent = message;
  noticeElement.hidden = !message;
  noticeElement.classList.toggle('error', error);
}
function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}
function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }
function statusLabel(status: string) { return status === 'operator' ? 'Оператор подключён' : status === 'pending_operator' ? 'Ждёт решения' : status; }

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => ({})) as T & { message?: string; error?: string };
  if (!response.ok) throw new Error(payload.error || payload.message || (response.status === 401 ? 'Откройте панель через Telegram.' : 'Не удалось выполнить запрос.'));
  return payload;
}

function renderTickets() {
  listElement.replaceChildren();
  if (!tickets.length) {
    const empty = document.createElement('div'); empty.className = 'list-empty';
    empty.textContent = filter === 'pending' ? 'Нет обращений, ожидающих решения.' : 'Обращений пока нет.';
    listElement.append(empty); return;
  }
  for (const ticket of tickets) {
    const button = document.createElement('button'); button.className = `ticket${ticket.id === selectedId ? ' selected' : ''}`;
    const head = document.createElement('span'); head.className = 'ticket-head';
    const id = document.createElement('span'); id.className = 'ticket-id'; id.textContent = `Заявка ${shortId(ticket.id)}`;
    const time = document.createElement('span'); time.className = 'ticket-time'; time.textContent = dateLabel(ticket.updatedAt);
    head.append(id, time);
    const preview = document.createElement('span'); preview.className = 'ticket-preview'; preview.textContent = ticket.preview || 'Переписка';
    const meta = document.createElement('span'); meta.className = 'ticket-meta';
    const badge = document.createElement('span'); badge.className = `status${ticket.status === 'operator' ? ' operator' : ''}`; badge.textContent = statusLabel(ticket.status);
    const locale = document.createElement('span'); locale.textContent = ticket.locale.toUpperCase();
    meta.append(badge, locale); button.append(head, preview, meta);
    button.addEventListener('click', () => { selectedId = ticket.id; renderTickets(); void loadThread(); });
    listElement.append(button);
  }
}

function renderThread(thread: Thread) {
  conversationElement.replaceChildren();
  const head = document.createElement('header'); head.className = 'chat-head';
  const title = document.createElement('div'); title.className = 'chat-title';
  const strong = document.createElement('strong'); strong.textContent = `Заявка ${shortId(thread.id)}`;
  const subtitle = document.createElement('span'); subtitle.textContent = `${statusLabel(thread.status)} · ${thread.locale.toUpperCase()}`;
  title.append(strong, subtitle);
  const actions = document.createElement('div'); actions.className = 'actions';
  if (thread.status === 'pending_operator') {
    actions.append(actionButton('Принять', 'primary', () => decide(true)), actionButton('Отказать', 'danger', () => decide(false)));
  }
  head.append(title, actions);
  const messages = document.createElement('div'); messages.className = 'messages'; messages.id = 'messages';
  for (const message of thread.messages) {
    const bubble = document.createElement('article'); bubble.className = `message ${message.sender}`;
    const text = document.createElement('span'); text.textContent = message.text;
    const time = document.createElement('span'); time.className = 'message-time';
    time.textContent = `${message.sender === 'user' ? 'Клиент' : message.sender === 'operator' ? 'Оператор' : message.sender === 'assistant' ? 'ИИ-помощник' : 'Система'} · ${dateLabel(message.createdAt)}`;
    bubble.append(text, time); messages.append(bubble);
  }
  conversationElement.append(head, messages);
  if (thread.status === 'operator') {
    const form = document.createElement('form'); form.className = 'reply-form';
    const input = document.createElement('textarea'); input.name = 'text'; input.maxLength = 2000; input.placeholder = 'Напишите ответ клиенту…'; input.required = true; input.setAttribute('aria-label', 'Ответ клиенту');
    const send = document.createElement('button'); send.type = 'submit'; send.className = 'button primary send-button'; send.textContent = 'Отправить';
    form.append(input, send);
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); const text = input.value.trim(); if (!text) return;
      send.disabled = true;
      try { await request(`/api/support/operator/conversations/${thread.id}/messages`, 'POST', { text }); input.value = ''; showNotice('Ответ отправлен.'); await loadThread(); await loadTickets(); }
      catch (error) { showNotice(error instanceof Error ? error.message : 'Не удалось отправить ответ.', true); }
      finally { send.disabled = false; }
    });
    conversationElement.append(form);
  }
  messages.scrollTop = messages.scrollHeight;
}

function actionButton(text: string, variant: string, action: () => void) {
  const button = document.createElement('button'); button.type = 'button'; button.className = `button ${variant}`; button.textContent = text; button.addEventListener('click', action); return button;
}

async function loadTickets() {
  try {
    tickets = await request<Ticket[]>(`/api/support/operator/conversations?filter=${filter}`);
    const pending = await request<Ticket[]>('/api/support/operator/conversations?filter=pending');
    pendingCount.textContent = String(pending.length);
    if (selectedId && !tickets.some((ticket) => ticket.id === selectedId)) selectedId = '';
    renderTickets();
    if (selectedId) await loadThread();
    else if (!conversationElement.querySelector('.empty-state')) showEmpty();
  } catch (error) { showNotice(error instanceof Error ? error.message : 'Не удалось загрузить обращения.', true); }
}
async function loadThread() {
  if (!selectedId) return;
  try { const thread = await request<Thread>(`/api/support/operator/conversations/${selectedId}`); renderThread(thread); }
  catch (error) { showNotice(error instanceof Error ? error.message : 'Не удалось загрузить переписку.', true); }
}
async function decide(accept: boolean) {
  if (!selectedId || busy) return;
  busy = true;
  try {
    const thread = await request<Thread>(`/api/support/operator/conversations/${selectedId}/decision`, 'POST', { accept });
    showNotice(accept ? 'Вы подключились к разговору.' : 'Запрос отклонён. Клиент сможет продолжить с помощником.');
    renderThread(thread); await loadTickets();
  } catch (error) { showNotice(error instanceof Error ? error.message : 'Не удалось обработать заявку.', true); }
  finally { busy = false; }
}
function showEmpty() {
  conversationElement.replaceChildren();
  const empty = document.createElement('div'); empty.className = 'empty-state';
  const icon = document.createElement('div'); icon.className = 'empty-icon'; icon.textContent = '⌂';
  const title = document.createElement('h2'); title.textContent = 'Выберите обращение';
  const copy = document.createElement('p'); copy.textContent = 'Переписка и действия появятся здесь.';
  empty.append(icon, title, copy); conversationElement.append(empty);
}

document.querySelectorAll<HTMLButtonElement>('.filter').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter || 'pending'; selectedId = '';
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
  showEmpty(); void loadTickets();
}));
document.querySelector<HTMLButtonElement>('#refresh')?.addEventListener('click', () => { showNotice('Обновлено.'); void loadTickets(); });
if (!initData) showNotice('Эту панель нужно открыть из Telegram через /panel. Для запуска задайте публичный HTTPS адрес Mini App.', true);
else void loadTickets();
window.setInterval(() => { if (initData && !busy) void loadTickets(); }, 12000);
