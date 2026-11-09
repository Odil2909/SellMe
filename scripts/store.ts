const safeParse = <T>(value: string | null, fallback: T): T => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

export function readStore<T = string[]>(key: string, fallback: T = [] as T): T {
  try { return safeParse(localStorage.getItem(`makon:${key}`), fallback); }
  catch { return fallback; }
}

export function writeStore(key: string, value: unknown): boolean {
  try { localStorage.setItem(`makon:${key}`, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function toggleId(key: string, id: string, max = Infinity): 'added' | 'removed' | 'limit' | 'error' {
  const values = readStore(key, []);
  if (values.includes(id)) return writeStore(key, values.filter(item => item !== id)) ? 'removed' : 'error';
  if (values.length >= max) return 'limit';
  return writeStore(key, [...values, id]) ? 'added' : 'error';
}
