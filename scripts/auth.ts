import { applyPhoneValidation } from './phone';
import { toast } from './ui';

export function authPage() {
  return `<div class="container"><section class="auth-card">
    <header class="page-heading" style="padding-bottom:0"><span class="eyebrow">Makon</span><h1 id="auth-title">Вход в аккаунт</h1><p>Войдите, чтобы пользоваться личным кабинетом и своими объявлениями.</p></header>
    <form class="form-card" id="auth-form" novalidate>
      <div class="field"><label for="auth-phone">Номер телефона</label><input id="auth-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="18" placeholder="+998 90 123 45 67" required></div>
      <div class="field" style="margin-top:16px"><label for="auth-password">Пароль</label><input id="auth-password" name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="Не менее 8 символов"></div>
      <div class="field" id="auth-password-confirm-field" style="margin-top:16px" hidden><label for="auth-password-confirm">Повторите пароль</label><input id="auth-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8"></div>
      <button class="btn btn-primary btn-block" id="auth-submit" type="submit" style="margin-top:20px">Войти</button>
      <div class="auth-links"><span id="auth-switch-prompt">Впервые на Makon?</span> <button type="button" id="auth-switch">Создать аккаунт</button></div>
      <div class="notice auth-warning">Демонстрационная форма: номер проверяется по формату, но SMS-код и настоящая авторизация не подключены. Не вводите настоящий пароль — он не сохраняется.</div>
    </form>
  </section></div>`;
}

export function bindAuth() {
  const form = document.getElementById('auth-form') as HTMLFormElement;
  const phone = form.elements.namedItem('phone') as HTMLInputElement;
  const password = form.elements.namedItem('password') as HTMLInputElement;
  const confirmField = document.getElementById('auth-password-confirm-field')!;
  const confirmPassword = form.elements.namedItem('passwordConfirm') as HTMLInputElement;
  const submit = document.getElementById('auth-submit') as HTMLButtonElement;
  const title = document.getElementById('auth-title')!;
  const switchPrompt = document.getElementById('auth-switch-prompt')!;
  const switchButton = document.getElementById('auth-switch') as HTMLButtonElement;
  let registering = false;

  applyPhoneValidation(phone);
  confirmField.style.display = 'none';
  const validatePasswords = () => {
    confirmPassword.setCustomValidity(
      registering && password.value && confirmPassword.value && password.value !== confirmPassword.value
        ? 'Пароли не совпадают.'
        : ''
    );
  };
  password.addEventListener('input', validatePasswords);
  confirmPassword.addEventListener('input', validatePasswords);
  switchButton.addEventListener('click', () => {
    registering = !registering;
    confirmField.hidden = !registering;
    confirmField.style.display = registering ? 'grid' : 'none';
    confirmPassword.required = registering;
    password.autocomplete = registering ? 'new-password' : 'current-password';
    validatePasswords();
    title.textContent = registering ? 'Создать аккаунт' : 'Вход в аккаунт';
    submit.textContent = registering ? 'Зарегистрироваться' : 'Войти';
    switchPrompt.textContent = registering ? 'Уже есть аккаунт?' : 'Впервые на Makon?';
    switchButton.textContent = registering ? 'Войти' : 'Создать аккаунт';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    validatePasswords();
    if (!form.reportValidity()) return;
    toast('Форма готова, но сервис авторизации пока не подключён. Данные не сохранены.');
  });
}
