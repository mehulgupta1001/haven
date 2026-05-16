import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Info,
  Shield,
} from 'lucide-react-native';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { mockDelay } from '../services';

type ReviewState = 'reviewing' | 'info_needed' | 'resolved' | 'escalated';

const COMPLIANCE_REF = 'HVN-CMP-449210';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ComplianceReview'>;
type Route = RouteProp<RootStackParamList, 'ComplianceReview'>;

function PulsingShieldIcon({ navyLight, paper }: { navyLight: string; paper: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 750, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View style={[styles.heroPulseOuter, { backgroundColor: navyLight, transform: [{ scale }] }]}>
      <Shield color={paper} size={32} strokeWidth={2} />
    </Animated.View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);
  return (
    <Animated.View style={[styles.timelineDot, { backgroundColor: color }, { transform: [{ scale }] }]} />
  );
}

export function ComplianceReviewScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const transferAmount = route.params?.transferAmount ?? 1500;
  const amountLabel = useMemo(() => transferAmount.toLocaleString('en-GB'), [transferAmount]);

  const [reviewState, setReviewState] = useState<ReviewState>('reviewing');
  const [senderName, setSenderName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [refCopiedFlash, setRefCopiedFlash] = useState(false);

  const openComplianceMail = () => {
    const subject = encodeURIComponent('Urgent review — HVN-CMP-449210');
    const url = `mailto:compliance@haven.app?subject=${subject}`;
    void Linking.openURL(url).catch(() =>
      Alert.alert('Unable to open email', 'No email app is available on this device.'),
    );
  };

  const onSubmitInfo = async () => {
    setSubmittingInfo(true);
    try {
      await mockDelay(2000);
      setReviewState('resolved');
    } finally {
      setSubmittingInfo(false);
    }
  };

  const shareReference = useCallback(async () => {
    try {
      const msg = COMPLIANCE_REF;
      await Share.share(Platform.OS === 'ios' ? { message: msg } : { message: msg, title: 'Haven reference' });
      setRefCopiedFlash(true);
      setTimeout(() => setRefCopiedFlash(false), 2000);
    } catch {
      Alert.alert('Reference', COMPLIANCE_REF);
    }
  }, []);

  const onContactSupport = () => {
    Alert.alert(
      'Contact support',
      'Support available 9am–6pm Mon–Fri.\n\nEmail: support@haven.app',
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={colors.navy} size={28} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.wordmark, { color: colors.navy }]}>Haven</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {reviewState === 'reviewing' ? (
          <>
            <PulsingShieldIcon navyLight={colors.navyLight} paper={colors.paper} />
            <Text style={[styles.title, { color: colors.navy, marginTop: 24 }]}>
              {"We're reviewing your transfer"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
              We noticed a large international transfer of £{amountLabel} arriving from overseas. This is completely
              normal for international students — we just need to verify it&apos;s from someone you know.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.paperWarm, borderColor: colors.navy, marginTop: 24 }]}>
              <View style={styles.cardHeaderRow}>
                <Info color={colors.navy} size={16} strokeWidth={2} />
                <Text style={[styles.cardHeaderTitle, { color: colors.navy }]}>Why is this happening?</Text>
              </View>
              <Text style={[styles.cardBody, { color: colors.inkSecondary }]}>
                Large international transfers trigger an automatic compliance check under FCA regulations. This protects
                you and your money. It does not mean anything is wrong with your account.
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.paperWarm, borderColor: colors.navy, marginTop: 12 }]}>
              <View style={styles.cardHeaderRow}>
                <Clock color={colors.navy} size={16} strokeWidth={2} />
                <Text style={[styles.cardHeaderTitle, { color: colors.navy }]}>What happens next?</Text>
              </View>
              <View style={styles.timelineBlock}>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.emerald }]} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>Transfer received and held safely</Text>
                    <Text style={[styles.timelineSub, { color: colors.inkSecondary }]}>
                      Your money is secure in a safeguarded account
                    </Text>
                  </View>
                </View>
                <View style={styles.timelineRow}>
                  <PulsingDot color={colors.navy} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>Compliance review in progress</Text>
                    <Text style={[styles.timelineSub, { color: colors.inkSecondary }]}>
                      Usually 2–4 hours on business days
                    </Text>
                  </View>
                </View>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.inkTertiary }]} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>Transfer released to your account</Text>
                    <Text style={[styles.timelineSub, { color: colors.inkTertiary }]}>
                      {"You'll get a notification when it's done"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.paperWarm, borderColor: colors.navy, marginTop: 12 }]}>
              <View style={styles.cardHeaderRow}>
                <CheckCircle color={colors.navy} size={16} strokeWidth={2} />
                <Text style={[styles.cardHeaderTitle, { color: colors.navy }]}>What you can still do</Text>
              </View>
              <Text style={[styles.bulletLead, { color: colors.navy }]}>Spend your existing balance</Text>
              <Text style={[styles.cardBody, { color: colors.inkSecondary, marginTop: 4 }]}>
                Your available balance of £247.63 is unaffected
              </Text>
              <Text style={[styles.bulletLead, { color: colors.navy, marginTop: 12 }]}>Use your virtual card</Text>
              <Text style={[styles.cardBody, { color: colors.inkSecondary, marginTop: 4 }]}>
                Apple Pay and Google Pay work normally for purchases under £200
              </Text>
            </View>

            <Pressable
              onPress={onContactSupport}
              style={({ pressed }) => [
                styles.outlineNavy,
                { borderColor: colors.navy, opacity: pressed ? 0.85 : 1, marginTop: 20 },
              ]}
            >
              <Text style={[styles.outlineNavyText, { color: colors.navy }]}>Contact Support</Text>
            </Pressable>
          </>
        ) : null}

        {reviewState === 'info_needed' ? (
          <>
            <AlertCircle color={colors.amber} size={48} strokeWidth={2} style={{ alignSelf: 'center', marginTop: 8 }} />
            <Text style={[styles.title, { color: colors.navy, marginTop: 24 }]}>We need a little more information</Text>
            <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
              To release your transfer faster, please confirm a few details about who sent the money.
            </Text>

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.paper,
                  marginTop: 24,
                  shadowColor: '#0B1220',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                },
              ]}
            >
              <Text style={[styles.formCardTitle, { color: colors.navy }]}>About this transfer</Text>

              <Text style={[styles.fieldLabel, { color: colors.navy }]}>Sender&apos;s full name</Text>
              <TextInput
                value={senderName}
                onChangeText={setSenderName}
                placeholder="e.g. Rajesh Gupta"
                placeholderTextColor={colors.inkTertiary}
                style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
              />

              <Text style={[styles.fieldLabel, { color: colors.navy, marginTop: 14 }]}>Your relationship to sender</Text>
              <View style={styles.chipRow}>
                {(['Parent', 'Relative', 'Sponsor'] as const).map((chip) => (
                  <Pressable
                    key={chip}
                    onPress={() => setRelationship(chip)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: relationship === chip ? colors.navy : colors.paper,
                        borderColor: colors.navy,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: relationship === chip ? colors.paper : colors.navy }]}
                    >
                      {chip}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.navy, marginTop: 14 }]}>Reason for transfer</Text>
              <View style={styles.chipRow}>
                {(['Living costs', 'Tuition fees', 'Other'] as const).map((chip) => (
                  <Pressable
                    key={chip}
                    onPress={() => setTransferReason(chip)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: transferReason === chip ? colors.navy : colors.paper,
                        borderColor: colors.navy,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: transferReason === chip ? colors.paper : colors.navy }]}
                    >
                      {chip}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.navy, marginTop: 14 }]}>Additional context (optional)</Text>
              <TextInput
                value={extraContext}
                onChangeText={setExtraContext}
                placeholder="Anything else that helps us verify this transfer"
                placeholderTextColor={colors.inkTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.inputMultiline, { borderColor: colors.border, color: colors.ink }]}
              />
            </View>

            <Text style={[styles.reassurance, { color: colors.inkTertiary }]}>
              This information is used only to verify this transfer. It is handled under our FCA-regulated compliance
              framework.
            </Text>

            <Pressable
              onPress={() => void onSubmitInfo()}
              disabled={submittingInfo}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.navy, opacity: submittingInfo || pressed ? 0.85 : 1, marginTop: 20 },
              ]}
            >
              {submittingInfo ? (
                <Text style={[styles.primaryBtnText, { color: colors.paper }]}>Submitting…</Text>
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.paper }]}>Submit and speed up review</Text>
              )}
            </Pressable>
          </>
        ) : null}

        {reviewState === 'resolved' ? (
          <>
            <CheckCircle2 color={colors.emerald} size={64} strokeWidth={2} style={{ alignSelf: 'center', marginTop: 40 }} />
            <Text style={[styles.titleLg, { color: colors.navy, marginTop: 16 }]}>
              All clear — transfer released
            </Text>
            <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
              Your £{amountLabel} transfer has been verified and added to your balance. Your account is fully active.
            </Text>

            <View
              style={[
                styles.balanceCard,
                { backgroundColor: colors.navy, borderColor: colors.navyLight },
              ]}
            >
              <Text style={[styles.balanceLabel, { color: colors.paper }]}>NEW BALANCE</Text>
              <Text style={[styles.balanceAmt, { color: colors.paper }]}>£1,747.63</Text>
              <Text style={[styles.balanceSub, { color: colors.paper }]}>Updated just now</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.paperWarm, borderColor: colors.border, marginTop: 16 }]}>
              <Text style={[styles.cardHeaderTitle, { color: colors.navy, marginBottom: 12 }]}>
                Here&apos;s what we checked:
              </Text>
              {['Transfer source verified', 'Sender relationship confirmed', 'Amount consistent with student profile'].map(
                (line) => (
                  <View key={line} style={styles.checkRow}>
                    <CheckCircle2 color={colors.emerald} size={20} strokeWidth={2} />
                    <Text style={[styles.checkRowText, { color: colors.ink }]}>{line}</Text>
                  </View>
                ),
              )}
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'HavenHome',
                })
              }
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1, marginTop: 24 },
              ]}
            >
              <Text style={[styles.primaryBtnText, { color: colors.paper }]}>Back to dashboard</Text>
            </Pressable>
          </>
        ) : null}

        {reviewState === 'escalated' ? (
          <>
            <Clock color={colors.amber} size={48} strokeWidth={2} style={{ alignSelf: 'center', marginTop: 40 }} />
            <Text style={[styles.title, { color: colors.navy, marginTop: 16 }]}>
              This one needs a human review
            </Text>
            <Text style={[styles.subtitle, { color: colors.inkSecondary }]}>
              Our automated system has flagged this transfer for manual review by our compliance team. This is rare and
              doesn&apos;t mean anything is wrong.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.paperWarm, borderColor: colors.navy, marginTop: 24 }]}>
              <View style={styles.cardHeaderRow}>
                <Clock color={colors.navy} size={16} strokeWidth={2} />
                <Text style={[styles.cardHeaderTitle, { color: colors.navy }]}>What happens next?</Text>
              </View>
              <View style={styles.timelineBlock}>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.emerald }]} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>Transfer received safely</Text>
                  </View>
                </View>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.amber }]} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>Manual review in progress</Text>
                    <Text style={[styles.timelineSub, { color: colors.inkSecondary }]}>
                      Usually 24–48 hours on business days
                    </Text>
                  </View>
                </View>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.inkTertiary }]} />
                  <View style={styles.timelineTextCol}>
                    <Text style={[styles.timelineTitle, { color: colors.navy }]}>
                      {"You'll be notified by email and in-app when complete"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.supportCard,
                {
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  borderColor: colors.amber,
                },
              ]}
            >
              <Text style={[styles.supportTitle, { color: colors.amber }]}>Need this faster?</Text>
              <Text style={[styles.cardBody, { color: colors.ink, marginTop: 8 }]}>
                If your transfer is urgently needed, contact our compliance team directly with your reference number
                below.
              </Text>
              <View style={styles.refRow}>
                <Text style={[styles.refText, { color: colors.navy }]} selectable>
                  {COMPLIANCE_REF}
                </Text>
                <Pressable onPress={() => void shareReference()} hitSlop={8} accessibilityRole="button">
                  <Copy color={colors.navy} size={22} strokeWidth={2} />
                </Pressable>
              </View>
              {refCopiedFlash ? (
                <Text style={[styles.copiedFlash, { color: colors.emerald }]}>Copied!</Text>
              ) : null}
            </View>

            <Pressable
              onPress={openComplianceMail}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1, marginTop: 20 },
              ]}
            >
              <Text style={[styles.primaryBtnText, { color: colors.paper }]}>Email compliance team</Text>
            </Pressable>
          </>
        ) : null}

        <View style={[styles.debugRow, { marginTop: 28 }]}>
          {(
            [
              ['reviewing', 'Reviewing'] as const,
              ['info_needed', 'Info Needed'] as const,
              ['resolved', 'Resolved'] as const,
              ['escalated', 'Escalated'] as const,
            ] as const
          ).map(([st, label], i) => (
            <View key={st} style={styles.debugItem}>
              {i > 0 ? (
                <Text style={[styles.debugBtn, { color: colors.inkTertiary }]}> | </Text>
              ) : null}
              <Pressable onPress={() => setReviewState(st)}>
                <Text
                  style={[
                    styles.debugBtn,
                    { color: colors.inkTertiary, fontWeight: reviewState === st ? '700' : '400' },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerBack: { padding: 8, width: 44 },
  headerSpacer: { width: 44 },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  heroPulseOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  titleLg: { fontSize: 24, fontWeight: '800', textAlign: 'center', lineHeight: 30 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardHeaderTitle: { fontSize: 15, fontWeight: '600' },
  cardBody: { fontSize: 13, lineHeight: 18 },
  bulletLead: { fontSize: 14, fontWeight: '600' },
  timelineBlock: { gap: 14, marginTop: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineTextCol: { flex: 1, gap: 4 },
  timelineTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  timelineSub: { fontSize: 12, lineHeight: 17 },
  outlineNavy: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineNavyText: { fontSize: 16, fontWeight: '700' },
  formCard: {
    borderRadius: 12,
    padding: 16,
  },
  formCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputMultiline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 88,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  reassurance: { fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: 'center' },
  primaryBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '800' },
  balanceCard: {
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  balanceAmt: { fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  balanceSub: { fontSize: 13, opacity: 0.7 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  checkRowText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  supportCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  supportTitle: { fontSize: 15, fontWeight: '700' },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  refText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  copiedFlash: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  debugRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 0,
    alignItems: 'center',
  },
  debugItem: { flexDirection: 'row', alignItems: 'center' },
  debugBtn: { fontSize: 10 },
});
