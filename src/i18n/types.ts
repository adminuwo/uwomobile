export type LanguageCode =
  | 'en'
  | 'hi'
  | 'mr'
  | 'gu'
  | 'bn'
  | 'pa'
  | 'ta'
  | 'te'
  | string;

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

export type TranslationDictionary = Record<string, string | Record<string, any>>;
