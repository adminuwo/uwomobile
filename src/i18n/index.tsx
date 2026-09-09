import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { bn } from './locales/bn';
import { pa } from './locales/pa';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { SUPPORTED_LANGUAGES } from './languages';
import { LanguageCode, LanguageInfo } from './types';
import { secureStorage } from '../services/secureStore';
import { preferencesApi } from '../api/preferences';

export * from './types';
export * from './languages';

const STORAGE_KEY = 'uwo_language';

const dictionaries: Record<string, any> = {
  en,
  hi,
  mr,
  gu,
  bn,
  pa,
  ta,
  te,
};

interface I18nContextType {
  language: LanguageCode;
  currentLanguageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  syncWithServer: () => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Load local cache immediately on startup
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await secureStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLanguageState(stored);
        }
      } catch (err) {
        console.warn('[i18n] Failed to load cached language:', err);
      }
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = async (code: LanguageCode) => {
    setLanguageState(code);
    await secureStorage.setItem(STORAGE_KEY, code);

    // Sync to backend in background
    try {
      await preferencesApi.updatePreferences({ language: code });
    } catch (err) {
      console.log('[i18n] Backend language sync skipped/failed:', err);
    }
  };

  const syncWithServer = async () => {
    try {
      const serverPrefs = await preferencesApi.getPreferences();
      if (serverPrefs && serverPrefs.language) {
        setLanguageState(serverPrefs.language);
        await secureStorage.setItem(STORAGE_KEY, serverPrefs.language);
      }
    } catch (err) {
      console.log('[i18n] Could not sync language from server:', err);
    }
  };

  // Translation lookup with fallback to English then key itself
  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    
    // 1. Try active language dictionary
    let result: any = dictionaries[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    // 2. Fallback to English dictionary if not found in active language
    if (result === undefined || typeof result !== 'string') {
      result = dictionaries.en;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          result = undefined;
          break;
        }
      }
    }

    // 3. Fallback to keyPath itself if still not found
    if (result === undefined || typeof result !== 'string') {
      return keyPath;
    }

    // Interpolate params (e.g. {{name}})
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }, result);
    }

    return result;
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <I18nContext.Provider
      value={{
        language,
        currentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
        syncWithServer,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
