import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { ShieldCheck } from 'lucide-react-native';

/**
 * Reassurance strip: safeguarding and FSCS context for students and parents.
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
          Your money is held in safeguarded accounts by our FCA-regulated banking partner — protected up to £85,000
          under FSCS rules. Haven never holds your funds directly.
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
