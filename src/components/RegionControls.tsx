import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import { REGIONS } from '../services/regions';
import type { RegionId } from '../services/regions';

const BUTTON_KEY: Record<RegionId, TranslationKey> = {
  global: 'region.global.button',
  bangladesh: 'region.bangladesh.button',
  gujarat: 'region.gujarat.button',
};
export const REGION_NAME_KEY: Record<Exclude<RegionId, 'global'>, TranslationKey> = {
  bangladesh: 'region.bangladesh.name',
  gujarat: 'region.gujarat.name',
};

export function RegionControls({ region, onChange }: { region: RegionId; onChange: (id: RegionId) => void }) {
  const { t } = useLanguage();
  return (
    <div className="region-controls">
      <div role="group" aria-label={t('region.label')} className="btn-row">
        {REGIONS.map((r) => (
          <button key={r.id} className="chip" aria-pressed={r.id === region} onClick={() => onChange(r.id)}>
            {t(BUTTON_KEY[r.id])}
          </button>
        ))}
      </div>
      <p className="note">{t('region.note')}</p>
    </div>
  );
}
