const requestLog = new Map();
let lastGeocodeRequest = 0;

function send(response, status, value) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(value);
}

function isRateLimited(request) {
  const now = Date.now();
  const ip = (request.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const record = requestLog.get(ip);
  if (!record || now - record.startedAt >= 1000) {
    requestLog.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > 1;
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return send(response, 405, { error: 'Метод не поддерживается.' });
  }
  if (isRateLimited(request)) {
    return send(response, 429, { error: 'Подождите секунду перед следующим поиском адреса.' });
  }

  const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
  const query = url.searchParams.get('q')?.trim();
  if (!query || query.length > 300) {
    return send(response, 400, { error: 'Введите адрес (до 300 символов).' });
  }
  const delay = Math.max(0, 1000 - (Date.now() - lastGeocodeRequest));
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  lastGeocodeRequest = Date.now();

  try {
    const search = new URL('https://nominatim.openstreetmap.org/search');
    search.searchParams.set('q', `${query}, Uzbekistan`);
    search.searchParams.set('format', 'jsonv2');
    search.searchParams.set('limit', '1');
    search.searchParams.set('countrycodes', 'uz');
    const result = await fetch(search, {
      headers: { 'User-Agent': 'MakonPropertySearch/1.0', 'Accept-Language': 'ru,en' },
      signal: AbortSignal.timeout(8000)
    });
    if (!result.ok) {
      console.error(`Nominatim returned HTTP ${result.status}`);
      return send(response, 502, { error: 'Сервис поиска адреса временно недоступен.' });
    }
    const matches = await result.json();
    if (!matches.length) {
      return send(response, 404, { error: 'Адрес не найден. Уточните адрес или выберите точку на карте.' });
    }
    return send(response, 200, {
      lat: Number(matches[0].lat),
      lng: Number(matches[0].lon),
      displayName: matches[0].display_name
    });
  } catch (error) {
    console.error('Address lookup failed:', error);
    return send(response, 502, { error: 'Не удалось выполнить поиск адреса.' });
  }
}
