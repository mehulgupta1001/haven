import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { useTheme } from '../theme';
import { transactionService } from '../services';
import type { AccountSummary } from '../services/types';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, Share2 } from 'lucide-react-native';

const WHATSAPP_GREEN = '#25D366';

type ReceiveStep = 'details' | 'request';

function formatAmountForMessage(raw: string): string {
  const t = raw.trim();
  if (!t) return '___';
  const n = Number.parseFloat(t.replace(/,/g, ''));
  return Number.isFinite(n) ? n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : t;
}

/**
 * Flow 3 — Receiving money from parents (screens 7–9 in the blueprint): share details → notification → arrived.
 */
export function ReceiveMoneyScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const [step, setStep] = useState<ReceiveStep>('details');
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [parentSent, setParentSent] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [copiedFlash, setCopiedFlash] = useState(false);
  const copyFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const s = await transactionService.getAccountSummary();
    setSummary(s);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (copyFlashTimerRef.current !== null) {
        clearTimeout(copyFlashTimerRef.current);
      }
    };
  }, []);

  const sortCodeDisplay = summary?.sortCode ?? '20-00-00';
  const accountDisplay = summary ? `••••${summary.accountNumberLast4}` : '••••9012';

  const shareMessageBody = useMemo(() => {
    const firstToken = profile?.displayName?.trim().split(/\s+/)[0];
    const namePrefix =
      firstToken && firstToken.length > 0 ? `This is ${firstToken}. ` : '';
    const amt = formatAmountForMessage(requestAmount);
    return `Hi Mum/Dad,

${namePrefix}I need you to send me £${amt} to my UK bank account. Here are the details:

Bank: Haven (powered by Griffin Bank, UK)
Account name: Haven · Student GBP
Sort code: ${sortCodeDisplay}
Account number: ${accountDisplay}

Please use my name as the payment reference so the money reaches me quickly.

You can send from any bank — including ICICI, GTBank, Maybank, or any other. The money usually arrives within 1-2 days.

Thank you ❤️`;
  }, [profile?.displayName, requestAmount, sortCodeDisplay, accountDisplay]);

  const onShareParentsMessage = useCallback(async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: shareMessageBody }
          : { message: shareMessageBody, title: 'Money request from Haven' },
      );
    } catch {
      /* user dismissed sheet */
    }
  }, [shareMessageBody]);

  const onCopyMessage = useCallback(async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: shareMessageBody }
          : { message: shareMessageBody, title: 'Copy message' },
      );
    } catch {
      /* user dismissed sheet */
    } finally {
      if (copyFlashTimerRef.current !== null) {
        clearTimeout(copyFlashTimerRef.current);
      }
      setCopiedFlash(true);
      copyFlashTimerRef.current = setTimeout(() => {
        copyFlashTimerRef.current = null;
        setCopiedFlash(false);
      }, 2000);
    }
  }, [shareMessageBody]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          {step === 'details' ? (
            <>
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
                onPress={() => setStep('request')}
                style={({ pressed }) => [
                  styles.btnOutlineRequest,
                  { borderColor: colors.navy, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <Text style={[styles.btnOutlineRequestText, { color: colors.navy }]}>Request a specific amount →</Text>
              </Pressable>

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
                    We’ve noticed an incoming transfer from your parents’ bank — Faster Payments usually clear within
                    minutes.
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
            </>
          ) : (
            <>
              <Text style={[styles.requestTitle, { color: colors.navy }]}>Send this to your parents</Text>
              <Text style={[styles.requestSubtitle, { color: colors.inkSecondary }]}>
                {"We've written a simple message they can follow — no banking knowledge needed."}
              </Text>

              <Text style={[styles.amountLabel, { color: colors.navy }]}>How much do you need? (GBP)</Text>
              <TextInput
                value={requestAmount}
                onChangeText={setRequestAmount}
                keyboardType="numeric"
                placeholder="e.g. 500"
                placeholderTextColor={colors.inkTertiary}
                style={[styles.amountInput, { borderColor: colors.border, backgroundColor: colors.paper, color: colors.ink }]}
              />

              <View
                style={[
                  styles.messageCard,
                  { backgroundColor: colors.paperWarm, borderColor: colors.navy },
                ]}
              >
                <Text style={[styles.messageCardText, { color: colors.ink }]} selectable>
                  {shareMessageBody}
                </Text>
              </View>

              <View style={styles.shareBtnsRow}>
                <Pressable
                  onPress={() => void onShareParentsMessage()}
                  style={({ pressed }) => [
                    styles.btnWhatsApp,
                    { backgroundColor: WHATSAPP_GREEN, opacity: pressed ? 0.9 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Share message via WhatsApp or other apps"
                >
                  <Share2 color={colors.paper} size={18} strokeWidth={2} />
                  <Text style={[styles.shareBtnCompactText, { color: colors.paper }]}>Share via WhatsApp</Text>
                </Pressable>
                <Pressable
                  onPress={() => void onCopyMessage()}
                  style={({ pressed }) => [
                    styles.btnCopyOutlined,
                    { borderColor: colors.navy, opacity: pressed ? 0.88 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Share message for copying"
                >
                  <Text style={[styles.shareBtnCompactTextOutlined, { color: colors.navy }]}>Copy message</Text>
                </Pressable>
              </View>
              {copiedFlash ? (
                <Text style={[styles.copiedFlashText, { color: colors.emerald }]}>Copied!</Text>
              ) : null}

              <Text style={[styles.poweredDisclaimer, { color: colors.inkTertiary }]}>
                {
                  "Haven is powered by Griffin Bank (FCA Regulated, FSCS Protected up to £85,000). Your parents' money is safe."
                }
              </Text>

              <Pressable onPress={() => setStep('details')} style={styles.backLinkWrap}>
                <Text style={[styles.backLinkText, { color: colors.inkSecondary }]}>Back</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: { flex: 1 },
  pad: { padding: 20, gap: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800' },
  lead: { fontSize: 14, lineHeight: 21 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  row: { gap: 4 },
  rowLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  rowValue: { fontSize: 17, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  btnOutlineRequest: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  btnOutlineRequestText: { fontSize: 16, fontWeight: '800' },
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
  requestTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  requestSubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  amountLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  amountInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
  },
  messageCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
  },
  messageCardText: { fontSize: 14, lineHeight: 22 },
  shareBtnsRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch', marginTop: 4 },
  btnWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
  },
  btnCopyOutlined: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 50,
  },
  shareBtnCompactText: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  shareBtnCompactTextOutlined: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  copiedFlashText: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  poweredDisclaimer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  backLinkWrap: { alignSelf: 'center', paddingVertical: 10 },
  backLinkText: { fontSize: 15, fontWeight: '600' },
});
