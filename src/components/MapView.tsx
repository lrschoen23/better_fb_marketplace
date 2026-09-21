import { Map as MlMap, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { AreaShape, Listing } from '../lib/types';
import { DrawController, type DrawMode } from '../map/drawing';
import { ListingLayer } from '../map/listingLayer';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from '../map/style';
import { DrawToolbar } from './DrawToolbar';

interface Props {
  listings: Listing[];
  areas: AreaShape[];
  onAreasChange: (areas: AreaShape[]) => void;
  onPick: (ids: string[]) => void;
}

export function MapView({ listings, areas, onAreasChange, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const layer = useRef<ListingLayer | null>(null);
  const draw = useRef<DrawController | null>(null);
  const [mode, setMode] = useState<DrawMode>('static');
  // Latest callbacks, so the map is built once but never calls stale ones.
  const cb = useRef({ onAreasChange, onPick });
  cb.current = { onAreasChange, onPick };
  const latest = useRef({ listings, areas });
  latest.current = { listings, areas };

  // Build the map once.
  useEffect(() => {
    const map = new MlMap({ container: el.current!, style: MAP_STYLE_URL, center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
    map.addControl(new NavigationControl(), 'top-right');
    layer.current = new ListingLayer(map, (ids) => cb.current.onPick(ids));
    map.once('load', () => {
      draw.current = new DrawController(map, (a) => cb.current.onAreasChange(a));
      draw.current.sync(latest.current.areas);
      layer.current?.setListings(latest.current.listings);
    });
    return () => {
      draw.current?.destroy();
      draw.current = layer.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => layer.current?.setListings(listings), [listings]);
  useEffect(() => draw.current?.sync(areas), [areas]);

  const pick = (m: DrawMode) => {
    setMode(m);
    draw.current?.setMode(m);
  };

  return (
    <div className="map-wrap">
      <div ref={el} className="map" />
      <DrawToolbar mode={mode} onMode={pick} onClear={() => draw.current?.clear()} hasAreas={areas.length > 0} />
    </div>
  );
}
