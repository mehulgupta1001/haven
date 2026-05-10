import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FiatCurrencyCode, SupportedFiat } from '../services/types';
import { getMockGbpToFiatRate, currencyFractionDigits } from '../services/fxRatesMock';

export type DisplayCurrencyMode = 'GBP' | 'HOME';

type CurrencyContextValue = {
  homeCurrency: FiatCurrencyCode;
  setHomeCurrency: (c: FiatCurrencyCode) => void;
  displayMode: DisplayCurrencyMode;
  setDisplayMode: (m: DisplayCurrencyMode) => void;
  formatGbpAmount: (amountGbp: string) => string;
  activeCurrencyCode: SupportedFiat;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function parseAmount(amount: string): number {
  const n = Number.parseFloat(amount.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number, currency: SupportedFiat): string {
  const min = currencyFractionDigits(currency);
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: min,
      maximumFractionDigits: min,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(min)}`;
  }
}

type CurrencyProviderProps = {
  children: React.ReactNode;
  initialHomeCurrency?: FiatCurrencyCode;
};

/**
 * Global dual-currency state: home currency can be any catalog code (Wise / Currencycloud / Modulr-style coverage).
 */
export function CurrencyProvider({
  children,
  initialHomeCurrency = 'MYR',
}: CurrencyProviderProps) {
  const [homeCurrency, setHomeCurrency] = useState<FiatCurrencyCode>(initialHomeCurrency);
  const [displayMode, setDisplayMode] = useState<DisplayCurrencyMode>('GBP');

  const formatGbpAmount = useCallback(
    (amountGbp: string) => {
      const gbp = parseAmount(amountGbp);
      if (displayMode === 'GBP') {
        return formatNumber(gbp, 'GBP');
      }
      const rate = getMockGbpToFiatRate(homeCurrency);
      return formatNumber(gbp * rate, homeCurrency);
    },
    [displayMode, homeCurrency],
  );

  const activeCurrencyCode: SupportedFiat =
    displayMode === 'GBP' ? 'GBP' : homeCurrency;

  const value = useMemo(
    () => ({
      homeCurrency,
      setHomeCurrency,
      displayMode,
      setDisplayMode,
      formatGbpAmount,
      activeCurrencyCode,
    }),
    [homeCurrency, displayMode, formatGbpAmount],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return ctx;
}

/** Re-export for UI that shows “1 GBP ≈ …” without importing the service directly */
export { getMockGbpToFiatRate } from '../services/fxRatesMock';
