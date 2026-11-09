import type { Property } from './types';

export async function loadProperties(): Promise<Property[]> {
  const response = await fetch(new URL('../data/properties.json', import.meta.url));
  if (!response.ok) throw new Error(`Не удалось загрузить данные (${response.status})`);
  return response.json() as Promise<Property[]>;
}
