import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { creditService, type CreditJourneyState } from '../services';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Landmark, ChevronRight } from 'lucide-react-native';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HavenHome'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const STATUS_COPY: Record<CreditJourneyState['rentReportingStatus'], { title: string; detail: string }> = {
  not_started: {
    title: 'Rent reporting',
    detail: 'Link your rental payments to build UK credit history before you graduate.',
  },
  linking_bank: {
    title: 'Connecting your bank',
    detail: 'Open Banking in progress — we are verifying your rent mandate securely.',
  },
  awaiting_landlord: {
    title: 'Landlord confirmation',
    detail: 'Awaiting accommodation provider to confirm lease data (typically 2–3 days).',
  },
  reporting_active: {
    title: 'Reporting active',
    detail: 'Rental data is flowing to Equifax via Haven’s regulated rent-reporting rail.',
  },
};

type Props = {
  /** Increment from parent (e.g. pull-to-refresh) to reload journey state from the mock service */
  refreshToken?: number;
};

/**
 * Credit-builder entrypoint — routes students into the Rent Reporting / Open Banking simulation.
 */
export function CreditJourneyWidget({ refreshToken }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const [state, setState] = useState<CreditJourneyState | null>(null);

  useEffect(() => {
    let mounted = true;
    setState(null);
    creditService.getCreditJourney().then((j) => {
      if (mounted) setState(j);
    });
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  const loading = !state;
  const copy = state ? STATUS_COPY[state.rentReportingStatus] : STATUS_COPY.not_started;

  return (
    <View style={[styles.card, { backgroundColor: colors.paper, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Landmark color={colors.navy} size={22} strokeWidth={2} />
        <Text style={[styles.header, { color: colors.navy }]}>Credit journey</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.navy} style={{ marginVertical: 12 }} />
      ) : (
        <>
          <Text style={[styles.title, { color: colors.ink }]}>{copy.title}</Text>
          <Text style={[styles.detail, { color: colors.inkSecondary }]}>{copy.detail}</Text>
          {state?.equifaxPartnerReference ? (
            <Text style={[styles.ref, { color: colors.inkTertiary }]}>Ref: {state.equifaxPartnerReference}</Text>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('RentReporting')}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.navy, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.paper }]}>Continue rent reporting</Text>
            <ChevronRight color={colors.paper} size={18} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  header: { fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  detail: { fontSize: 14, lineHeight: 20 },
  ref: { fontSize: 12, marginTop: 4 },
  cta: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
});
