import { REGIONS } from '../services/regions';
import type { RegionId } from '../services/regions';

export function RegionControls({ region, onChange }: { region: RegionId; onChange: (id: RegionId) => void }) {
  return (
    <div className="region-controls">
      <div role="group" aria-label="Region" className="btn-row">
        {REGIONS.map((r) => (
          <button key={r.id} className="chip" aria-pressed={r.id === region} onClick={() => onChange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      <p className="note">
        Regional views use rough rectangular search areas to centre the map and filter events. They are not official
        administrative boundaries.
      </p>
    </div>
  );
}
