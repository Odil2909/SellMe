const allowedCategories = new Set(['Квартира', 'Дом', 'Земля', 'Гараж', 'Коммерция', 'Офис', 'Склад']);
const allowedDeals = new Set(['Продажа', 'Аренда', 'Посуточно']);

function text(value, field, maxLength, required = true) {
  if (typeof value !== 'string') throw Object.assign(new Error(`Поле «${field}» заполнено неверно.`), { status: 400 });
  const result = value.replace(/\u0000/g, '').trim();
  if ((required && !result) || result.length > maxLength) {
    throw Object.assign(new Error(`Проверьте поле «${field}» (максимум ${maxLength} символов).`), { status: 400 });
  }
  return result;
}

export function validateListing(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Данные объявления заполнены неверно.'), { status: 400 });
  }
  const listing = {
    deal: text(value.deal, 'тип сделки', 30),
    category: text(value.category, 'тип недвижимости', 30),
    city: text(value.city, 'город', 100),
    district: text(value.district, 'район', 100),
    address: text(value.address, 'адрес', 250),
    area: Number(value.area),
    price: Number(value.price),
    rooms: value.rooms ? Number(value.rooms) : undefined,
    floor: value.floor ? Number(value.floor) : undefined,
    floors: value.floors ? Number(value.floors) : undefined,
    plot: value.plot ? Number(value.plot) : undefined,
    condition: text(value.condition, 'состояние', 80),
    title: text(value.title, 'заголовок', 100),
    description: text(value.description, 'описание', 4000),
    name: text(value.name, 'имя', 100),
    phone: text(value.phone, 'телефон', 30),
    lat: Number(value.lat),
    lng: Number(value.lng)
  };
  if (!allowedDeals.has(listing.deal) || !allowedCategories.has(listing.category)) {
    throw Object.assign(new Error('Выберите тип сделки и недвижимости из списка.'), { status: 400 });
  }
  if (!Number.isFinite(listing.price) || listing.price <= 0 ||
      !Number.isFinite(listing.area) || listing.area <= 0 ||
      !Number.isFinite(listing.lat) || listing.lat < -90 || listing.lat > 90 ||
      !Number.isFinite(listing.lng) || listing.lng < -180 || listing.lng > 180) {
    throw Object.assign(new Error('Проверьте цену, площадь и координаты объекта.'), { status: 400 });
  }
  const digits = listing.phone.replace(/\D/g, '');
  if (!/^(?:998)?\d{9}$/.test(digits)) {
    throw Object.assign(new Error('Укажите корректный номер телефона Узбекистана.'), { status: 400 });
  }
  for (const field of ['rooms', 'floor', 'floors', 'plot']) {
    if (listing[field] !== undefined && (!Number.isFinite(listing[field]) || listing[field] < 0)) {
      throw Object.assign(new Error(`Проверьте числовое поле «${field}».`), { status: 400 });
    }
  }
  return listing;
}
