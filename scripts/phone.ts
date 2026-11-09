export function isValidUzbekistanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length === 9 || (digits.length === 12 && digits.startsWith('998'));
}

export function applyPhoneValidation(input: HTMLInputElement) {
  const validate = () => {
    const value = input.value.trim();
    input.setCustomValidity(
      value && !isValidUzbekistanPhone(value)
        ? 'Введите номер Узбекистана: +998 90 123 45 67 или 90 123 45 67.'
        : ''
    );
  };
  input.addEventListener('input', validate);
  input.addEventListener('blur', validate);
  validate();
}
