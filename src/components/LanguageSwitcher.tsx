import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

// Three real buttons: keyboard focusable, activated with Enter or Space, and the active one is announced
// to screen readers (aria-pressed) as well as highlighted. Each button carries its own lang attribute so
// the name is read and drawn in the right script, whatever language the page is in.
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div role="group" aria-label={t('language.label')} className="lang-switch">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          className="lang-btn"
          aria-pressed={l.code === language}
          onClick={() => setLanguage(l.code)}
        >
          {l.nativeName}
        </button>
      ))}
    </div>
  );
}
