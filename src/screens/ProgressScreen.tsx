import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LineChart, ShieldCheck } from 'lucide-react-native';

/**
 * Flow 5 — Credit score (screen 12) + Flow 6 — AI assistant (screen 13), plus sign-out.
 * Matches the blueprint; all data mocked.
 */
export function ProgressScreen() {
  const { colors } = useTheme();
  const { signOut, busy } = useAuth();
  const [localBusy, setLocalBusy] = useState(false);

  const onSignOut = async () => {
    setLocalBusy(true);
    try {
      await signOut();
    } finally {
      setLocalBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={[styles.title, { color: colors.navy }]}>Progress</Text>
        <Text style={[styles.lead, { color: colors.inkSecondary }]}>
          Credit building and AI nudges — prototype only, no bureau reporting yet.
        </Text>

        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <View style={styles.blockHead}>
            <LineChart color={colors.navy} size={22} />
            <Text style={[styles.blockTitle, { color: colors.navy }]}>Credit score</Text>
          </View>
          <Text style={[styles.score, { color: colors.emerald }]}>562</Text>
          <Text style={[styles.blockBody, { color: colors.inkSecondary }]}>
            Mock Experian-style score. Rent payments reported via Haven (when you connect rent reporting) will appear
            here as “building factors” — same idea as rent-reporting products, integrated in one app.
          </Text>
          <View style={[styles.pillRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.pillLabel, { color: colors.inkTertiary }]}>Building your file</Text>
            <Text style={[styles.pillValue, { color: colors.ink }]}>Registered address · Current account · (Rent link pending)</Text>
          </View>
        </View>

        <View style={[styles.block, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <View style={styles.blockHead}>
            <BrainCircuit color={colors.navy} size={22} />
            <Text style={[styles.blockTitle, { color: colors.navy }]}>AI money assistant</Text>
          </View>
          <Text style={[styles.blockBody, { color: colors.inkSecondary }]}>
            Upcoming payments, alerts, and short recommendations — the “agentic” layer from your product plan, scoped to
            student life (mock).
          </Text>
          <View style={styles.alertList}>
            <AlertLine
              title="Rent reminder"
              body="£820 to UCL Accommodation — due in 12 days. Ring-fence from your latest parent transfer."
              colors={colors}
            />
            <AlertLine
              title="FX heads-up"
              body="If parents send in your home currency this week, indicative savings vs. last month’s desktop rate (mock)."
              colors={colors}
            />
            <AlertLine
              title="Spend check"
              body="Groceries ran 12% above your 4-week average — optional nudge only (mock)."
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.trust, { borderColor: colors.border, backgroundColor: colors.paper }]}>
          <ShieldCheck color={colors.emerald} size={22} />
          <Text style={[styles.trustText, { color: colors.inkSecondary }]}>
            Short reassurance copy for families would mirror your sponsor bank’s customer materials in production — here
            it’s placeholder only.
          </Text>
        </View>

        <Pressable
          onPress={onSignOut}
          disabled={busy || localBusy}
          style={({ pressed }) => [
            styles.signOut,
            { borderColor: colors.borderStrong, opacity: pressed || busy || localBusy ? 0.75 : 1 },
          ]}
        >
          {busy || localBusy ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <Text style={[styles.signOutText, { color: colors.navy }]}>Sign out</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function AlertLine({
  title,
  body,
  colors,
}: {
  title: string;
  body: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.alert, { borderColor: colors.border, backgroundColor: colors.paperWarm }]}>
      <Text style={[styles.alertTitle, { color: colors.navy }]}>{title}</Text>
      <Text style={[styles.alertBody, { color: colors.inkSecondary }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  lead: { fontSize: 14, lineHeight: 21 },
  block: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  blockTitle: { fontSize: 16, fontWeight: '800' },
  score: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  blockBody: { fontSize: 14, lineHeight: 21 },
  pillRow: { paddingTop: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, gap: 6 },
  pillLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  pillValue: { fontSize: 13, lineHeight: 18 },
  alertList: { gap: 10 },
  alert: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  alertTitle: { fontSize: 14, fontWeight: '800' },
  alertBody: { fontSize: 13, lineHeight: 18 },
  trust: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  trustText: { flex: 1, fontSize: 12, lineHeight: 18 },
  signOut: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  signOutText: { fontSize: 15, fontWeight: '700' },
});
