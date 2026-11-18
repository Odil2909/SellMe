const safeParse = <T>(value: string | null, fallback: T): T => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

const accountDataKeys = new Set([
  'profile', 'favorites', 'compare', 'valuations', 'settings', 'listingDraft',
  'listingStep', 'listings', 'locale'
]);
let accountConnected = false;
const pendingWrites = new Map<string, Promise<void>>();
const scheduledWrites = new Map<string, ReturnType<typeof setTimeout>>();

const serverRequest = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, { ...init, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
};

function persistAccountValue(key: string, value: unknown, debounce = true) {
  if (!accountConnected || !accountDataKeys.has(key)) return;
  const send = () => {
    scheduledWrites.delete(key);
    const previous = pendingWrites.get(key) || Promise.resolve();
    const next = previous.catch(() => {}).then(async () => {
      await serverRequest('/api/user-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    }).catch(error => console.error(`Could not sync ${key} with the account:`, error));
    pendingWrites.set(key, next);
  };
  const existing = scheduledWrites.get(key);
  if (existing) clearTimeout(existing);
  if (debounce) scheduledWrites.set(key, setTimeout(send, 350));
  else send();
}

export async function flushAccountData() {
  for (const [key, timer] of scheduledWrites) {
    clearTimeout(timer);
    const value = safeParse(localStorage.getItem(`makon:${key}`), null);
    persistAccountValue(key, value, false);
  }
  await Promise.all([...pendingWrites.values()]);
}

export async function hydrateAccountData(): Promise<boolean> {
  try {
    const accountResponse = await serverRequest('/api/auth');
    const account = await accountResponse.json() as { user?: { id: string; phone: string } | null };
    if (!account.user) {
      if (localStorage.getItem('makon:accountId')) await clearAccountData();
      accountConnected = false;
      return false;
    }
    const previousAccountId = localStorage.getItem('makon:accountId');
    if (previousAccountId && previousAccountId !== account.user.id) await clearAccountData();
    const response = await serverRequest('/api/user-data');
    const payload = await response.json() as { data?: Record<string, unknown> };
    accountConnected = true;
    const local: Record<string, unknown> = {};
    for (let index = 0; index < localStorage.length; index++) {
      const storageKey = localStorage.key(index);
      if (storageKey?.startsWith('makon:')) {
        const key = storageKey.slice('makon:'.length);
        if (accountDataKeys.has(key)) local[key] = safeParse(localStorage.getItem(storageKey), null);
      }
    }
    const remote = payload.data || {};
    localStorage.setItem('makon:accountId', account.user.id);
    for (const [key, value] of Object.entries(remote)) {
      if (accountDataKeys.has(key)) localStorage.setItem(`makon:${key}`, JSON.stringify(value));
    }
    for (const [key, value] of Object.entries(local)) {
      if (!(key in remote)) persistAccountValue(key, value);
    }
    if (!('profile' in remote) && !('profile' in local)) {
      const profile = { name: 'Ваш профиль', email: '', phone: account.user.phone, avatar: '' };
      localStorage.setItem('makon:profile', JSON.stringify(profile));
      persistAccountValue('profile', profile);
    }
    await flushAccountData();
    return true;
  } catch (error) {
    accountConnected = false;
    console.error('Could not load account data:', error);
    return false;
  }
}

export async function clearAccountData() {
  await flushAccountData();
  accountConnected = false;
  for (const key of accountDataKeys) localStorage.removeItem(`makon:${key}`);
  localStorage.removeItem('makon:accountId');
  pendingWrites.clear();
}

export function readStore<T = string[]>(key: string, fallback: T = [] as T): T {
  try { return safeParse(localStorage.getItem(`makon:${key}`), fallback); }
  catch { return fallback; }
}

export function writeStore(key: string, value: unknown): boolean {
  try { localStorage.setItem(`makon:${key}`, JSON.stringify(value)); persistAccountValue(key, value); return true; }
  catch { return false; }
}

export function toggleId(key: string, id: string, max = Infinity): 'added' | 'removed' | 'limit' | 'error' {
  const values = readStore(key, []);
  if (values.includes(id)) return writeStore(key, values.filter(item => item !== id)) ? 'removed' : 'error';
  if (values.length >= max) return 'limit';
  return writeStore(key, [...values, id]) ? 'added' : 'error';
}
