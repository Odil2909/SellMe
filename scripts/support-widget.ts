import './support-widget.css';
import { getLocale } from './i18n';

type Message = { id: number; sender: 'user' | 'assistant' | 'operator' | 'system'; text: string; createdAt?: string };
type Session = { conversationId: string; accessToken: string };
const SESSION_KEY = 'uyol:support:session:v1';

function readSession(): Session | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') as Partial<Session> | null;
    return value && typeof value.conversationId === 'string' && typeof value.accessToken === 'string'
      ? { conversationId: value.conversationId, accessToken: value.accessToken } : null;
  } catch { return null; }
}

export function mountSupportWidget(): () => void {
  if (document.querySelector('.support-widget')) return () => document.querySelector('.support-widget')?.remove();
  const root = document.createElement('section');
  root.className = 'support-widget';
  root.setAttribute('aria-label', 'Техническая поддержка');
  root.innerHTML = `
    <button class="support-widget__launcher" type="button" aria-label="Открыть чат поддержки" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
      <span>Поддержка</span>
    </button>
    <div class="support-widget__panel" aria-hidden="true" inert>
      <header class="support-widget__header">
        <div class="support-widget__intro"><strong>Поддержка uy-ol</strong><span>Ответит ИИ-помощник или оператор</span></div>
        <div class="support-widget__controls">
          <button class="support-widget__expand" type="button" aria-label="Развернуть чат на весь экран" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/></svg></button>
          <button class="support-widget__close" type="button" aria-label="Закрыть чат">×</button>
        </div>
        <button class="support-widget__operator" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0"/></svg><span>Позвать оператора</span></button>
      </header>
      <div class="support-widget__messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div class="support-widget__status" aria-live="polite"></div>
      <form class="support-widget__form"><label class="visually-hidden" for="support-widget-input">Сообщение в поддержку</label><textarea id="support-widget-input" rows="1" maxlength="2000" placeholder="Опишите вопрос…" required></textarea><button type="submit" aria-label="Отправить сообщение"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></svg></button></form>
      <div class="support-widget__hint">Сообщения обрабатываются ИИ и при необходимости передаются оператору. Не отправляйте пароли и коды.</div>
    </div>`;
  document.body.append(root);

  const launcher = root.querySelector<HTMLButtonElement>('.support-widget__launcher')!;
  const panel = root.querySelector<HTMLDivElement>('.support-widget__panel')!;
  const close = root.querySelector<HTMLButtonElement>('.support-widget__close')!;
  const expand = root.querySelector<HTMLButtonElement>('.support-widget__expand')!;
  const operator = root.querySelector<HTMLButtonElement>('.support-widget__operator')!;
  const transcript = root.querySelector<HTMLDivElement>('.support-widget__messages')!;
  const status = root.querySelector<HTMLDivElement>('.support-widget__status')!;
  const form = root.querySelector<HTMLFormElement>('.support-widget__form')!;
  const input = root.querySelector<HTMLTextAreaElement>('textarea')!;
  let formWidth = form.getBoundingClientRect().width;
  let session = readSession();
  let highestMessageId = 0;
  let pollTimer = 0;
  let opening: Promise<void> | null = null;
  let savedPanelSize: { width: string; height: string } | null = null;
  let resizedBaseHeight: number | null = null;
  const seen = new Set<number>();

  const resizeComposer = () => {
    const viewportLimit = Math.max(72, window.innerHeight - (root.classList.contains('is-expanded') ? 220 : 240));
    input.style.height = 'auto';
    input.style.maxHeight = `${viewportLimit}px`;
    const nextHeight = Math.min(input.scrollHeight, viewportLimit);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > viewportLimit ? 'auto' : 'hidden';
    const extra = Math.max(0, nextHeight - 38);
    panel.style.setProperty('--support-draft-extra', `${extra}px`);
    if (resizedBaseHeight !== null && !root.classList.contains('is-expanded')) {
      panel.style.height = `${Math.min(resizedBaseHeight + extra, Math.max(320, window.innerHeight - 120))}px`;
    }
  };
  const setExpanded = (expanded: boolean) => {
    if (expanded) {
      const width = panel.style.width, height = panel.style.height;
      savedPanelSize = width || height ? { width, height } : null;
      panel.style.removeProperty('width'); panel.style.removeProperty('height');
      resizedBaseHeight = null;
      root.classList.add('is-expanded');
    } else {
      root.classList.remove('is-expanded');
      if (savedPanelSize) {
        panel.style.width = savedPanelSize.width; panel.style.height = savedPanelSize.height;
        const savedHeight = Number.parseFloat(savedPanelSize.height);
        resizedBaseHeight = Number.isFinite(savedHeight) ? savedHeight - Number.parseFloat(panel.style.getPropertyValue('--support-draft-extra') || '0') : null;
      }
      savedPanelSize = null;
    }
    expand.setAttribute('aria-pressed', String(expanded));
    expand.setAttribute('aria-label', expanded ? 'Свернуть чат' : 'Развернуть чат на весь экран');
    resizeComposer();
  };

  const showStatus = (text: string, error = false) => { status.textContent = text; status.classList.toggle('is-error', error); };
  const renderMessages = (messages: Message[]) => {
    for (const message of messages) {
      if (seen.has(message.id)) continue;
      seen.add(message.id); highestMessageId = Math.max(highestMessageId, message.id);
      const row = document.createElement('div'); row.className = `support-widget__message support-widget__message--${message.sender}`;
      const label = document.createElement('span'); label.className = 'support-widget__sender';
      label.textContent = message.sender === 'operator' ? 'Оператор' : message.sender === 'user' ? 'Вы' : 'Помощник';
      const body = document.createElement('p'); body.textContent = message.text;
      row.append(label, body); transcript.append(row);
      if (message.sender === 'operator' || message.sender === 'system') showStatus('');
    }
    transcript.scrollTop = transcript.scrollHeight;
  };
  const request = async (url: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    if (session) headers.set('X-Support-Token', session.accessToken);
    const response = await fetch(url, { ...init, headers, cache: 'no-store' });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : 'Не удалось связаться с поддержкой.');
    return payload;
  };
  const openConversation = async () => {
    if (session) {
      try {
        const result = await request(`/api/support/conversations/${encodeURIComponent(session.conversationId)}/messages?after=0`);
        renderMessages((result.messages as Message[]) || []); return;
      } catch { session = null; sessionStorage.removeItem(SESSION_KEY); }
    }
    const result = await request('/api/support/conversations', { method: 'POST', body: JSON.stringify({ locale: getLocale() }) });
    session = { conversationId: String(result.conversationId), accessToken: String(result.accessToken) };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    renderMessages((result.messages as Message[]) || []);
  };
  const poll = async () => {
    if (!session || panel.inert) return;
    try {
      const result = await request(`/api/support/conversations/${encodeURIComponent(session.conversationId)}/messages?after=${highestMessageId}`);
      renderMessages((result.messages as Message[]) || []);
    } catch { /* transient disconnect; keep the chat and retry on the next interval */ }
  };
  const setOpen = (open: boolean) => {
    if (!open && root.classList.contains('is-expanded')) setExpanded(false);
    root.classList.toggle('is-open', open);
    panel.inert = !open; panel.setAttribute('aria-hidden', String(!open));
    launcher.setAttribute('aria-expanded', String(open)); launcher.setAttribute('aria-label', open ? 'Закрыть чат поддержки' : 'Открыть чат поддержки');
    expand.setAttribute('aria-pressed', String(root.classList.contains('is-expanded')));
    expand.setAttribute('aria-label', root.classList.contains('is-expanded') ? 'Свернуть чат' : 'Развернуть чат на весь экран');
    if (open) {
      input.focus(); showStatus('Подключаем чат…');
      if (!opening) opening = openConversation().then(() => showStatus('')).catch(error => showStatus(error instanceof Error ? error.message : 'Чат пока недоступен.', true)).finally(() => { opening = null; });
      window.clearInterval(pollTimer); pollTimer = window.setInterval(() => void poll(), 4000);
    } else { window.clearInterval(pollTimer); launcher.focus(); }
  };
  launcher.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
  close.addEventListener('click', () => setOpen(false));
  expand.addEventListener('click', () => {
    setExpanded(!root.classList.contains('is-expanded'));
  });
  const sendMessage = async (text: string, clearDraft: boolean) => {
    if (!text || !session) { showStatus('Чат ещё подключается. Попробуйте через секунду.', true); return; }
    const sendButton = form.querySelector<HTMLButtonElement>('button')!;
    sendButton.disabled = true; operator.disabled = true; input.disabled = true; showStatus('Отправляем…');
    try {
      const result = await request(`/api/support/conversations/${encodeURIComponent(session.conversationId)}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
      if (clearDraft) input.value = '';
      renderMessages((result.messages as Message[]) || []); resizeComposer();
      showStatus(result.pending ? 'Запрос отправлен оператору. Ждём его решения.' : result.handoff ? 'Оператор подключён. Его ответ появится здесь.' : ''); input.focus();
    } catch (error) { showStatus(error instanceof Error ? error.message : 'Не удалось отправить сообщение.', true); }
    finally { sendButton.disabled = false; operator.disabled = false; input.disabled = false; }
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    void sendMessage(input.value.trim(), true);
  });
  operator.addEventListener('click', async () => {
    if (!session && opening) await opening;
    if (!session) { showStatus('Подключаем чат…'); return; }
    void sendMessage('Пожалуйста, подключите оператора к этому чату.', false);
  });
  input.addEventListener('input', resizeComposer);
  const composerObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    const width = form.getBoundingClientRect().width;
    if (Math.abs(width - formWidth) > 1) { formWidth = width; resizeComposer(); }
  });
  composerObserver?.observe(form);
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  const escape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !root.classList.contains('is-open')) return;
    if (root.classList.contains('is-expanded')) {
      setExpanded(false);
    } else setOpen(false);
  };
  const rememberPanelHeight = () => {
    if (root.classList.contains('is-expanded') || !panel.style.height) return;
    const currentHeight = Number.parseFloat(panel.style.height);
    const extra = Number.parseFloat(panel.style.getPropertyValue('--support-draft-extra') || '0');
    if (Number.isFinite(currentHeight)) resizedBaseHeight = Math.max(360, currentHeight - (Number.isFinite(extra) ? extra : 0));
  };
  document.addEventListener('pointerup', rememberPanelHeight);
  window.addEventListener('resize', resizeComposer);
  document.addEventListener('keydown', escape);
  return () => { window.clearInterval(pollTimer); composerObserver?.disconnect(); document.removeEventListener('pointerup', rememberPanelHeight); window.removeEventListener('resize', resizeComposer); document.removeEventListener('keydown', escape); root.remove(); };
}
