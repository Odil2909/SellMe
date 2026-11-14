import { randomUUID } from 'node:crypto';
import { getDatabase } from './database.mjs';
import { validateListing } from '../server/listing-validation.mjs';

const submissionLog = new Map();
const maxPhotos = 10;

function isRateLimited(request) {
  const now = Date.now();
  const ip = (request.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const record = submissionLog.get(ip);
  if (!record || now - record.startedAt >= 60 * 60 * 1000) {
    submissionLog.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > 10;
}

function validatePhotos(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxPhotos) {
    throw Object.assign(new Error('Можно добавить не более 10 фото или видео.'), { status: 400 });
  }
  return value.map(photo => {
    if (typeof photo !== 'string') {
      throw Object.assign(new Error('Некорректная ссылка на медиафайл.'), { status: 400 });
    }
    let url;
    try {
      url = new URL(photo);
    } catch {
      throw Object.assign(new Error('Некорректная ссылка на медиафайл.'), { status: 400 });
    }
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.public.blob.vercel-storage.com')) {
      throw Object.assign(new Error('Медиафайлы должны быть загружены в Vercel Blob.'), { status: 400 });
    }
    return url.href;
  });
}

function send(response, status, value) {
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json(value);
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      const sql = await getDatabase();
      const rows = await sql`SELECT data FROM makon_listings ORDER BY created_at DESC`;
      return send(response, 200, rows.map(row => row.data));
    } catch (error) {
      console.error('Failed to load listings:', error);
      return send(response, error.status || 500, { error: error.status ? error.message : 'Не удалось загрузить объявления.' });
    }
  }
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return send(response, 405, { error: 'Метод не поддерживается.' });
  }
  if (isRateLimited(request)) {
    return send(response, 429, { error: 'Слишком много объявлений. Попробуйте позже.' });
  }

  try {
    const input = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const listing = validateListing(input);
    const photos = validatePhotos(input.photos);
    const id = randomUUID();
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

    const sql = await getDatabase();
    await sql`INSERT INTO makon_listings (id, data) VALUES (${id}, ${JSON.stringify(result)}::jsonb)`;
    return send(response, 201, result);
  } catch (error) {
    const status = Number(error.status) || (error instanceof SyntaxError ? 400 : 500);
    if (status >= 500) console.error('Failed to publish listing:', error);
    return send(response, status, { error: status >= 500 ? 'Не удалось опубликовать объявление.' : error.message });
  }
}
