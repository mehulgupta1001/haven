import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '../theme';

/** Mock parent view — paid rent state; switch to preview “due” UI by toggling constant during design. */
const RENT_PAID = true;

/**
 * Read-only reassurance view for guardians abroad: balance rent and recent inflows only.
 */
export function ParentViewScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.paperWarm }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.trustBanner, { backgroundColor: colors.emeraldMuted }]}>
          <Text style={[styles.trustBannerText, { color: colors.emeraldDark }]}>
            Protected by Griffin Bank (FCA Regulated) · FSCS Protected up to £85,000
          </Text>
        </View>

        <Text style={[styles.greeting, { color: colors.navy }]}>{'Ahmed is doing well financially.'}</Text>

        <View style={[styles.balanceCard, { backgroundColor: colors.navy, borderColor: colors.navyLight }]}>
          <Text style={[styles.balanceLabel, { color: colors.paper }]}>CURRENT BALANCE</Text>
          <Text style={[styles.balanceAmount, { color: colors.paper }]}>£1,247.63</Text>
          <Text style={[styles.balanceSub, { color: colors.paper }]}>Last updated just now</Text>
        </View>

        <View style={[styles.rentCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          {RENT_PAID ? (
            <>
              <CheckCircle2 color={colors.emerald} size={40} strokeWidth={2.2} />
              <View style={styles.rentTextCol}>
                <Text style={[styles.rentTitlePaid, { color: colors.emerald }]}>Rent Paid</Text>
                <Text style={[styles.rentSubtitle, { color: colors.inkSecondary }]}>
                  UCL Accommodation · £820.00 · 2 May 2026
                </Text>
              </View>
            </>
          ) : (
            <>
              <Clock color={colors.amber} size={40} strokeWidth={2.2} />
              <View style={styles.rentTextCol}>
                <Text style={[styles.rentTitleDue, { color: colors.amber }]}>Rent Due in 12 days</Text>
                <Text style={[styles.rentSubtitle, { color: colors.inkSecondary }]}>
                  UCL Accommodation · £820.00 due 1 June 2026
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.transferBlock}>
          <Text style={[styles.transferLabel, { color: colors.inkSecondary }]}>Last transfer received</Text>
          <Text style={[styles.transferValue, { color: colors.navy }]}>
            +£1,500.00 from Dad · 28 April 2026
          </Text>
        </View>

        <View style={styles.weekSummary}>
          <Text style={[styles.weekLine, { color: colors.inkSecondary }]}>
            {'Spending this week: £94.20'}
          </Text>
          <Text style={[styles.weekLine, { color: colors.inkSecondary }]}>{'Last week: £87.40'}</Text>
        </View>

        <Text style={[styles.reassuranceFooter, { color: colors.inkTertiary }]}>
          This is a secure, read-only view.{'\n'}No account actions can be taken from this screen.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  trustBanner: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  trustBannerText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  greeting: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 30,
  },
  balanceCard: {
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    alignSelf: 'stretch',
  },
  balanceLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.75,
    includeFontPadding: false,
  },
  balanceSub: {
    fontSize: 13,
    opacity: 0.7,
  },
  rentCard: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  rentTextCol: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  rentTitlePaid: {
    fontSize: 18,
    fontWeight: '700',
  },
  rentTitleDue: {
    fontSize: 18,
    fontWeight: '700',
  },
  rentSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  transferBlock: {
    marginTop: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  transferLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  transferValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  weekSummary: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  weekLine: {
    fontSize: 14,
    textAlign: 'center',
  },
  reassuranceFooter: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    lineHeight: 18,
  },
});
