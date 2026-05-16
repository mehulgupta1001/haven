import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
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
import { Eye, Inbox, ChevronRight, Lock, Shield } from 'lucide-react-native';

/** Griffin / FCA: firm page URL as published by Griffin (`griffin.com/company-facts`). */
const GRIFFIN_FCA_FIRM_REF_URL =
  'https://register.fca.org.uk/s/firm?id=0014G00002uxwpEQAQ';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HavenHome'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h <= 11) return 'Good morning';
  if (h >= 12 && h <= 16) return 'Good afternoon';
  if (h >= 17 && h <= 21) return 'Good evening';
  return 'Good night';
}

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
  const [parentalViewMode, setParentalViewMode] = useState(false);

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

  const greeting = timeOfDayGreeting();
  const nameTrimmed = profile?.displayName?.trim();
  const firstName = nameTrimmed ? nameTrimmed.split(/\s+/)[0] : undefined;
  const headline = firstName ? `${greeting}, ${firstName}` : 'Welcome to Haven';

  const openGriffinFcaRegistration = async () => {
    try {
      const supported = await Linking.canOpenURL(GRIFFIN_FCA_FIRM_REF_URL);
      if (supported) await Linking.openURL(GRIFFIN_FCA_FIRM_REF_URL);
      else Alert.alert('Unable to open', 'Cannot open this link on this device.');
    } catch {
      Alert.alert('Unable to open', 'Something went wrong opening the FCA Register.');
    }
  };

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
          <Text style={[styles.title, { color: colors.navy }]}>{headline}</Text>
          <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
            {"Here's your financial snapshot."}
          </Text>
        </View>

        {summary ? (
          <GlobalBalanceCard balanceGbp={summary.availableBalanceGbp} />
        ) : (
          <View style={[styles.skeleton, { backgroundColor: colors.border }]} />
        )}

        <Pressable
          onPress={() => navigation.navigate('ParentView')}
          style={({ pressed }) => [
            styles.parentViewButton,
            { borderColor: colors.navy, opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Parent view read-only reassurance screen"
        >
          <Eye color={colors.navy} size={20} strokeWidth={2} />
          <Text style={[styles.parentViewButtonLabel, { color: colors.navy }]}>Parent View</Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.navy }]}>Recent transactions</Text>
        <View style={[styles.txCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          {tx.length === 0 ? (
            <View style={styles.txEmpty}>
              <Inbox color={colors.inkTertiary} size={32} />
              <Text style={[styles.txEmptyTitle, { color: colors.inkSecondary }]}>No transactions yet</Text>
              <Text style={[styles.txEmptySubtitle, { color: colors.inkTertiary }]}>
                Share your account details with your parents to receive your first transfer.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('ReceiveMoney')}
                style={({ pressed }) => [
                  styles.txEmptyButton,
                  { borderColor: colors.navy, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={[styles.txEmptyButtonText, { color: colors.navy }]}>
                  Share account details →
                </Text>
              </Pressable>
            </View>
          ) : (
            tx.map((t, i) => (
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
            ))
          )}
        </View>

        <View style={styles.sectionLabelRow}>
          <Text style={[styles.sectionLabel, { color: colors.navy }]}>Your arrival checklist</Text>
        </View>

        <View style={[styles.checklistCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <ChecklistRow
            title="UK SIM or eSIM ordered"
            description="Arrive connected — parents can reach you on a UK number."
            complete
          />
          <ChecklistRow
            title="Haven account & verification"
            description="Your university offer and identity check are complete — you're ready for UK banking."
            complete
          />
          <ChecklistRow
            title="Inbound transfer from parents"
            description="Share your Haven details from the Receive tab so family can send your first deposit."
            complete={false}
            onPress={() => navigation.navigate('ReceiveMoney')}
            isLast
          />
        </View>

        <CreditJourneyWidget refreshToken={creditKey} />

        <Text style={[styles.sectionLabel, { color: colors.navy, marginBottom: 4 }]}>Privacy & Security</Text>
        <View style={[styles.privacyCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <View style={styles.privacyRow}>
            <Shield color={colors.navy} size={22} strokeWidth={2} />
            <View style={styles.privacyRowText}>
              <Text style={[styles.privacyTitle, { color: colors.navy }]}>Data Encryption</Text>
              <Text style={[styles.privacySub, { color: colors.inkSecondary }]}>
                Your data is encrypted with AES-256 at rest and in transit
              </Text>
            </View>
          </View>
          <View style={[styles.privacyDivider, { backgroundColor: colors.border }]} />

          <View style={styles.privacyRow}>
            <Lock color={colors.navy} size={22} strokeWidth={2} />
            <View style={[styles.privacyRowText, { flexShrink: 1 }]}>
              <Text style={[styles.privacyTitle, { color: colors.navy }]}>Parental View Mode</Text>
              <Text style={[styles.privacySub, { color: colors.inkSecondary }]}>
                Allow family to see balance and rent status only
              </Text>
            </View>
            <Switch
              value={parentalViewMode}
              onValueChange={setParentalViewMode}
              trackColor={{ false: colors.border, true: colors.emerald }}
              thumbColor={colors.paper}
            />
          </View>
          <View style={[styles.privacyDivider, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={() => void openGriffinFcaRegistration()}
            style={({ pressed }) => [styles.privacyRowPress, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Shield color={colors.emerald} size={22} strokeWidth={2} />
            <View style={[styles.privacyRowText, { flexShrink: 1 }]}>
              <Text style={[styles.privacyTitle, { color: colors.navy }]}>FCA Registration</Text>
              <Text style={[styles.privacySub, { color: colors.inkSecondary }]}>
                View Griffin's FCA registration and safeguarding details
              </Text>
            </View>
            <ChevronRight color={colors.navy} size={22} />
          </Pressable>
        </View>

        <TrustBadgeFooter />

        <Text style={[styles.complianceFooter, { color: colors.inkTertiary }]}>
          Financial services provided via Griffin Bank (FCA Regulated, Firm Ref: 970920). Vetted for UCL Student
          Enterprise Pilot. FSCS Protected up to £85,000.
        </Text>

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
  parentViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  parentViewButtonLabel: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  sectionLabelRow: { gap: 4 },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  txCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  txEmpty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  txEmptyTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  txEmptySubtitle: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  txEmptyButton: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  txEmptyButtonText: { fontSize: 14, fontWeight: '700' },
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
  privacyCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  privacyRowPress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  privacyDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  privacyRowText: { flex: 1, gap: 4 },
  privacyTitle: { fontSize: 16, fontWeight: '700' },
  privacySub: { fontSize: 13, lineHeight: 18 },
  complianceFooter: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
