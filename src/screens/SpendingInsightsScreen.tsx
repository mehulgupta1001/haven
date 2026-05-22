import React, { useCallback, type ComponentType } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee, ShoppingBag, Train, Wifi } from 'lucide-react-native';
import { useTheme } from '../theme';

const OYSTER_URL =
  'https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/get-an-oyster-card';

const WEEKLY_SMALL_TOTAL = 47.2;

type IconProps = { color: string; size: number; strokeWidth?: number };

const CATEGORIES: {
  Icon: ComponentType<IconProps>;
  name: string;
  count: number;
  amountGbp: string;
  pct: number;
}[] = [
  { Icon: Train, name: 'Transport (TfL)', count: 12, amountGbp: '18.40', pct: 39 },
  { Icon: Coffee, name: 'Food & drink', count: 8, amountGbp: '14.60', pct: 31 },
  { Icon: ShoppingBag, name: 'Convenience stores', count: 5, amountGbp: '9.20', pct: 19 },
  { Icon: Wifi, name: 'Apps & subscriptions', count: 2, amountGbp: '5.00', pct: 11 },
];

const MOCK_TXN: { merchant: string; amount: string; when: string }[] = [
  { merchant: 'Tesco Express', amount: '£3.40', when: 'Today' },
  { merchant: 'TfL Bus', amount: '£1.75', when: 'Today' },
  { merchant: 'Pret a Manger', amount: '£4.20', when: 'Yesterday' },
  { merchant: 'TfL Tube', amount: '£2.80', when: 'Yesterday' },
  { merchant: 'Wasabi', amount: '£7.90', when: '2 days ago' },
  { merchant: "Sainsbury's Local", amount: '£5.60', when: '2 days ago' },
  { merchant: 'TfL Tube', amount: '£2.80', when: '3 days ago' },
  { merchant: 'Spotify', amount: '£5.00', when: '4 days ago' },
];

export function SpendingInsightsScreen() {
  const { colors } = useTheme();

  const openOysterGuide = useCallback(async () => {
    try {
      const ok = await Linking.canOpenURL(OYSTER_URL);
      if (ok) await Linking.openURL(OYSTER_URL);
      else Alert.alert('Unable to open', 'Cannot open this link on this device.');
    } catch {
      Alert.alert('Unable to open', 'Something went wrong opening the page.');
    }
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.pageTitle, { color: colors.navy }]}>Invisible spending</Text>
        <Text style={[styles.pageSubtitle, { color: colors.inkSecondary }]}>
          {"The small costs you don't notice — until they add up."}
        </Text>

        <View style={[styles.weeklyCard, { backgroundColor: colors.navy }]}>
          <Text style={[styles.weeklyLabel, { color: colors.paper }]}>SMALL PURCHASES THIS WEEK</Text>
          <Text style={[styles.weeklyAmount, { color: colors.paper }]}>£{WEEKLY_SMALL_TOTAL.toFixed(2)}</Text>
          <Text style={[styles.comparisonLine, { color: colors.amber }]}>
            ↑ £8.40 more than last week
          </Text>
          <Text style={[styles.weeklyFootnote, { color: colors.paper }]}>Purchases under £10 only</Text>
        </View>

        <View style={[styles.breakdownCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <Text style={[styles.breakdownTitle, { color: colors.navy }]}>Where it goes</Text>

          {CATEGORIES.map(({ Icon, name, count, amountGbp, pct }) => (
            <View key={name} style={styles.categoryBlock}>
              <View style={styles.categoryTop}>
                <View style={[styles.iconWrap, { backgroundColor: colors.paperWarm }]}>
                  <Icon color={colors.navy} size={20} strokeWidth={2} />
                </View>
                <View style={styles.categoryTextCol}>
                  <Text style={[styles.categoryName, { color: colors.ink }]}>{name}</Text>
                  <Text style={[styles.categoryCount, { color: colors.inkTertiary }]}>
                    {count} transactions
                  </Text>
                </View>
                <Text style={[styles.categoryAmt, { color: colors.ink }]}>£{amountGbp}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.emerald }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.aiCardOuter, { backgroundColor: colors.paperWarm, borderLeftColor: colors.navy }]}>
          <Text style={[styles.aiKicker, { color: colors.navy }]}>AI INSIGHT</Text>
          <Text style={[styles.aiBody, { color: colors.ink }]}>
            Your TfL spend is £18.40 this week. Switching to a monthly Travelcard (Zone 1-2, £169.70) would save you
            approximately £24 per month at your current travel frequency.
          </Text>
          <Pressable onPress={() => void openOysterGuide()} style={styles.aiLinkPress}>
            <Text style={[styles.aiLink, { color: colors.navy }]}>How to get an Oyster card →</Text>
          </Pressable>
        </View>

        <Text style={[styles.listSectionTitle, { color: colors.navy }]}>ALL SMALL PURCHASES</Text>
        <View style={[styles.txnListCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          {MOCK_TXN.map((row, idx) => (
            <View
              key={`${row.merchant}-${row.when}-${idx}`}
              style={[
                styles.txnRow,
                { borderBottomColor: colors.border },
                idx === MOCK_TXN.length - 1 && styles.txnRowLast,
              ]}
            >
              <View style={styles.txnLeft}>
                <Text style={[styles.txnMerchant, { color: colors.ink }]}>{row.merchant}</Text>
                <Text style={[styles.txnWhen, { color: colors.inkTertiary }]}>{row.when}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: colors.ink }]}>{row.amount}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.bottomNote, { color: colors.inkTertiary }]}>
          Haven tracks small purchases automatically. No manual logging needed.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 26, fontWeight: '800' },
  pageSubtitle: { fontSize: 14, lineHeight: 21, marginTop: -4 },
  weeklyCard: { borderRadius: 16, padding: 20, gap: 8 },
  weeklyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  weeklyAmount: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  comparisonLine: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  weeklyFootnote: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
  breakdownCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 18 },
  breakdownTitle: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  categoryBlock: { gap: 8 },
  categoryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextCol: { flex: 1, gap: 2 },
  categoryName: { fontSize: 15, fontWeight: '700' },
  categoryCount: { fontSize: 12, fontWeight: '600' },
  categoryAmt: { fontSize: 16, fontWeight: '700' },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2 },
  aiCardOuter: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  aiKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  aiBody: { fontSize: 14, lineHeight: 21, fontWeight: '500' },
  aiLinkPress: { alignSelf: 'flex-start', paddingVertical: 2 },
  aiLink: { fontWeight: '600', fontSize: 13 },
  listSectionTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  txnListCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txnRowLast: { borderBottomWidth: 0 },
  txnLeft: { flex: 1, paddingRight: 12 },
  txnMerchant: { fontSize: 15, fontWeight: '600' },
  txnWhen: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  txnAmount: { fontSize: 15, fontWeight: '600' },
  bottomNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
