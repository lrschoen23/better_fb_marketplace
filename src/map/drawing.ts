import type { Map as MlMap } from 'maplibre-gl';
import {
  TerraDraw,
  TerraDrawFreehandMode,
  TerraDrawPolygonMode,
  TerraDrawRenderMode,
  TerraDrawSelectMode,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import type { AreaShape } from '../lib/types';

export type DrawMode = 'polygon' | 'freehand' | 'select' | 'static';

// Thin wrapper so the rest of the app never touches terra-draw directly.
export class DrawController {
  private draw: TerraDraw;
  private last: AreaShape[] | null = null; // last array we emitted or applied

  constructor(map: MlMap, private onChange: (areas: AreaShape[]) => void) {
    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode(),
        new TerraDrawFreehandMode(),
        new TerraDrawSelectMode({
          flags: {
            polygon: { feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } } },
            freehand: { feature: { draggable: true } },
          },
        }),
        new TerraDrawRenderMode({ modeName: 'static', styles: {} }),
      ],
    });
    this.draw.start();
    this.draw.on('finish', () => this.emit()); // shape completed or edited
    this.draw.on('change', (_ids, type) => type === 'delete' && this.emit());
  }

  setMode(mode: DrawMode) {
    this.draw.setMode(mode);
  }

  // Push store state into the canvas; no-op if it's what we just emitted.
  sync(areas: AreaShape[]) {
    if (areas === this.last) return;
    this.last = areas;
    this.draw.clear();
    if (areas.length) this.draw.addFeatures(areas as never);
  }

  clear() {
    this.draw.clear();
    this.emit();
  }

  destroy() {
    this.draw.stop();
  }

  private emit() {
    const shapes = this.draw
      .getSnapshot()
      .filter((f) => f.geometry.type === 'Polygon') as unknown as AreaShape[];
    this.last = shapes;
    this.onChange(shapes);
  }
}
