import EnglishLocaleCharts from "./en.json";

declare type LocaleType = typeof EnglishLocaleCharts;
export interface LocaleRegistry {
  base: LocaleType;
}
declare type RegistryKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];
export declare type LocaleKeys = RegistryKeys<LocaleRegistry>;

const locale = { ...EnglishLocaleCharts } as const;

export default locale;
