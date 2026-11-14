import { extname } from 'node:path';
import { handleUpload } from '@vercel/blob/client';

const uploadLog = new Map();
const uploadLimit = 100;
const uploadWindow = 60 * 60 * 1000;
const uploadTypes = {
  '.png': { type: 'image/png', limit: 15 * 1024 * 1024 },
  '.jpg': { type: 'image/jpeg', limit: 15 * 1024 * 1024 },
  '.jpeg': { type: 'image/jpeg', limit: 15 * 1024 * 1024 },
  '.webp': { type: 'image/webp', limit: 15 * 1024 * 1024 },
  '.gif': { type: 'image/gif', limit: 15 * 1024 * 1024 },
  '.mp4': { type: 'video/mp4', limit: 10 * 1024 * 1024 },
  '.mov': { type: 'video/quicktime', limit: 10 * 1024 * 1024 },
  '.webm': { type: 'video/webm', limit: 10 * 1024 * 1024 }
};

function isRateLimited(request) {
  const now = Date.now();
  const forwardedFor = request.headers['x-forwarded-for'] || '';
  const ip = forwardedFor.split(',').at(-1)?.trim() || 'unknown';
  for (const [key, record] of uploadLog) {
    if (now - record.startedAt >= uploadWindow) uploadLog.delete(key);
  }
  const record = uploadLog.get(ip);
  if (!record || now - record.startedAt >= uploadWindow) {
    uploadLog.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  record.count += 1;
  return record.count > uploadLimit;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Метод не поддерживается.' });
  }
  if (isRateLimited(request)) {
    return response.status(429).json({ error: 'Слишком много загрузок. Попробуйте позже.' });
  }
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async pathname => {
        const extension = extname(pathname).toLowerCase();
        const file = uploadTypes[extension];
        if (!pathname.startsWith('listing-media/') || !file) {
          throw new Error('Поддерживаются только фото и видео допустимых форматов.');
        }
        return {
          allowedContentTypes: [file.type],
          maximumSizeInBytes: file.limit,
          addRandomSuffix: true
        };
      }
    });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'Не удалось подготовить загрузку.' });
  }
}
