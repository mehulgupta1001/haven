import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { transactionService, type AccountSummary, type LedgerTransaction } from '../services';
import { GlobalBalanceCard } from '../components/GlobalBalanceCard';
import { TrustBadgeFooter } from '../components/TrustBadgeFooter';
import { CreditJourneyWidget } from '../components/CreditJourneyWidget';
import { ChecklistRow } from '../components/ChecklistRow';
import { useAuth } from '../context/AuthContext';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HavenHome'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/**
 * Flow 2 — Home: balance, recent transactions, quick pathways into other flows (blueprint).
 */
export function HavenDashboardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [tx, setTx] = useState<LedgerTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [creditKey, setCreditKey] = useState(0);

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([
      transactionService.getAccountSummary(),
      transactionService.getRecentTransactions(6),
    ]);
    setSummary(s);
    setTx(list);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
      setCreditKey((k) => k + 1);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} />
        }
      >
        <View style={styles.hero}>
          <Text style={[styles.kicker, { color: colors.emerald }]}>
            {profile?.universityName ?? 'Your university'}
          </Text>
          <Text style={[styles.title, { color: colors.navy }]}>Home</Text>
          <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
            {profile?.displayName
              ? `${profile.displayName} — ${profile.email}`
              : 'Balance, recent activity, and next steps.'}
          </Text>
        </View>

        {summary ? (
          <GlobalBalanceCard balanceGbp={summary.availableBalanceGbp} />
        ) : (
          <View style={[styles.skeleton, { backgroundColor: colors.border }]} />
        )}

        <Text style={[styles.sectionLabel, { color: colors.navy }]}>Recent transactions</Text>
        <View style={[styles.txCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          {tx.map((t, i) => (
            <View
              key={t.id}
              style={[
                styles.txRow,
                { borderBottomColor: colors.border },
                i === tx.length - 1 && styles.txRowLast,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.txTitle, { color: colors.ink }]}>{t.title}</Text>
                <Text style={[styles.txDate, { color: colors.inkTertiary }]}>{t.occurredAt.slice(0, 10)}</Text>
              </View>
              <Text
                style={[
                  styles.txAmt,
                  { color: t.direction === 'credit' ? colors.emeraldDark : colors.ink },
                ]}
              >
                {t.direction === 'credit' ? '+' : '−'}£{t.amountGbp}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionLabelRow}>
          <Text style={[styles.sectionLabel, { color: colors.navy }]}>Pre-arrival</Text>
          <Text style={[styles.sectionHint, { color: colors.inkTertiary }]}>
            Checklist from your onboarding story (mock state)
          </Text>
        </View>

        <View style={[styles.checklistCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <ChecklistRow
            title="UK SIM or eSIM ordered"
            description="Arrive connected — parents can reach you on a UK number."
            complete
          />
          <ChecklistRow
            title="Haven account & verification"
            description="You completed the mock signup flow — offer letter & passport simulated."
            complete
          />
          <ChecklistRow
            title="Inbound transfer from parents"
            description="Share UK details and simulate a transfer in the Receive tab."
            complete={false}
            onPress={() => navigation.navigate('ReceiveMoney')}
            isLast
          />
        </View>

        <CreditJourneyWidget refreshToken={creditKey} />

        <TrustBadgeFooter />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, gap: 16 },
  hero: { gap: 8 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  skeleton: { height: 160, borderRadius: 16 },
  sectionLabelRow: { gap: 4 },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sectionHint: { fontSize: 13 },
  txCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txRowLast: { borderBottomWidth: 0 },
  txTitle: { fontSize: 15, fontWeight: '600' },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmt: { fontSize: 16, fontWeight: '700' },
  checklistCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});
