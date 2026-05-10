import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { ShieldCheck } from 'lucide-react-native';

/** Institutional partner name for trust copy — swap for live sponsor bank after licensing */
const MOCK_PARTNER_BANK = 'Meridian Custody Bank (UK)';

/**
 * Persistent reassurance strip for fee-paying guardian cohorts who prioritise fund safety.
 */
export function TrustBadgeFooter() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.paper, borderColor: colors.border },
      ]}
    >
      <ShieldCheck color={colors.emerald} size={22} strokeWidth={2} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.navy }]}>Safeguarding you can explain to parents</Text>
        <Text style={[styles.body, { color: colors.inkSecondary }]}>
          Client money is held in segregated accounts at {MOCK_PARTNER_BANK}. In production, marketing and legal copy
          would match your sponsor bank’s customer-facing materials — this block is a short placeholder for guardians.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  textCol: { flex: 1, gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 13, lineHeight: 19 },
});
