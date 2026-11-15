import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_LANGUAGE, isLanguage, translate } from './translations';
import type { Language, TFunction } from './translations';

export const LANGUAGE_STORAGE_KEY = 'banguj.language';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

/** The browser's localStorage, or null on the server or when the browser blocks it (reading it can throw). */
function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The saved language, or English if nothing valid is saved or storage is unavailable. Never throws. */
export function readStoredLanguage(storage: ReadableStorage | null = browserStorage()): Language {
  if (!storage) return DEFAULT_LANGUAGE;
  try {
    const value = storage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(value) ? value : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/** Save the language. Returns false (and does not throw) if storage is unavailable or full. */
export function storeLanguage(language: Language, storage: WritableStorage | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
}

// Without a provider (for example a component rendered on its own in a test) everything still works in English.
const fallback: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) => translate(DEFAULT_LANGUAGE, key, params),
};
const LanguageContext = createContext<LanguageContextValue>(fallback);

interface ProviderProps {
  children?: ReactNode;
  /** Overrides the saved language. Mainly for tests. */
  initialLanguage?: Language;
  /** Where to save the choice. Defaults to the browser's localStorage. */
  storage?: (ReadableStorage & WritableStorage) | null;
}

export function LanguageProvider({ children, initialLanguage, storage }: ProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    initialLanguage ?? (storage === undefined ? readStoredLanguage() : readStoredLanguage(storage)),
  );

  const setLanguage = useCallback(
    (next: Language) => {
      if (!isLanguage(next)) return; // ignore anything that is not a supported language
      setLanguageState(next);
      if (storage === undefined) storeLanguage(next);
      else storeLanguage(next, storage);
    },
    [storage],
  );

  // Tell the browser and screen readers which language the page is in.
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);

  const t = useCallback<TFunction>((key, params) => translate(language, key, params), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
