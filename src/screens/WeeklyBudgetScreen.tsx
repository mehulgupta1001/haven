import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { mockDelay } from '../services/delay';

const MOCK_SPENT_GBP = 47.2;
const MOCK_DAYS_ELAPSED = 3;
const PRESETS = ['100', '150', '200', '300'] as const;

function parseBudgetAmount(raw: string): number | null {
  const t = raw.trim().replace(/,/g, '');
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatGbp(amount: number): string {
  return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function WeeklyBudgetScreen() {
  const { colors } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const budgetGbp = useMemo(() => {
    if (selectedPreset !== null) return Number.parseFloat(selectedPreset);
    return parseBudgetAmount(customAmount);
  }, [selectedPreset, customAmount]);

  const hasBudget = budgetGbp !== null && Number.isFinite(budgetGbp) && budgetGbp > 0;

  const spent = MOCK_SPENT_GBP;
  const pctUsed = hasBudget ? Math.min(100, (spent / budgetGbp) * 100) : 0;
  const projected = (MOCK_SPENT_GBP / MOCK_DAYS_ELAPSED) * 7;

  const progressFillColor = useMemo(() => {
    if (!hasBudget) return colors.emerald;
    if (spent >= budgetGbp) return colors.crimson;
    if (pctUsed >= 80) return colors.amber;
    return colors.emerald;
  }, [hasBudget, spent, budgetGbp, pctUsed, colors.emerald, colors.amber, colors.crimson]);

  const statusCopy = useMemo(() => {
    if (!hasBudget || budgetGbp === null) return null;
    const left = budgetGbp - spent;
    if (spent > budgetGbp) {
      return {
        text: `Over budget by £${formatGbp(spent - budgetGbp)} this week`,
        color: colors.crimson,
      };
    }
    if (pctUsed >= 80) {
      return {
        text: `Getting close — £${formatGbp(left)} left this week`,
        color: colors.amber,
      };
    }
    return {
      text: `You're on track — £${formatGbp(left)} left this week`,
      color: colors.emerald,
    };
  }, [hasBudget, budgetGbp, spent, pctUsed, colors]);

  const aiBody = useMemo(() => {
    if (!hasBudget || budgetGbp === null) return '';
    const projectedStr = formatGbp(projected);
    if (projected <= budgetGbp) {
      return `Based on your current spending rate, you're projected to spend £${projectedStr} this week. You're managing well.`;
    }
    return `Based on your current spending rate, you're projected to spend £${projectedStr} this week. Consider cutting back on eating out to stay within your target.`;
  }, [hasBudget, budgetGbp, projected]);

  const onSelectPreset = useCallback((value: string) => {
    setSelectedPreset(value);
    setCustomAmount('');
  }, []);

  const onCustomChange = useCallback((text: string) => {
    setCustomAmount(text);
    setSelectedPreset(null);
  }, []);

  const onSaveBudget = useCallback(async () => {
    if (!hasBudget || saveBusy) return;
    setSaveBusy(true);
    try {
      await mockDelay(800);
      setSaveSuccess(true);
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        setSaveSuccess(false);
      }, 2000);
    } finally {
      setSaveBusy(false);
    }
  }, [hasBudget, saveBusy]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.pageTitle, { color: colors.navy }]}>Weekly budget</Text>
        <Text style={[styles.pageSubtitle, { color: colors.inkSecondary }]}>
          Set a target and Haven tracks your progress automatically.
        </Text>

        <View style={[styles.setterCard, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <Text style={[styles.setterTitle, { color: colors.navy }]}>Your weekly target</Text>

          <View style={styles.chipGrid}>
            <View style={styles.chipRow}>
              {PRESETS.slice(0, 2).map((value) => {
                const selected = selectedPreset === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => onSelectPreset(value)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: selected ? colors.navy : colors.border,
                        backgroundColor: selected ? colors.navy : colors.paperWarm,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? colors.paper : colors.navy }]}>
                      £{value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.chipRow}>
              {PRESETS.slice(2, 4).map((value) => {
                const selected = selectedPreset === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => onSelectPreset(value)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        borderColor: selected ? colors.navy : colors.border,
                        backgroundColor: selected ? colors.navy : colors.paperWarm,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? colors.paper : colors.navy }]}>
                      £{value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={[styles.customLabel, { color: colors.navy }]}>Or enter a custom amount (£)</Text>
          <TextInput
            value={customAmount}
            onChangeText={onCustomChange}
            keyboardType="numeric"
            placeholder="e.g. 175"
            placeholderTextColor={colors.inkTertiary}
            style={[
              styles.customInput,
              { borderColor: colors.border, backgroundColor: colors.paperWarm, color: colors.ink },
            ]}
          />
        </View>

        {hasBudget && budgetGbp !== null ? (
          <>
            <View style={[styles.progressCard, { backgroundColor: colors.navy }]}>
              <Text style={[styles.progressLabel, { color: colors.paper }]}>THIS WEEK SO FAR</Text>

              <View style={styles.amountsRow}>
                <View style={styles.amountCol}>
                  <Text style={[styles.amountValue, { color: colors.paper }]}>£{formatGbp(spent)}</Text>
                  <Text style={[styles.amountCaption, { color: colors.paper }]}>spent</Text>
                </View>
                <View style={styles.amountCol}>
                  <Text style={[styles.amountValue, { color: colors.paper }]}>£{formatGbp(budgetGbp)}</Text>
                  <Text style={[styles.amountCaption, { color: colors.paper }]}>target</Text>
                </View>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pctUsed}%`, backgroundColor: progressFillColor },
                  ]}
                />
              </View>

              {statusCopy ? (
                <Text style={[styles.statusText, { color: statusCopy.color }]}>{statusCopy.text}</Text>
              ) : null}
            </View>

            <View style={[styles.aiCard, { backgroundColor: colors.paperWarm, borderLeftColor: colors.navy }]}>
              <Text style={[styles.aiKicker, { color: colors.navy }]}>AI INSIGHT</Text>
              <Text style={[styles.aiBody, { color: colors.ink }]}>{aiBody}</Text>
            </View>
          </>
        ) : null}

        <Pressable
          onPress={() => void onSaveBudget()}
          disabled={!hasBudget || saveBusy}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: colors.navy,
              opacity: !hasBudget || saveBusy || pressed ? 0.7 : 1,
            },
          ]}
        >
          {saveBusy ? (
            <ActivityIndicator color={colors.paper} />
          ) : (
            <Text
              style={[
                styles.saveBtnText,
                { color: saveSuccess ? colors.emerald : colors.paper },
              ]}
            >
              {saveSuccess ? '✓ Budget saved' : 'Save my budget'}
            </Text>
          )}
        </Pressable>

        <Text style={[styles.footerNote, { color: colors.inkTertiary }]}>
          Haven tracks your spending automatically from your transactions. No manual logging needed.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 26, fontWeight: '800' },
  pageSubtitle: { fontSize: 14, lineHeight: 21 },
  setterCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  setterTitle: { fontWeight: '700', fontSize: 16, marginBottom: 16 },
  chipGrid: { gap: 10 },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 16, fontWeight: '700' },
  customLabel: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  customInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
  },
  progressCard: { borderRadius: 16, padding: 20, marginTop: 4, gap: 14 },
  progressLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: '600' },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  amountCol: { flex: 1, gap: 4 },
  amountValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  amountCaption: { fontSize: 12, fontWeight: '600', opacity: 0.7 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  aiCard: { borderLeftWidth: 4, borderRadius: 12, padding: 16, gap: 8 },
  aiKicker: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  aiBody: { fontSize: 14, lineHeight: 21, fontWeight: '500' },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
  footerNote: { fontSize: 12, textAlign: 'center', paddingVertical: 16, lineHeight: 18 },
});
