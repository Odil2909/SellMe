(() => {
  const showStartupError = message => {
    const app = document.getElementById('app');
    if (!app) return;
    const panel = document.createElement('main');
    panel.className = 'container section';
    const card = document.createElement('section');
    card.className = 'empty-state';
    const title = document.createElement('h1');
    title.textContent = 'Не удалось загрузить приложение';
    const details = document.createElement('pre');
    details.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;margin:18px auto 0;max-width:700px;color:#78847c;font:13px/1.5 ui-monospace,monospace';
    details.textContent = String(message || 'Неизвестная ошибка JavaScript');
    card.append(title, details);
    panel.append(card);
    app.replaceChildren(panel);
  };

  window.addEventListener('error', event => {
    if (event.target !== window && !(event.target instanceof HTMLScriptElement)) return;
    const scriptUrl = event.target instanceof HTMLScriptElement ? event.target.src : '';
    const details = event.message || `Не удалось загрузить JavaScript: ${scriptUrl}`;
    showStartupError(scriptUrl.endsWith('/src/main.tsx')
      ? `${details}\n\nОткройте проект через Vite: остановите Live Server и выполните npm run dev.`
      : details);
  }, true);
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    showStartupError(reason instanceof Error ? `${reason.name}: ${reason.message}` : reason);
  });
})();
