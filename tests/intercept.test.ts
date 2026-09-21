import { describe, expect, it, vi } from 'vitest';
import { installInterceptor } from '../src/lib/intercept/install';

// Minimal fake window: only what the interceptor touches.
function fakeWindow(fetchImpl: typeof fetch) {
  class XHR { open() {} send() {} addEventListener() {} }
  return { fetch: fetchImpl, XMLHttpRequest: XHR } as unknown as Window & typeof globalThis;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('interceptor', () => {
  it('emits listing-like graphql bodies and returns the original response untouched', async () => {
    const res = new Response('{"listing":1}');
    const win = fakeWindow(vi.fn(async () => res) as never);
    const emit = vi.fn();
    installInterceptor(win, emit);
    const out = await win.fetch('https://www.facebook.com/api/graphql/');
    await flush();
    expect(emit).toHaveBeenCalledWith('{"listing":1}');
    expect(await out.text()).toBe('{"listing":1}'); // page can still read its body
  });

  it('ignores other urls and unrelated bodies', async () => {
    const win = fakeWindow(vi.fn(async () => new Response('{"listing":1}')) as never);
    const emit = vi.fn();
    installInterceptor(win, emit);
    await win.fetch('https://www.facebook.com/other');
    await flush();
    expect(emit).not.toHaveBeenCalled();
  });

  it('is idempotent and passes fetch errors through', async () => {
    const boom = vi.fn(async () => { throw new Error('net'); });
    const win = fakeWindow(boom as never);
    installInterceptor(win, vi.fn());
    const patched = win.fetch;
    installInterceptor(win, vi.fn());
    expect(win.fetch).toBe(patched);
    await expect(win.fetch('https://x/api/graphql')).rejects.toThrow('net');
  });
});
