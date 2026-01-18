import logger from './logger';

/* eslint-disable no-constant-condition */
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  type ErrLike = { status?: number; statusCode?: number; code?: string | number };
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const e = err as ErrLike;
      const status = e.status ?? e.statusCode ?? (typeof e.code === 'number' ? e.code : undefined);
      // retry on 429 or 5xx
      const shouldRetry =
        status === 429 || (typeof status === 'number' && status >= 500) || !status;
      if (!shouldRetry || attempt > maxRetries) {
        logger.error(`OpenAI call failed after ${attempt} attempts: ${String(err)}`);
        throw err;
      }
      const delay = Math.pow(2, attempt) * baseDelay + Math.floor(Math.random() * 100);
      logger.warn(
        `OpenAI call failed (attempt ${attempt}), retrying after ${delay}ms: ${String(err)}`,
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
