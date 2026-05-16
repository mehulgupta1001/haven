import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { cardService } from '../services/cardService';
import { transactionService } from '../services/transactionService';
import type { HavenCardState, LedgerTransaction } from '../services/types';
import {
  CreditCard,
  Eye,
  Lock,
  RefreshCw,
  Snowflake,
  Sun,
  Wifi,
} from 'lucide-react-native';

const CAP_PRESETS = ['200.00', '400.00', '750.00', '1200.00'];

/**
 * Flow 4 — Spending: virtual card details (mock) + card controls + recent spend history.
 */
export function CardManagementScreen() {
  const { colors } = useTheme();
  const [card, setCard] = useState<HavenCardState | null>(null);
  const [tx, setTx] = useState<LedgerTransaction[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [c, list] = await Promise.all([
        cardService.getPrimaryCard(),
        transactionService.getRecentTransactions(10),
      ]);
      setCard(c);
      setTx(list.filter((t) => t.direction === 'debit'));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onFreezeToggle = async (frozen: boolean) => {
    setBusy(true);
    try {
      const c = await cardService.setFrozen(frozen);
      setCard(c);
    } finally {
      setBusy(false);
    }
  };

  const onCap = async (cap: string) => {
    setBusy(true);
    try {
      const c = await cardService.setDailySpendCapGbp(cap);
      setCard(c);
    } finally {
      setBusy(false);
    }
  };

  const onContactless = async (enabled: boolean) => {
    setBusy(true);
    try {
      const c = await cardService.setContactless(enabled);
      setCard(c);
    } finally {
      setBusy(false);
    }
  };

  const onPin = async () => {
    setBusy(true);
    try {
      const res = await cardService.requestPinReveal();
      Alert.alert('PIN', res.mockNote);
    } finally {
      setBusy(false);
    }
  };

  const onReplace = () => {
    Alert.alert(
      'Replace card',
      'We’ll cancel your current card and post a replacement. You’ll complete a quick security check in the next step.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setBusy(true);
            try {
              const ref = await cardService.requestReplacement('compromised');
              Alert.alert('Requested', `Reference ${ref.reference}`);
              await load();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (!card) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </SafeAreaView>
    );
  }

  const frozen = card.status === 'frozen';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.navy }]}>Card</Text>
        <Text style={[styles.lead, { color: colors.inkSecondary }]}>
          Your Haven Visa debit. Only the last four digits are shown here — manage freeze, limits, and wallet readiness
          below.
        </Text>

        <View style={[styles.cardVisual, { backgroundColor: colors.navy }]}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardBrand, { color: colors.paper }]}>VISA</Text>
            <CreditCard color={colors.paper} size={22} />
          </View>
          <Text style={[styles.cardPan, { color: colors.paper }]}>•••• •••• •••• {card.lastFour}</Text>
          <View style={styles.cardBottomRow}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.paper }]}>VALID THRU</Text>
              <Text style={[styles.cardValue, { color: colors.paper }]}>
                {card.expiryMonth}/{card.expiryYear.slice(-2)}
              </Text>
            </View>
            <View>
              <Text style={[styles.cardLabel, { color: colors.paper }]}>STATUS</Text>
              <Text style={[styles.cardValue, { color: frozen ? colors.amberMuted : colors.emeraldMuted }]}>
                {frozen ? 'Frozen' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.programme, { color: colors.inkSecondary }]}>{card.programmeName}</Text>

        <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              {frozen ? (
                <Snowflake color={colors.navy} size={22} />
              ) : (
                <Sun color={colors.navy} size={22} />
              )}
              <View>
                <Text style={[styles.panelTitle, { color: colors.navy }]}>Instant freeze</Text>
                <Text style={[styles.panelSub, { color: colors.inkSecondary }]}>
                  Blocks new contactless and online card purchases while frozen.
                </Text>
              </View>
            </View>
            <Switch
              value={frozen}
              onValueChange={onFreezeToggle}
              disabled={busy}
              trackColor={{ false: colors.border, true: colors.emerald }}
            />
          </View>
        </View>

        <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <Wifi color={colors.navy} size={22} />
              <View>
                <Text style={[styles.panelTitle, { color: colors.navy }]}>Contactless</Text>
                <Text style={[styles.panelSub, { color: colors.inkSecondary }]}>
                  Disabled automatically while frozen.
                </Text>
              </View>
            </View>
            <Switch
              value={card.contactlessEnabled && !frozen}
              onValueChange={onContactless}
              disabled={busy || frozen}
              trackColor={{ false: colors.border, true: colors.emerald }}
            />
          </View>
        </View>

        <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <Text style={[styles.panelTitle, { color: colors.navy }]}>Daily POS cap (GBP)</Text>
          <Text style={[styles.panelSub, { color: colors.inkSecondary, marginBottom: 12 }]}>
            Soft limit for day-to-day card spending — ATM withdrawals and scheduled payments may follow different caps.
          </Text>
          <Text style={[styles.capValue, { color: colors.emerald }]}>£{card.dailySpendCapGbp}</Text>
          <View style={styles.capRow}>
            {CAP_PRESETS.map((cap) => (
              <Pressable
                key={cap}
                onPress={() => onCap(cap)}
                disabled={busy || frozen}
                style={({ pressed }) => [
                  styles.capChip,
                  {
                    borderColor: card.dailySpendCapGbp === cap ? colors.emerald : colors.border,
                    backgroundColor: card.dailySpendCapGbp === cap ? colors.emeraldMuted : colors.paperWarm,
                    opacity: pressed || busy || frozen ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontWeight: '700', color: colors.navy }}>£{cap}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable
            onPress={onPin}
            disabled={busy || frozen}
            style={({ pressed }) => [
              styles.btn,
              { borderColor: colors.navy, opacity: pressed || busy || frozen ? 0.75 : 1 },
            ]}
          >
            <Eye color={colors.navy} size={20} />
            <Text style={[styles.btnText, { color: colors.navy }]}>Reveal PIN</Text>
          </Pressable>
          <Pressable
            onPress={onReplace}
            disabled={busy}
            style={({ pressed }) => [
              styles.btn,
              { borderColor: colors.crimson, opacity: pressed || busy ? 0.75 : 1 },
            ]}
          >
            <RefreshCw color={colors.crimson} size={20} />
            <Text style={[styles.btnText, { color: colors.crimson }]}>Replace card</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.navy }]}>Recent card spend</Text>
        <View style={[styles.txCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          {tx.length === 0 ? (
            <Text style={[styles.panelSub, { color: colors.inkTertiary, padding: 16 }]}>
              No card purchases yet — add funds from Home or Receive, then chip and contactless transactions will appear
              here.
            </Text>
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
                  <Text style={[styles.txDate, { color: colors.inkTertiary }]}>{t.category} · {t.occurredAt.slice(0, 10)}</Text>
                </View>
                <Text style={[styles.txAmt, { color: colors.ink }]}>−£{t.amountGbp}</Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.walletBlock, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <Text style={[styles.panelTitle, { color: colors.navy }]}>Apple Pay / Google Pay</Text>
          <Text style={[styles.panelSub, { color: colors.inkSecondary }]}>
            Add your card to Apple Pay or Google Pay after we’ve finished verifying your account. Apple Wallet:{' '}
            {card.applePayReady ? 'ready' : 'pending'} · Google Wallet: {card.googlePayReady ? 'ready' : 'pending'}.
          </Text>
        </View>

        <View style={[styles.infoBlock, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <Lock color={colors.navy} size={20} />
          <Text style={[styles.infoText, { color: colors.inkSecondary }]}>
            Your full card number and PIN stay encrypted on your device. Haven only surfaces the essentials you need to
            pay safely — including masking your card number wherever it appears.
          </Text>
        </View>

        <Pressable
          onPress={() => void load()}
          disabled={busy}
          style={({ pressed }) => [styles.refresh, { opacity: pressed || busy ? 0.8 : 1 }]}
        >
          <Text style={{ color: colors.navy, fontWeight: '700' }}>Refresh card state</Text>
        </Pressable>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  lead: { fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
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
  cardVisual: { borderRadius: 18, padding: 22, gap: 18 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { fontWeight: '900', letterSpacing: 2 },
  cardPan: { fontSize: 22, letterSpacing: 2 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontSize: 10, opacity: 0.85 },
  cardValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  programme: { fontSize: 12, lineHeight: 17 },
  panel: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  panelTitle: { fontSize: 16, fontWeight: '800' },
  panelSub: { fontSize: 13, lineHeight: 18 },
  capValue: { fontSize: 28, fontWeight: '800' },
  capRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  capChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  btnRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  btn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  btnText: { fontWeight: '700', fontSize: 14 },
  walletBlock: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  infoBlock: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  refresh: { alignSelf: 'center', padding: 12 },
});
