import { GRAPHQL_PATH, LIKELY_LISTING } from '../protocol';

export type Emit = (body: string) => void;

const INSTALLED = Symbol.for('fbmp.interceptor');

// Forward a body only if it's GraphQL-ish and looks listing-related.
function offer(emit: Emit, url: string, body: string) {
  if (url.includes(GRAPHQL_PATH) && LIKELY_LISTING.test(body)) emit(body);
}

// Patch fetch + XHR on `win`. Every hook is inert on failure: the page's own
// behavior and return values must never change.
export function installInterceptor(win: Window & typeof globalThis, emit: Emit): void {
  const w = win as unknown as Record<symbol, boolean>;
  if (w[INSTALLED]) return; // idempotent
  w[INSTALLED] = true;

  // --- fetch ---
  const origFetch = win.fetch;
  win.fetch = function (this: unknown, ...args: Parameters<typeof fetch>) {
    const result = origFetch.apply(this, args);
    try {
      const input = args[0];
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      result.then((res) => res.clone().text()).then((text) => offer(emit, url, text)).catch(() => {});
    } catch {
      // ignore; never affect the page
    }
    return result;
  } as typeof fetch;

  // --- XHR ---
  const proto = win.XMLHttpRequest.prototype;
  const origOpen = proto.open;
  const origSend = proto.send;
  const urls = new WeakMap<XMLHttpRequest, string>();

  proto.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
    try {
      urls.set(this, String(url));
    } catch {
      // ignore
    }
    return (origOpen as (...a: unknown[]) => void).call(this, method, url, ...rest);
  } as typeof proto.open;

  proto.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    try {
      this.addEventListener('load', () => {
        try {
          const text = this.responseType === '' || this.responseType === 'text' ? this.responseText : '';
          if (text) offer(emit, urls.get(this) ?? '', text);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
    return origSend.call(this, body);
  };
}
