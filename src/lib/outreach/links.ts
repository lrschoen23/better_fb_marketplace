// Accept only Facebook / Messenger URLs so a pasted contact can't open elsewhere.
export function normalizeThreadUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const ok = u.protocol === 'https:' && /(^|\.)(facebook|messenger)\.com$/.test(u.hostname);
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}
