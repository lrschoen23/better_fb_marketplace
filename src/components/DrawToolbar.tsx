import type { DrawMode } from '../map/drawing';

const MODES: { mode: DrawMode; label: string }[] = [
  { mode: 'polygon', label: 'Draw shape' },
  { mode: 'freehand', label: 'Freehand' },
  { mode: 'select', label: 'Edit' },
  { mode: 'static', label: 'Pan' },
];

interface Props {
  mode: DrawMode;
  onMode: (m: DrawMode) => void;
  onClear: () => void;
  hasAreas: boolean;
}

export function DrawToolbar({ mode, onMode, onClear, hasAreas }: Props) {
  return (
    <div className="draw-toolbar">
      {MODES.map((m) => (
        <button key={m.mode} className={mode === m.mode ? 'active' : ''} onClick={() => onMode(m.mode)}>
          {m.label}
        </button>
      ))}
      <button onClick={onClear} disabled={!hasAreas}>
        Clear
      </button>
    </div>
  );
}
