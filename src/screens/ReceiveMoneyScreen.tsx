import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { transactionService } from '../services';
import type { AccountSummary } from '../services/types';
import { Bell, CheckCircle2, Share2 } from 'lucide-react-native';

/**
 * Flow 3 — Receiving money from parents (screens 7–9 in the blueprint): share details → notification → arrived.
 */
export function ReceiveMoneyScreen() {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [parentSent, setParentSent] = useState(false);
  const [arrived, setArrived] = useState(false);

  const load = useCallback(async () => {
    const s = await transactionService.getAccountSummary();
    setSummary(s);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[styles.title, { color: colors.navy }]}>Receive from parents</Text>
        <Text style={[styles.lead, { color: colors.inkSecondary }]}>
          Send these UK account details to your parents so they can fund you from their home bank.
        </Text>

        {summary ? (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.paper }]}>
            <View style={styles.shareRow}>
              <Share2 color={colors.navy} size={22} />
              <Text style={[styles.cardTitle, { color: colors.navy }]}>Share payment details</Text>
            </View>
            <Row label="Account name" value="Haven · Student GBP" colors={colors} />
            <Row label="Sort code" value={summary.sortCode} colors={colors} />
            <Row label="Account number" value={`••••${summary.accountNumberLast4}`} colors={colors} />
            <Text style={[styles.hint, { color: colors.inkTertiary }]}>
              Reference: use your Haven ID in the payment reference so we can match the payment to your account.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setParentSent(true)}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Bell color={colors.paper} size={20} />
          <Text style={[styles.btnText, { color: colors.paper }]}>Parents have sent money</Text>
        </Pressable>

        {parentSent ? (
          <View style={[styles.notice, { borderColor: colors.emerald, backgroundColor: colors.emeraldMuted }]}>
            <Bell color={colors.emeraldDark} size={22} />
            <Text style={[styles.noticeText, { color: colors.ink }]}>
              We’ve noticed an incoming transfer from your parents’ bank — Faster Payments usually clear within minutes.
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            setArrived(true);
            void load();
          }}
          disabled={!parentSent}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: colors.emerald,
              opacity: !parentSent || pressed ? 0.65 : 1,
            },
          ]}
        >
          <CheckCircle2 color={colors.paper} size={20} />
          <Text style={[styles.btnText, { color: colors.paper }]}>Funds have arrived</Text>
        </Pressable>

        {arrived ? (
          <View style={[styles.notice, { borderColor: colors.border, backgroundColor: colors.paper }]}>
            <CheckCircle2 color={colors.emerald} size={22} />
            <Text style={[styles.noticeText, { color: colors.ink }]}>
              Your deposit is complete — pull to refresh on Home if your balance hasn’t updated yet.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.inkTertiary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  lead: { fontSize: 14, lineHeight: 21 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  row: { gap: 4 },
  rowLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  rowValue: { fontSize: 17, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  btnText: { fontSize: 16, fontWeight: '800' },
  notice: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
