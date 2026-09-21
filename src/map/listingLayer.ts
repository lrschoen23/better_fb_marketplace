import type { GeoJSONSource, Map as MlMap, MapMouseEvent } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { Listing } from '../lib/types';

const SRC = 'listings';

// Clustered pin layer. City-level coords stack heavily, hence clustering.
export class ListingLayer {
  private ready = false;
  private pending: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };

  constructor(
    private map: MlMap,
    private onPick: (ids: string[]) => void,
  ) {
    if (map.isStyleLoaded()) this.init();
    else map.once('load', () => this.init());
  }

  // Push new pins; safe to call before the style has loaded.
  setListings(listings: Listing[]) {
    this.pending = {
      type: 'FeatureCollection',
      features: listings
        .filter((l) => l.lat !== null && l.lng !== null)
        .map((l) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [l.lng!, l.lat!] },
          properties: { id: l.id },
        })),
    };
    if (this.ready) (this.map.getSource(SRC) as GeoJSONSource).setData(this.pending);
  }

  private init() {
    const m = this.map;
    m.addSource(SRC, { type: 'geojson', data: this.pending, cluster: true, clusterRadius: 45, clusterMaxZoom: 13 });
    m.addLayer({
      id: 'clusters',
      type: 'circle',
      source: SRC,
      filter: ['has', 'point_count'],
      paint: { 'circle-color': '#1d6fe8', 'circle-radius': ['step', ['get', 'point_count'], 14, 10, 18, 50, 24], 'circle-opacity': 0.85 },
    });
    m.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: SRC,
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12, 'text-font': ['Noto Sans Regular'] },
      paint: { 'text-color': '#fff' },
    });
    m.addLayer({
      id: 'pins',
      type: 'circle',
      source: SRC,
      filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': '#e8541d', 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
    });
    m.on('click', 'clusters', (e) => void this.pickCluster(e));
    m.on('click', 'pins', (e) => this.onPick(e.features?.map((f) => String(f.properties?.id)) ?? []));
    for (const id of ['clusters', 'pins']) {
      m.on('mouseenter', id, () => (m.getCanvas().style.cursor = 'pointer'));
      m.on('mouseleave', id, () => (m.getCanvas().style.cursor = ''));
    }
    this.ready = true;
    (m.getSource(SRC) as GeoJSONSource).setData(this.pending); // flush anything queued
  }

  // Cluster click: report its members, and zoom in if it can still split.
  private async pickCluster(e: MapMouseEvent & { features?: GeoJSON.Feature[] }) {
    const f = e.features?.[0];
    if (!f) return;
    const src = this.map.getSource(SRC) as GeoJSONSource;
    const clusterId = f.properties?.cluster_id as number;
    const leaves = await src.getClusterLeaves(clusterId, 200, 0);
    this.onPick(leaves.map((l) => String(l.properties?.id)));
    const zoom = await src.getClusterExpansionZoom(clusterId);
    if (zoom <= 13) this.map.easeTo({ center: (f.geometry as Point).coordinates as [number, number], zoom: zoom + 0.5 });
  }
}
