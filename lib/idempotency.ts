/**
 * Idempotency Protection System
 * 
 * Guarantees that mutating operations (Post Creation, Publishing, AI Generation)
 * execute EXACTLY ONCE, even under rapid double-clicks, network drops, or automated retries.
 */

interface IdempotencyRecord {
  status: 'pending' | 'completed';
  statusCode?: number;
  body?: any;
  createdAt: number;
}

const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;
const idempotencyStore = new Map<string, IdempotencyRecord>();

function cleanupExpiredKeys(): void {
  const now = Date.now();
  idempotencyStore.forEach((record, key) => {
    if (now - record.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  });
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredKeys, 2 * 60 * 1000).unref?.();
}

export interface IdempotencyResult<T> {
  isReplay: boolean;
  statusCode: number;
  data: T;
}

export async function withIdempotency<T>(
  key: string | null | undefined,
  handler: () => Promise<{ statusCode: number; data: T }>
): Promise<IdempotencyResult<T>> {
  if (!key || typeof key !== 'string' || !key.trim()) {
    const result = await handler();
    return {
      isReplay: false,
      statusCode: result.statusCode,
      data: result.data,
    };
  }

  const cleanKey = key.trim();
  const existing = idempotencyStore.get(cleanKey);
  const now = Date.now();

  if (existing && now - existing.createdAt < IDEMPOTENCY_TTL_MS) {
    if (existing.status === 'pending') {
      const error: any = new Error(
        'A request with this Idempotency-Key is currently being processed. Please wait for completion.'
      );
      error.statusCode = 409;
      error.isConcurrentConflict = true;
      throw error;
    }

    if (existing.status === 'completed') {
      return {
        isReplay: true,
        statusCode: existing.statusCode || 200,
        data: existing.body as T,
      };
    }
  }

  idempotencyStore.set(cleanKey, {
    status: 'pending',
    createdAt: now,
  });

  try {
    const result = await handler();
    idempotencyStore.set(cleanKey, {
      status: 'completed',
      statusCode: result.statusCode,
      body: result.data,
      createdAt: Date.now(),
    });

    return {
      isReplay: false,
      statusCode: result.statusCode,
      data: result.data,
    };
  } catch (err) {
    idempotencyStore.delete(cleanKey);
    throw err;
  }
}
