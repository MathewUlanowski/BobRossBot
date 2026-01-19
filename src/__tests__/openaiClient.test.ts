import { callWithRetry } from '../openaiClient';

describe('callWithRetry', () => {
  it('retries on transient errors and eventually succeeds', async () => {
    let attempts = 0;
    const fn = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        const e = new Error('Too many requests') as unknown as { status?: number };
        (e as { status?: number }).status = 429;
        return Promise.reject(e);
      }
      return Promise.resolve('ok');
    });

    const res = await callWithRetry(fn, 5, 10);
    expect(res).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('gives up after maxRetries and throws', async () => {
    const fn = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Server error'), { status: 500 }));
    await expect(callWithRetry(fn, 2, 10)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3); // initial try + 2 retries
  });

  it('retries on network errors with no status and succeeds', async () => {
    let attempts = 0;
    const fn = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 2) return Promise.reject(new Error('Network failure'));
      return Promise.resolve('ok-network');
    });
    const res = await callWithRetry(fn, 3, 10);
    expect(res).toBe('ok-network');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on client errors (e.g., 400)', async () => {
    const err = Object.assign(new Error('Bad request'), { status: 400 });
    const fn = jest.fn().mockRejectedValue(err);
    await expect(callWithRetry(fn, 3, 10)).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
