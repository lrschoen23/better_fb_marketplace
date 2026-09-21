import { describe, expect, it } from 'vitest';
import { parseResponseBody } from '../src/lib/parse';
import { parseRoots } from '../src/lib/parse/ndjson';
import { listingNode } from './fixtures';

describe('ndjson', () => {
  it('splits multiple roots and drops bad lines', () => {
    const body = ['{"a":1}', '', 'garbage', '{"b":2}', '{"truncated":'].join('\n');
    expect(parseRoots(body)).toEqual([{ a: 1 }, { b: 2 }]);
  });
});

describe('extract', () => {
  it('finds listings at any nesting', () => {
    const body = JSON.stringify({ data: { whatever: { edges: [{ node: { listing: listingNode('111') } }] } } });
    expect(parseResponseBody(body).map((l) => l.id)).toEqual(['111']);
  });

  // Proves extraction is path-independent.
  it('survives renamed containers', () => {
    const a = JSON.stringify({ x: [{ y: listingNode('222') }] });
    const b = JSON.stringify({ totally: { different: { path: listingNode('222') } } });
    expect(parseResponseBody(a)).toHaveLength(1);
    expect(parseResponseBody(b)).toHaveLength(1);
  });

  it('reads across streamed lines and dedupes', () => {
    const body = [JSON.stringify({ a: listingNode('1') }), JSON.stringify({ b: [listingNode('1'), listingNode('2')] })].join('\n');
    expect(parseResponseBody(body).map((l) => l.id).sort()).toEqual(['1', '2']);
  });

  it('normalizes fields and city text', () => {
    const [l] = parseResponseBody(JSON.stringify(listingNode('3')));
    expect(l).toMatchObject({ title: 'Item 3', priceAmount: 150, locationText: 'Portland, OR', sellerName: 'Sam', lat: null });
  });

  it('picks up coordinates when present', () => {
    const n = listingNode('4', { location: { latitude: 45.5, longitude: -122.6 } });
    expect(parseResponseBody(JSON.stringify(n))[0]).toMatchObject({ lat: 45.5, lng: -122.6 });
  });

  it('ignores non-listings and strips the hijack guard', () => {
    expect(parseResponseBody('{"id":"5","name":"not a listing"}')).toEqual([]);
    expect(parseResponseBody('for (;;);' + JSON.stringify(listingNode('6')))).toHaveLength(1);
  });
});
