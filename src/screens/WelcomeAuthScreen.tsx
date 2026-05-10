import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import type { FiatCurrencyCode } from '../services/types';
import {
  ArrowDownCircle,
  ChevronRight,
  CreditCard,
  FileText,
  ScanFace,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import { FiatCurrencyPickerSheet } from '../components/FiatCurrencyPickerSheet';
import { fiatLabel } from '../data/fiatCurrencies';

type Mode = 'signup' | 'signin';

type SignupStep = 'landing' | 'credentials' | 'offer' | 'passport' | 'confirm';

/**
 * Flow 1 — Pre-arrival onboarding (screens 1–5): welcome, university email sign-up, offer letter, passport, card prep.
 * Sign-in reuses stored mock profile on device.
 */
export function WelcomeAuthScreen() {
  const { colors } = useTheme();
  const { signUp, signIn, busy, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<SignupStep>('landing');
  const [formError, setFormError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState<FiatCurrencyCode>('MYR');
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);

  const resetSignup = () => {
    setStep('landing');
    setFormError(null);
  };

  const onSubmitSignIn = async () => {
    clearError();
    setFormError(null);
    await signIn(email, password);
  };

  const validateCredentials = (): boolean => {
    const e = email.trim().toLowerCase();
    if (!e.endsWith('.ac.uk')) {
      setFormError('Use your university email (.ac.uk) — that’s how we verify you’re a student (mock).');
      return false;
    }
    if (password.length < 6) {
      setFormError('Password at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const finishSignup = async () => {
    clearError();
    setFormError(null);
    await signUp({
      email: email.trim().toLowerCase(),
      password,
      displayName: displayName.trim() || email.split('@')[0] || 'Student',
      receiveCurrency,
    });
  };

  const signinValid = email.includes('@') && password.length >= 4;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paperWarm }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.brandBar, { backgroundColor: colors.navy }]}>
            <Text style={[styles.brandTitle, { color: colors.paper }]}>Haven</Text>
            <Text style={[styles.brandSub, { color: colors.paper, opacity: 0.9 }]}>
              Banking for international students arriving in the UK
            </Text>
          </View>

          <View style={[styles.modeTabs, { borderColor: colors.border, backgroundColor: colors.paper }]}>
            <ModeTab
              label="Create account"
              active={mode === 'signup'}
              onPress={() => {
                setMode('signup');
                resetSignup();
                clearError();
              }}
              colors={colors}
            />
            <ModeTab
              label="Sign in"
              active={mode === 'signin'}
              onPress={() => {
                setMode('signin');
                clearError();
                setFormError(null);
              }}
              colors={colors}
            />
          </View>

          {mode === 'signup' ? (
            <>
              {step === 'landing' ? (
                <View style={styles.landingBlock}>
                  <Text style={[styles.landingWordmark, { color: colors.navy }]}>Haven</Text>
                  <Text style={[styles.landingTagline, { color: colors.inkSecondary }]}>
                    Your financial home, from the moment you land.
                  </Text>
                  <View style={styles.landingFeatures}>
                    <View style={styles.featureRow}>
                      <ShieldCheck color={colors.emerald} size={28} />
                      <View style={styles.featureTextCol}>
                        <Text style={[styles.featureTitle, { color: colors.navy }]}>Pre-arrival account setup</Text>
                        <Text style={[styles.featureSubtitle, { color: colors.inkSecondary }]}>
                          Open your UK account before you land, using your offer letter.
                        </Text>
                      </View>
                    </View>
                    <View style={styles.featureRow}>
                      <ArrowDownCircle color={colors.navy} size={28} />
                      <View style={styles.featureTextCol}>
                        <Text style={[styles.featureTitle, { color: colors.navy }]}>Instant parent transfers</Text>
                        <Text style={[styles.featureSubtitle, { color: colors.inkSecondary }]}>
                          Receive money from home in any currency, with no hidden fees.
                        </Text>
                      </View>
                    </View>
                    <View style={styles.featureRow}>
                      <TrendingUp color={colors.emerald} size={28} />
                      <View style={styles.featureTextCol}>
                        <Text style={[styles.featureTitle, { color: colors.navy }]}>UK credit building</Text>
                        <Text style={[styles.featureSubtitle, { color: colors.inkSecondary }]}>
                          Every rent payment builds your UK credit history automatically.
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setStep('credentials')}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Get started</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setMode('signin');
                      clearError();
                      setFormError(null);
                    }}
                    style={styles.landingSignInLink}
                  >
                    <Text style={[styles.landingSignInText, { color: colors.inkSecondary }]}>
                      Already have an account? Sign in
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {step === 'credentials' ? (
                <>
                  <Text style={[styles.stepHint, { color: colors.inkTertiary }]}>Step 1 of 4 — Account</Text>
                  <Field label="Full name (optional)" colors={colors}>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="How we’ll greet you"
                      placeholderTextColor={colors.inkTertiary}
                      style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                    />
                  </Field>
                  <Field label="University email" colors={colors}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@ucl.ac.uk"
                      placeholderTextColor={colors.inkTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                    />
                  </Field>
                  <Field label="Password" colors={colors}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholder="At least 6 characters"
                      placeholderTextColor={colors.inkTertiary}
                      style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                    />
                  </Field>
                  <Field label="Confirm password" colors={colors}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                    />
                  </Field>
                  <Text style={[styles.subLabel, { color: colors.navy }]}>Parent send currency</Text>
                  <Text style={[styles.subHint, { color: colors.inkSecondary }]}>
                    Same full list as Home — search by code or country name.
                  </Text>
                  <Pressable
                    onPress={() => setCurrencyPickerOpen(true)}
                    style={({ pressed }) => [
                      styles.currencyField,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.paper,
                        opacity: pressed ? 0.92 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.currencyCode, { color: colors.navy }]}>{receiveCurrency}</Text>
                      <Text style={[styles.currencyName, { color: colors.inkSecondary }]} numberOfLines={1}>
                        {fiatLabel(receiveCurrency)}
                      </Text>
                    </View>
                    <ChevronRight color={colors.navy} size={22} />
                  </Pressable>
                  <FiatCurrencyPickerSheet
                    visible={currencyPickerOpen}
                    onClose={() => setCurrencyPickerOpen(false)}
                    selectedCode={receiveCurrency}
                    onSelect={setReceiveCurrency}
                    title="Parent send currency"
                  />
                  <Pressable
                    onPress={() => {
                      setFormError(null);
                      if (validateCredentials()) setStep('offer');
                    }}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Continue</Text>
                  </Pressable>
                </>
              ) : null}

              {step === 'offer' ? (
                <View style={styles.stepBlock}>
                  <Text style={[styles.stepHint, { color: colors.inkTertiary }]}>Step 2 of 4 — Offer letter</Text>
                  <FileText color={colors.navy} size={36} style={{ alignSelf: 'center' }} />
                  <Text style={[styles.stepTitle, { color: colors.navy }]}>Verify student status</Text>
                  <Text style={[styles.stepBody, { color: colors.inkSecondary }]}>
                    Upload your CAS / offer PDF so we can match you to your intake (mock — no file leaves this app).
                  </Text>
                  <Pressable
                    onPress={() => setStep('passport')}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Simulate upload</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep('credentials')}>
                    <Text style={{ textAlign: 'center', color: colors.inkSecondary }}>Back</Text>
                  </Pressable>
                </View>
              ) : null}

              {step === 'passport' ? (
                <View style={styles.stepBlock}>
                  <Text style={[styles.stepHint, { color: colors.inkTertiary }]}>Step 3 of 4 — Passport</Text>
                  <ScanFace color={colors.navy} size={36} style={{ alignSelf: 'center' }} />
                  <Text style={[styles.stepTitle, { color: colors.navy }]}>Identity check</Text>
                  <Text style={[styles.stepBody, { color: colors.inkSecondary }]}>
                    Scan passport chip + selfie liveness (mock). Production target: document SDK such as Onfido.
                  </Text>
                  <Pressable
                    onPress={() => setStep('confirm')}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Simulate passport capture</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep('offer')}>
                    <Text style={{ textAlign: 'center', color: colors.inkSecondary }}>Back</Text>
                  </Pressable>
                </View>
              ) : null}

              {step === 'confirm' ? (
                <View style={styles.stepBlock}>
                  <Text style={[styles.stepHint, { color: colors.inkTertiary }]}>Step 4 of 4</Text>
                  <CreditCard color={colors.emerald} size={40} style={{ alignSelf: 'center' }} />
                  <Text style={[styles.stepTitle, { color: colors.navy }]}>Account created</Text>
                  <Text style={[styles.stepBody, { color: colors.inkSecondary }]}>
                    Your Haven debit card is being prepared. You’ll see it in the Card tab once “issued” (mock).
                  </Text>
                  <Pressable
                    onPress={finishSignup}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.primary,
                      { backgroundColor: colors.emerald, opacity: busy || pressed ? 0.85 : 1 },
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.paper} />
                    ) : (
                      <Text style={[styles.primaryText, { color: colors.paper }]}>Enter Haven</Text>
                    )}
                  </Pressable>
                  <Pressable onPress={() => setStep('passport')}>
                    <Text style={{ textAlign: 'center', color: colors.inkSecondary }}>Back</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <Field label="Email" colors={colors}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.inkTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                />
              </Field>
              <Field label="Password" colors={colors}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                />
              </Field>
              <Pressable
                onPress={onSubmitSignIn}
                disabled={busy || !signinValid}
                style={({ pressed }) => [
                  styles.primary,
                  {
                    backgroundColor: colors.navy,
                    opacity: busy || !signinValid || pressed ? 0.75 : 1,
                  },
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.paper} />
                ) : (
                  <Text style={[styles.primaryText, { color: colors.paper }]}>Sign in</Text>
                )}
              </Pressable>
            </>
          )}

          {formError ? (
            <Text style={[styles.formErr, { color: colors.crimson }]}>{formError}</Text>
          ) : null}
          {error ? (
            <Text style={[styles.formErr, { color: colors.crimson }]}>{error}</Text>
          ) : null}

          <View style={[styles.trust, { borderColor: colors.border, backgroundColor: colors.paper }]}>
            <ShieldCheck color={colors.emerald} size={22} />
            <Text style={[styles.trustText, { color: colors.inkSecondary }]}>
              Real funds would sit with an FCA-regulated partner (e.g. e-money institution via BaaS). This prototype has
              no backend — show parents the same safeguarding story when you go live.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeTab({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.modeTab,
        {
          backgroundColor: active ? colors.navy : 'transparent',
          borderColor: active ? colors.navy : colors.border,
        },
      ]}
    >
      <Text style={{ fontWeight: '700', color: active ? colors.paper : colors.navy }}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.label, { color: colors.navy }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 14 },
  brandBar: { padding: 20, borderRadius: 16, gap: 6 },
  brandTitle: { fontSize: 28, fontWeight: '800' },
  brandSub: { fontSize: 14, lineHeight: 20 },
  modeTabs: { flexDirection: 'row', gap: 10, borderRadius: 14, borderWidth: 1, padding: 6 },
  modeTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  stepHint: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  stepBlock: { gap: 14 },
  stepTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  stepBody: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
  subLabel: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  subHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  currencyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
  },
  currencyCode: { fontSize: 18, fontWeight: '800' },
  currencyName: { fontSize: 13, marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  primary: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryText: { fontSize: 16, fontWeight: '800' },
  formErr: { fontSize: 14, textAlign: 'center' },
  trust: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  trustText: { flex: 1, fontSize: 12, lineHeight: 18 },
  landingBlock: { gap: 14 },
  landingWordmark: { fontSize: 36, fontWeight: '800' },
  landingTagline: { fontSize: 16, lineHeight: 23 },
  landingFeatures: { gap: 18, marginTop: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureTextCol: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 16, fontWeight: '700' },
  featureSubtitle: { fontSize: 14, lineHeight: 20 },
  landingSignInLink: { alignItems: 'center', paddingVertical: 8 },
  landingSignInText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
