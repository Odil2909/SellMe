import type { Property } from './types';
import { readStore } from './store';

export async function loadProperties(): Promise<Property[]> {
  const response = await fetch('/api/listings');
  if (!response.ok) {
    let detail = '';
    const body = await response.text();
    if (body) {
      try {
        const payload: unknown = JSON.parse(body);
        if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
          detail = payload.error;
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
    }
    const message = response.status === 404
      ? 'Сервер каталога не найден. Убедитесь, что запущен Java API.'
      : detail || `Сервер каталога временно недоступен (HTTP ${response.status}).`;
    throw new Error(message);
  }
  const sharedListings = await response.json() as Property[];
  if (!Array.isArray(sharedListings)) throw new Error('API каталога вернул неверный формат данных.');
  const sharedIds = new Set(sharedListings.map(listing => listing.id));
  const localListings = readStore<Record<string, string | string[]>[]>('listings', [])
    .filter(listing => !sharedIds.has(String(listing.id || '')))
    .map((listing, index): Property => ({
    id: String(listing.id || `local-${index}`),
    title: String(listing.title || ''),
    category: String(listing.category || ''),
    deal: String(listing.deal || ''),
    price: Number(listing.price) || 0,
    currency: 'USD',
    city: String(listing.city || ''),
    district: String(listing.district || ''),
    address: String(listing.address || ''),
    area: Number(listing.area) || 0,
    plot: Number(listing.plot) || undefined,
    lat: Number(listing.lat) || undefined,
    lng: Number(listing.lng) || undefined,
    rooms: Number(listing.rooms) || undefined,
    floor: Number(listing.floor) || undefined,
    floors: Number(listing.floors) || undefined,
    condition: String(listing.condition || ''),
    description: String(listing.description || ''),
    features: [],
    photos: Array.isArray(listing.photos) ? listing.photos.map(String).filter(photo => photo.startsWith('/uploads/')) : [],
    date: String(listing.date || new Date().toISOString().slice(0, 10)),
    status: 'Новое объявление',
    contact: {
      name: String(listing.name || ''),
      role: 'Собственник',
      phone: String(listing.phone || '')
    }
    }));
  return [...sharedListings, ...localListings];
}
