import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { useCurrency, type DisplayCurrencyMode } from '../context/CurrencyContext';
import type { FiatCurrencyCode } from '../data/fiatCurrencies';
import { getMockGbpToFiatRate, currencyFractionDigits } from '../services/fxRatesMock';
import { ChevronRight } from 'lucide-react-native';
import { FiatCurrencyPickerSheet } from './FiatCurrencyPickerSheet';

type Props = {
  balanceGbp: string;
};

/**
 * Primary balance surface with explicit dual-currency controls for guardians.
 */
export function GlobalBalanceCard({ balanceGbp }: Props) {
  const { colors } = useTheme();
  const {
    displayMode,
    setDisplayMode,
    homeCurrency,
    setHomeCurrency,
    formatGbpAmount,
    activeCurrencyCode,
  } = useCurrency();
  const [pickerOpen, setPickerOpen] = useState(false);

  const toggleMode = (mode: DisplayCurrencyMode) => setDisplayMode(mode);

  const rate = getMockGbpToFiatRate(homeCurrency);
  const maxFrac = currencyFractionDigits(homeCurrency);

  return (
    <View style={[styles.card, { backgroundColor: colors.navy, borderColor: colors.navyLight }]}>
      <Text style={[styles.label, { color: colors.paper }]}>Global balance</Text>
      <Text style={[styles.amount, { color: colors.paper }]}>{formatGbpAmount(balanceGbp)}</Text>
      <Text style={[styles.sub, { color: colors.paper, opacity: 0.85 }]}>
        {displayMode === 'GBP'
          ? `Reference: 1 GBP ≈ ${homeCurrency} ${rate.toLocaleString('en-GB', { maximumFractionDigits: maxFrac })}`
          : `Held in GBP · displayed in ${homeCurrency}`}
      </Text>

      <View style={styles.toggleRow}>
        <ToggleChip
          label="GBP"
          active={displayMode === 'GBP'}
          onPress={() => toggleMode('GBP')}
          variant="onDark"
        />
        <ToggleChip
          label="Home"
          active={displayMode === 'HOME'}
          onPress={() => toggleMode('HOME')}
          variant="onDark"
        />
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.homePicker,
            { borderColor: colors.paper, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.homePickerText, { color: colors.paper }]} numberOfLines={1}>
            {homeCurrency}
          </Text>
          <ChevronRight color={colors.paper} size={18} />
        </Pressable>
      </View>

      <Text style={[styles.fxDisclaimer, { color: colors.paper }]}>
        Indicative desktop rate (Wise / Currencycloud-style coverage in catalogue). Settles in{' '}
        {activeCurrencyCode === 'GBP' ? 'GBP' : `${homeCurrency} equivalent`}.
      </Text>

      <FiatCurrencyPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedCode={homeCurrency}
        onSelect={(c: FiatCurrencyCode) => setHomeCurrency(c)}
        title="Home / receive currency"
      />
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
  variant,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  variant: 'onDark';
}) {
  const { colors } = useTheme();
  const bg =
    variant === 'onDark'
      ? active
        ? colors.emerald
        : 'transparent'
      : active
        ? colors.emerald
        : colors.paperWarm;
  const fg =
    variant === 'onDark' ? (active ? colors.paper : colors.paper) : colors.ink;
  const border =
    variant === 'onDark' ? (active ? colors.emerald : colors.paper) : colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontWeight: '700', fontSize: 14 },
  homePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
    maxWidth: 130,
  },
  homePickerText: { fontWeight: '700', fontSize: 14, flex: 1 },
  fxDisclaimer: {
    fontSize: 11,
    opacity: 0.75,
    marginTop: 4,
  },
});
