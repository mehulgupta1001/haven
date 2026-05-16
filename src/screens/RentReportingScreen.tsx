import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { creditService, type OpenBankingConnectionStep } from '../services';
import { Check, Link2, Building2 } from 'lucide-react-native';

const STEPS: { key: OpenBankingConnectionStep; label: string; detail: string }[] = [
  {
    key: 'select_provider',
    label: 'Select your UK current account',
    detail: 'Choose the account your rent leaves — PSD2 read-only access.',
  },
  {
    key: 'authorize',
    label: 'Authorize with your bank',
    detail: 'You approve a secure redirect; Haven never sees login credentials.',
  },
  {
    key: 'confirmed',
    label: 'Mandate confirmed',
    detail: 'We match standing orders to your lease and begin reporting to the bureau.',
  },
];

/**
 * Simulates Open Banking rent-reporting linkage — swap modal / WebView for production OB journey.
 */
export function RentReportingScreen() {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const advance = async () => {
    setBusy(true);
    try {
      const step = STEPS[activeIndex].key;
      await creditService.simulateOpenBankingStep(step);
      setActiveIndex((i) => Math.min(i + 1, STEPS.length - 1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['bottom']}>
      <View style={styles.pad}>
        <Text style={[styles.lead, { color: colors.inkSecondary }]}>
          Rent reporting uses regulated Open Banking to verify recurring accommodation payments—no manual uploads.
        </Text>

        {STEPS.map((s, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <View
              key={s.key}
              style={[
                styles.step,
                {
                  borderColor: current ? colors.navy : colors.border,
                  backgroundColor: colors.paper,
                },
              ]}
            >
              <View style={styles.stepHeader}>
                {done ? (
                  <Check color={colors.emerald} size={22} strokeWidth={2.5} />
                ) : current ? (
                  <Link2 color={colors.navy} size={22} strokeWidth={2} />
                ) : (
                  <Building2 color={colors.inkTertiary} size={22} strokeWidth={2} />
                )}
                <Text style={[styles.stepTitle, { color: colors.navy }]}>{s.label}</Text>
              </View>
              <Text style={[styles.stepDetail, { color: colors.inkSecondary }]}>{s.detail}</Text>
            </View>
          );
        })}

        <Pressable
          onPress={advance}
          disabled={busy || activeIndex >= STEPS.length - 1}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.navy,
              opacity: pressed || busy || activeIndex >= STEPS.length - 1 ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.paper }]}>
            {activeIndex >= STEPS.length - 1 ? 'Connection complete' : 'Continue at your bank'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, gap: 14 },
  lead: { fontSize: 15, lineHeight: 22, marginBottom: 4 },
  step: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  stepDetail: { fontSize: 14, lineHeight: 20 },
  cta: { marginTop: 8, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700' },
});
