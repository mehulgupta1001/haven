import type { FiatCurrencyCode } from '../data/fiatCurrencies';

/**
 * Mock “mid-market” GBP → fiat for demo UI. Live product would stream Wise / Currencycloud / Modulr rates.
 * Codes without an explicit row use a deterministic fallback so every catalog code renders a number.
 */
const EXPLICIT_GBP_PER_UNIT: Partial<Record<FiatCurrencyCode, number>> = {
  GBP: 1,
  USD: 1.273,
  EUR: 1.172,
  AUD: 1.938,
  NZD: 2.12,
  CAD: 1.731,
  CHF: 1.118,
  JPY: 195.2,
  CNY: 9.14,
  HKD: 9.91,
  SGD: 1.712,
  SEK: 13.42,
  NOK: 13.85,
  DKK: 8.75,
  PLN: 5.02,
  CZK: 28.9,
  HUF: 455,
  RON: 5.78,
  BGN: 2.29,
  ISK: 181,
  TRY: 41.2,
  ILS: 4.72,
  AED: 4.65,
  SAR: 4.76,
  QAR: 4.63,
  KWD: 0.392,
  BHD: 0.478,
  OMR: 0.489,
  JOD: 0.9,
  INR: 110.4,
  PKR: 355,
  BDT: 152.3,
  LKR: 395,
  NPR: 177,
  MYR: 5.87,
  THB: 45.1,
  IDR: 20150,
  PHP: 72.4,
  VND: 32100,
  KHR: 5050,
  MMK: 4200,
  BND: 1.71,
  MOP: 7.98,
  TWD: 40.2,
  KRW: 1710,
  MNT: 4700,
  NGN: 1985,
  GHS: 19.4,
  KES: 186,
  UGX: 4850,
  TZS: 3200,
  ZAR: 23.1,
  EGP: 60.2,
  MAD: 12.85,
  MUR: 58.4,
  XOF: 765,
  XAF: 765,
  RWF: 1680,
  ZMW: 29.5,
  BWP: 17.2,
  MXN: 21.5,
  BRL: 6.42,
  CLP: 1180,
  COP: 4950,
  PEN: 4.75,
  UYU: 50.2,
  ARS: 1180,
  JMD: 199,
  BBD: 2.55,
  TTD: 8.62,
  XCD: 3.43,
  RUB: 118,
  UAH: 51.2,
  GEL: 3.42,
  KZT: 580,
  AMD: 495,
  AZN: 2.16,
  UZS: 15800,
  FJD: 2.85,
  PGK: 5.1,
  WST: 3.45,
  TOP: 2.98,
  CDF: 3450,
  ETB: 162,
  DZD: 171,
  TND: 3.95,
  IQD: 1660,
  LBP: 113800,
  HRK: 8.55,
};

const ZERO_DECIMAL: ReadonlySet<string> = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'ISK',
  'JPY',
  'KMF',
  'KRW',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
  'IDR',
  'NGN',
  'CVE',
]);

/** Deduped zero-decimal for Intl */
export function currencyFractionDigits(code: FiatCurrencyCode): number {
  if (code === 'GBP') return 2;
  if (ZERO_DECIMAL.has(code)) return 0;
  return 2;
}

function deterministicRate(code: string): number {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (h >>> 0) % 100_000;
  return 0.25 + (n / 100_000) * 520;
}

export function getMockGbpToFiatRate(code: FiatCurrencyCode): number {
  const explicit = EXPLICIT_GBP_PER_UNIT[code];
  if (explicit != null && explicit > 0) return explicit;
  return deterministicRate(code);
}
