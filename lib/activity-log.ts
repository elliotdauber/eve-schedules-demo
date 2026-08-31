import { get, list, put } from '@vercel/blob';

export type ActivityRecord = {
  id: string;
  receivedAt: string;
  type: 'job' | 'prompt';
  scheduleId?: string;
  scheduleName?: string;
  prompt?: string;
  answer?: string;
  payload?: unknown;
};

/** Blob is available when a store is linked — auth uses Vercel OIDC automatically. */
export function isBlobStoreConfigured(): boolean {
  return Boolean(process.env.BLOB_STORE_ID?.trim());
}

export async function recordActivity(
  record: Omit<ActivityRecord, 'id' | 'receivedAt'>
): Promise<ActivityRecord | null> {
  if (!isBlobStoreConfigured()) {
    console.log('[activity]', record);
    return null;
  }

  const id = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const full: ActivityRecord = { id, receivedAt, ...record };

  await put(`activity/${receivedAt}-${id}.json`, JSON.stringify(full), {
    access: 'private',
    addRandomSuffix: false,
  });

  return full;
}

async function readActivityBlob(pathname: string): Promise<ActivityRecord | null> {
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as ActivityRecord;
}

export async function listActivity(limit = 40): Promise<ActivityRecord[]> {
  if (!isBlobStoreConfigured()) {
    return [];
  }

  const { blobs } = await list({ prefix: 'activity/', limit: 100 });
  const sorted = blobs
    .sort((a, b) => b.pathname.localeCompare(a.pathname))
    .slice(0, limit);

  const records = await Promise.all(
    sorted.map(blob => readActivityBlob(blob.pathname))
  );

  return records.filter((record): record is ActivityRecord => record !== null);
}
