import { createServer } from 'node:http';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDirectory = resolve(process.env.DATA_DIR || join(root, 'server-data'));
const uploadDirectory = join(dataDirectory, 'uploads');
const listingsPath = join(dataDirectory, 'listings.json');
const port = Number(process.env.PORT) || 4178;
const bodyLimit = 80 * 1024 * 1024;
const maxVideoSize = 10 * 1024 * 1024;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};
const allowedCategories = new Set(['Квартира', 'Дом', 'Земля', 'Гараж', 'Коммерция', 'Офис', 'Склад']);
const allowedDeals = new Set(['Продажа', 'Аренда', 'Посуточно']);
const requestLog = new Map();
let listingWrites = Promise.resolve();
let lastGeocodeRequest = 0;

const respond = (response, status, value) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
};

async function loadListings() {
  try {
    return JSON.parse(await readFile(listingsPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function addListing(listing) {
  const nextWrite = listingWrites.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    const temporaryPath = `${listingsPath}.${randomUUID()}.tmp`;
    const listings = await loadListings();
    await writeFile(temporaryPath, JSON.stringify([listing, ...listings], null, 2), 'utf8');
    await rename(temporaryPath, listingsPath);
  });
  listingWrites = nextWrite.catch(() => {});
  return nextWrite;
}

function isRateLimited(request, key, limit, interval) {
  const now = Date.now();
  const identifier = `${request.socket.remoteAddress || 'unknown'}:${key}`;
  const entry = requestLog.get(identifier);
  if (!entry || now - entry.startedAt >= interval) {
    requestLog.set(identifier, { startedAt: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

async function readBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > bodyLimit) throw Object.assign(new Error('Размер запроса превышает 80 МБ.'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, length);
}

function parseMultipart(buffer, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const separator = Buffer.from('\r\n\r\n');
  const parts = [];
  let cursor = 0;
  if (!buffer.subarray(0, delimiter.length).equals(delimiter)) {
    throw Object.assign(new Error('Некорректный формат загрузки.'), { status: 400 });
  }
  while (cursor < buffer.length) {
    cursor += delimiter.length;
    if (buffer.subarray(cursor, cursor + 2).equals(Buffer.from('--'))) break;
    if (!buffer.subarray(cursor, cursor + 2).equals(Buffer.from('\r\n'))) {
      throw Object.assign(new Error('Некорректный разделитель загрузки.'), { status: 400 });
    }
    cursor += 2;
    const headerEnd = buffer.indexOf(separator, cursor);
    if (headerEnd < 0) throw Object.assign(new Error('Некорректные заголовки файла.'), { status: 400 });
    const headers = buffer.toString('utf8', cursor, headerEnd);
    const disposition = headers.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || '';
    const name = disposition.match(/(?:^|;)\s*name="([^"]*)"/i)?.[1];
    const filename = disposition.match(/(?:^|;)\s*filename="([^"]*)"/i)?.[1];
    if (!name) throw Object.assign(new Error('В запросе отсутствует имя поля.'), { status: 400 });
    const contentStart = headerEnd + separator.length;
    const contentEnd = buffer.indexOf(Buffer.from(`\r\n--${boundary}`), contentStart);
    if (contentEnd < 0) throw Object.assign(new Error('Файл не завершён корректно.'), { status: 400 });
    const content = buffer.subarray(contentStart, contentEnd);
    const type = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || 'application/octet-stream';
    parts.push(filename === undefined
      ? { name, value: content.toString('utf8') }
      : { name, filename, type, content });
    cursor = contentEnd + 2;
  }
  return parts;
}

function mediaExtension(file) {
  const extension = extname(file.filename).toLowerCase();
  const mime = file.type.split(';')[0];
  const signatures = {
    '.png': mime === 'image/png' && file.content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    '.jpg': mime === 'image/jpeg' && file.content[0] === 255 && file.content[1] === 216 && file.content[2] === 255,
    '.jpeg': mime === 'image/jpeg' && file.content[0] === 255 && file.content[1] === 216 && file.content[2] === 255,
    '.webp': mime === 'image/webp' && file.content.toString('ascii', 0, 4) === 'RIFF' && file.content.toString('ascii', 8, 12) === 'WEBP',
    '.gif': mime === 'image/gif' && /^GIF8[79]a$/.test(file.content.toString('ascii', 0, 6)),
    '.mp4': mime === 'video/mp4' && file.content.toString('ascii', 4, 8) === 'ftyp',
    '.mov': mime === 'video/quicktime' && file.content.toString('ascii', 4, 8) === 'ftyp',
    '.webm': mime === 'video/webm' && file.content.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
  };
  return signatures[extension] ? extension : '';
}

function text(value, field, maxLength, required = true) {
  if (typeof value !== 'string') throw Object.assign(new Error(`Поле «${field}» заполнено неверно.`), { status: 400 });
  const result = value.replace(/\u0000/g, '').trim();
  if ((required && !result) || result.length > maxLength) {
    throw Object.assign(new Error(`Проверьте поле «${field}» (максимум ${maxLength} символов).`), { status: 400 });
  }
  return result;
}

function validateListing(value) {
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

async function handleCreateListing(request, response) {
  if (isRateLimited(request, 'publish', 10, 60 * 60 * 1000)) {
    return respond(response, 429, { error: 'Слишком много объявлений. Попробуйте позже.' });
  }
  const contentType = request.headers['content-type'] || '';
  const boundary = contentType.match(/multipart\/form-data;\s*boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundary) return respond(response, 415, { error: 'Ожидалась форма с файлами.' });
  const body = await readBody(request);
  const parts = parseMultipart(body, boundary[1] || boundary[2].trim());
  const listingText = parts.find(part => part.name === 'listing' && part.value)?.value;
  let input;
  try {
    input = JSON.parse(listingText || '');
  } catch {
    return respond(response, 400, { error: 'Не удалось прочитать данные объявления.' });
  }
  const listing = validateListing(input);
  const files = parts.filter(part => part.name === 'media');
  if (files.length > 10) return respond(response, 400, { error: 'Можно добавить не более 10 фото или видео.' });
  const id = randomUUID();
  const savedPaths = [];
  try {
    await mkdir(uploadDirectory, { recursive: true });
    const photos = [];
    for (const file of files) {
      const extension = mediaExtension(file);
      if (!extension) throw Object.assign(new Error('Поддерживаются только PNG, JPG, WebP, GIF, MP4, MOV и WebM.'), { status: 415 });
      if (extension === '.mp4' || extension === '.mov' || extension === '.webm') {
        if (file.content.length > maxVideoSize) {
          throw Object.assign(new Error('Размер каждого видео не должен превышать 10 МБ.'), { status: 413 });
        }
      } else if (file.content.length > 15 * 1024 * 1024) {
        throw Object.assign(new Error('Размер фотографии не должен превышать 15 МБ.'), { status: 413 });
      }
      const filename = `${id}-${randomUUID()}${extension}`;
      await writeFile(join(uploadDirectory, filename), file.content, { flag: 'wx' });
      savedPaths.push(join(uploadDirectory, filename));
      photos.push(`/uploads/${filename}`);
    }
    const result = {
      ...listing,
      id,
      currency: 'USD',
      features: [],
      photos,
      date: new Date().toISOString().slice(0, 10),
      status: 'Новое объявление',
      contact: { name: listing.name, role: 'Собственник', phone: listing.phone }
    };
    delete result.name;
    delete result.phone;
    await addListing(result);
    return respond(response, 201, result);
  } catch (error) {
    await Promise.all(savedPaths.map(path => rm(path, { force: true })));
    throw error;
  }
}

async function handleGeocode(request, response, url) {
  if (isRateLimited(request, 'geocode', 1, 1000)) {
    return respond(response, 429, { error: 'Подождите секунду перед следующим поиском адреса.' });
  }
  const query = url.searchParams.get('q')?.trim();
  if (!query || query.length > 300) return respond(response, 400, { error: 'Введите адрес (до 300 символов).' });
  const delay = Math.max(0, 1000 - (Date.now() - lastGeocodeRequest));
  if (delay) await new Promise(resolveDelay => setTimeout(resolveDelay, delay));
  lastGeocodeRequest = Date.now();
  const search = new URL('https://nominatim.openstreetmap.org/search');
  search.searchParams.set('q', `${query}, Uzbekistan`);
  search.searchParams.set('format', 'jsonv2');
  search.searchParams.set('limit', '1');
  search.searchParams.set('countrycodes', 'uz');
  const result = await fetch(search, {
    headers: { 'User-Agent': 'MakonPropertySearch/1.0', 'Accept-Language': 'ru,en' },
    signal: AbortSignal.timeout(8000)
  });
  if (!result.ok) throw Object.assign(new Error(`Сервис поиска адреса ответил с ошибкой (${result.status}).`), { status: 502 });
  const matches = await result.json();
  if (!matches.length) return respond(response, 404, { error: 'Адрес не найден. Уточните адрес или выберите точку на карте.' });
  return respond(response, 200, {
    lat: Number(matches[0].lat),
    lng: Number(matches[0].lon),
    displayName: matches[0].display_name
  });
}

async function serveStatic(request, response, url) {
  const buildDirectory = join(root, 'dist');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  let filePath = resolve(buildDirectory, `.${normalize(pathname)}`);
  if (!filePath.startsWith(`${buildDirectory}${sep}`) && filePath !== buildDirectory) {
    response.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') response.end();
    else response.end(content);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (!extname(pathname) || pathname.endsWith('.html')) {
      const page = await readFile(join(buildDirectory, 'index.html'));
      response.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
      response.end(page);
      return;
    }
    response.writeHead(404).end();
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (request.method === 'GET' && url.pathname === '/api/listings') {
      return respond(response, 200, await loadListings());
    }
    if (request.method === 'POST' && url.pathname === '/api/listings') {
      return await handleCreateListing(request, response);
    }
    if (request.method === 'GET' && url.pathname === '/api/geocode') {
      return await handleGeocode(request, response, url);
    }
    if (request.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      const filename = url.pathname.slice('/uploads/'.length);
      if (!/^[\da-f-]+\.(?:png|jpe?g|webp|gif|mp4|mov|webm)$/i.test(filename)) {
        response.writeHead(404).end();
        return;
      }
      const filePath = join(uploadDirectory, filename);
      const content = await readFile(filePath);
      const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      if (range) {
        const start = range[1] ? Number(range[1]) : 0;
        const end = range[2] ? Math.min(Number(range[2]), content.length - 1) : content.length - 1;
        if (start > end || start >= content.length) {
          response.writeHead(416, { 'Content-Range': `bytes */${content.length}` }).end();
          return;
        }
        response.writeHead(206, {
          'Content-Type': mimeTypes[extname(filePath).toLowerCase()],
          'Content-Range': `bytes ${start}-${end}/${content.length}`,
          'Content-Length': end - start + 1,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        });
        response.end(content.subarray(start, end + 1));
        return;
      }
      response.writeHead(200, {
        'Content-Type': mimeTypes[extname(filePath).toLowerCase()],
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(content);
      return;
    }
    if (request.method === 'GET' || request.method === 'HEAD') return await serveStatic(request, response, url);
    return respond(response, 405, { error: 'Метод не поддерживается.' });
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }
    const status = Number(error.status) || 500;
    if (status >= 500) console.error(error);
    respond(response, status, { error: error.message || 'Внутренняя ошибка сервера.' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Makon API listening on http://0.0.0.0:${port}`);
});
