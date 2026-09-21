// Facebook streams GraphQL as newline-delimited JSON (@defer), so one body
// may hold several roots. Bad lines are dropped, never thrown.
export function parseRoots(body: string): unknown[] {
  const roots: unknown[] = [];
  for (const line of body.split('\n')) {
    const text = line.trim();
    if (!text || (text[0] !== '{' && text[0] !== '[')) continue;
    try {
      roots.push(JSON.parse(text));
    } catch {
      // partial or non-JSON line; skip
    }
  }
  return roots;
}

// Some responses are prefixed with a `for (;;);` hijack guard. Strip it.
export function stripGuard(body: string): string {
  return body.replace(/^for \(;;\);/, '');
}
