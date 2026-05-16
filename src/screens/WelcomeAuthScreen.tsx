import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Linking,
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
import { mockDelay } from '../services';
import {
  ArrowDownCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  ScanFace,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { FiatCurrencyPickerSheet } from '../components/FiatCurrencyPickerSheet';
import { fiatLabel } from '../data/fiatCurrencies';
import type { UkFocusUniversity } from '../data/ukUniversities';
import { UK_FOCUS_UNIVERSITIES } from '../data/ukUniversities';

type Mode = 'signup' | 'signin';

const PILOT_ACCESS_CODE = 'UCL001';

type SignupStep =
  | 'landing'
  | 'pilot_code'
  | 'credentials'
  | 'offer_letter'
  | 'passport'
  | 'confirm';

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

  /** Six slots for alphanumeric pilot codes (e.g. UCL001). */
  const [pilotChars, setPilotChars] = useState<string[]>(['', '', '', '', '', '']);
  const [pilotError, setPilotError] = useState<string | null>(null);
  const pilotInputRefs = useRef<Array<TextInput | null>>([]);

  const [selectedUniversity, setSelectedUniversity] = useState<UkFocusUniversity | null>(null);
  const [universityPickerOpen, setUniversityPickerOpen] = useState(false);
  const [offerLetterStatus, setOfferLetterStatus] = useState<'idle' | 'uploading' | 'verified'>(
    'idle',
  );

  const resetSignup = () => {
    setStep('landing');
    setFormError(null);
    setPilotError(null);
    setPilotChars(['', '', '', '', '', '']);
    setSelectedUniversity(null);
    setUniversityPickerOpen(false);
    setOfferLetterStatus('idle');
  };

  const onSubmitSignIn = async () => {
    clearError();
    setFormError(null);
    await signIn(email, password);
  };

  const validateCredentials = (): boolean => {
    if (!selectedUniversity) {
      setFormError('Select your university.');
      return false;
    }
    const e = email.trim().toLowerCase();
    if (!e.endsWith('.ac.uk')) {
      setFormError('Use your university email (.ac.uk) — that’s how we verify you’re a student.');
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

  const onPilotCellChange = (index: number, raw: string) => {
    const alpha = raw.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    setPilotError(null);

    if (index === 0 && alpha.length > 1) {
      const next: string[] = ['', '', '', '', '', ''];
      for (let k = 0; k < 6; k++) next[k] = alpha[k] ?? '';
      setPilotChars(next);
      requestAnimationFrame(() =>
        pilotInputRefs.current[Math.min(Math.max(alpha.length, 1), 6) - 1]?.focus(),
      );
      return;
    }

    const ch = alpha.slice(-1);
    setPilotChars((prev) => {
      const next = [...prev];
      next[index] = ch;
      return next;
    });
    if (ch && index < 5) {
      requestAnimationFrame(() => pilotInputRefs.current[index + 1]?.focus());
    }
  };

  const onPilotCellKeyPress = (index: number, key: string, currentLen: number) => {
    if (key === 'Backspace' && currentLen === 0 && index > 0) {
      pilotInputRefs.current[index - 1]?.focus();
    }
  };

  const pilotCodeCleanedNorm = PILOT_ACCESS_CODE.replace(/[^0-9A-Za-z]/g, '').toUpperCase();

  const onWaitlistPress = async () => {
    const url =
      'mailto:hello@haven.app?subject=Haven%20pilot%20waitlist&body=Please%20add%20me%20to%20the%20waitlist.';
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else throw new Error('no handler');
    } catch {
      Alert.alert(
        'Join the waitlist',
        'Pilot access is invitation-only during the closed UCL programme. Ask your cohort lead or Student Enterprise team for availability.',
      );
    }
  };

  const validatePilotAndContinue = () => {
    const entered = pilotChars.join('').toUpperCase().replace(/[^0-9A-Za-z]/g, '');
    if (entered.length < 6) {
      setPilotError("Enter the full six characters of your invitation code.");
      return;
    }
    if (entered !== pilotCodeCleanedNorm) {
      setPilotError("That code doesn't look right. Check with whoever invited you.");
      return;
    }
    setPilotError(null);
    setStep('credentials');
  };

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
                    onPress={() => setStep('pilot_code')}
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

              {step === 'pilot_code' ? (
                <View style={styles.pilotBlock}>
                  <Text style={[styles.pilotWordmark, { color: colors.navy }]}>Haven</Text>
                  <Text style={[styles.pilotTitle, { color: colors.navy }]}>You've been invited to Haven</Text>
                  <Text style={[styles.pilotSubtitle, { color: colors.inkSecondary }]}>
                    Haven is currently in a closed pilot for UCL students. Enter your 6-digit access code to continue.
                  </Text>
                  <View style={styles.pilotInputsRow}>
                    {pilotChars.map((slot, index) => (
                      <TextInput
                        key={index}
                        ref={(el) => {
                          pilotInputRefs.current[index] = el;
                        }}
                        value={slot}
                        onChangeText={(t) => onPilotCellChange(index, t)}
                        onKeyPress={({ nativeEvent }) =>
                          onPilotCellKeyPress(index, nativeEvent.key, pilotChars[index].length)
                        }
                        keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                        autoCapitalize="characters"
                        maxLength={index === 0 ? 6 : 1}
                        importantForAutofill="no"
                        textContentType="oneTimeCode"
                        style={[
                          styles.pilotCell,
                          { borderColor: pilotError ? colors.crimson : colors.border, color: colors.navy },
                        ]}
                      />
                    ))}
                  </View>
                  {pilotError ? (
                    <Text style={[styles.pilotError, { color: colors.crimson }]}>{pilotError}</Text>
                  ) : null}
                  <Pressable
                    onPress={validatePilotAndContinue}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Continue</Text>
                  </Pressable>
                  <Pressable onPress={onWaitlistPress} style={styles.pilotWaitlist}>
                    <Text style={[styles.pilotWaitlistText, { color: colors.inkSecondary }]}>
                      Don't have a code? Join the waitlist →
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setStep('landing')}>
                    <Text style={[styles.pilotBack, { color: colors.inkTertiary }]}>Back</Text>
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
                      placeholder="How we'll greet you"
                      placeholderTextColor={colors.inkTertiary}
                      style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
                    />
                  </Field>
                  <Field label="Your university" colors={colors}>
                    <Pressable
                      onPress={() => setUniversityPickerOpen(true)}
                      style={({ pressed }) => [
                        styles.universityField,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.paper,
                          opacity: pressed ? 0.92 : 1,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={[
                            styles.universityFieldText,
                            { color: selectedUniversity ? colors.ink : colors.inkTertiary },
                          ]}
                          numberOfLines={2}
                        >
                          {selectedUniversity ? selectedUniversity.name : 'Search for your university…'}
                        </Text>
                      </View>
                      {selectedUniversity ? (
                        <Check color={colors.emerald} size={22} strokeWidth={2.5} />
                      ) : (
                        <ChevronRight color={colors.navy} size={22} />
                      )}
                    </Pressable>
                  </Field>
                  <UniversityPickerSheet
                    visible={universityPickerOpen}
                    onClose={() => setUniversityPickerOpen(false)}
                    selectedId={selectedUniversity?.id ?? null}
                    onSelect={(u) => {
                      setSelectedUniversity(u);
                      setUniversityPickerOpen(false);
                    }}
                  />
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
                      if (validateCredentials()) {
                        setOfferLetterStatus('idle');
                        setStep('offer_letter');
                      }
                    }}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Continue</Text>
                  </Pressable>
                </>
              ) : null}

              {step === 'offer_letter' ? (
                <View style={styles.stepBlock}>
                  <Text style={[styles.stepHint, { color: colors.inkTertiary }]}>Step 2 of 4 — Offer letter</Text>
                  <Text style={[styles.stepTitleOffer, { color: colors.navy }]}>Verify your place</Text>
                  <Text style={[styles.stepBodyOffer, { color: colors.inkSecondary }]}>
                    Upload your university offer letter or CAS number confirmation. This lets us open your account before
                    you arrive in the UK.
                  </Text>

                  <Pressable
                    onPress={() => {
                      if (offerLetterStatus !== 'idle' || !selectedUniversity) return;
                      setOfferLetterStatus('uploading');
                      void (async () => {
                        await mockDelay(1500);
                        setOfferLetterStatus('verified');
                      })();
                    }}
                    disabled={offerLetterStatus === 'uploading' || !selectedUniversity}
                    style={({ pressed }) => [
                      styles.offerUploadZone,
                      {
                        borderColor: colors.navy,
                        backgroundColor: colors.paper,
                        opacity:
                          pressed && offerLetterStatus === 'idle' && selectedUniversity
                            ? 0.92
                            : offerLetterStatus === 'idle' && !selectedUniversity
                              ? 0.65
                              : 1,
                      },
                    ]}
                  >
                    {offerLetterStatus === 'uploading' ? (
                      <ActivityIndicator color={colors.navy} />
                    ) : offerLetterStatus === 'verified' ? (
                      <>
                        <CheckCircle2 color={colors.emerald} size={44} strokeWidth={2.2} />
                        <Text style={[styles.offerVerifiedTitle, { color: colors.navy }]}>
                          {`${selectedUniversity?.name ?? ''} offer letter verified`}
                        </Text>
                      </>
                    ) : (
                      <>
                        <FileText color={colors.navy} size={40} strokeWidth={2} />
                        <Text style={[styles.offerUploadPrompt, { color: colors.inkSecondary }]}>
                          Tap to upload offer letter
                        </Text>
                      </>
                    )}
                  </Pressable>
                  <Text style={[styles.offerFormatsHint, { color: colors.inkTertiary }]}>
                    PDF, JPG or PNG · Max 10MB
                  </Text>

                  <Pressable
                    onPress={() => {
                      if (offerLetterStatus !== 'verified') return;
                      setStep('passport');
                    }}
                    disabled={offerLetterStatus !== 'verified'}
                    style={({ pressed }) => [
                      styles.primary,
                      {
                        backgroundColor: colors.navy,
                        opacity: offerLetterStatus !== 'verified' || pressed ? 0.72 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Continue</Text>
                  </Pressable>

                  <Text style={[styles.offerDeferHint, { color: colors.inkTertiary }]}>
                    {"Don't have this yet? You can add it later from your profile."}
                  </Text>
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
                    We’ll verify your passport chip and take a quick selfie so we can confirm your identity.
                  </Text>
                  <Pressable
                    onPress={() => setStep('confirm')}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.navy, opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={[styles.primaryText, { color: colors.paper }]}>Continue verification</Text>
                  </Pressable>
                  <Pressable onPress={() => setStep('offer_letter')}>
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
                    Your Haven debit card is being prepared — you’ll see it in the Card tab as soon as it’s issued.
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
              Your money is held in safeguarded accounts by our FCA-regulated banking partner — protected up to £85,000
              under FSCS rules. Haven never holds your funds directly.
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

const uniPickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    padding: 14,
    paddingBottom: 28,
  },
  sheet: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
    maxHeight: '86%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', flex: 1, paddingRight: 8 },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowName: { fontSize: 15, fontWeight: '700' },
  emptyList: {
    padding: 20,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

function filterUniversities(query: string): UkFocusUniversity[] {
  const q = query.trim().toLowerCase();
  if (!q) return UK_FOCUS_UNIVERSITIES;
  return UK_FOCUS_UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(q));
}

function UniversityPickerSheet({
  visible,
  onClose,
  selectedId,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (u: UkFocusUniversity) => void;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const list = useMemo(() => filterUniversities(query), [query]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={uniPickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[uniPickerStyles.sheet, { backgroundColor: colors.paper, borderColor: colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={uniPickerStyles.headerRow}>
            <Text style={[uniPickerStyles.title, { color: colors.navy }]}>Your university</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.navy} size={24} />
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for your university…"
            placeholderTextColor={colors.inkTertiary}
            style={[
              uniPickerStyles.search,
              {
                borderColor: colors.border,
                backgroundColor: colors.paperWarm,
                color: colors.ink,
              },
            ]}
          />
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 340 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[uniPickerStyles.emptyList, { color: colors.inkSecondary }]}>
                No universities match your search.
              </Text>
            }
            renderItem={({ item }) => {
              const selected = selectedId === item.id;
              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  style={[
                    uniPickerStyles.row,
                    { borderBottomColor: colors.border },
                    selected ? { backgroundColor: colors.emeraldMuted } : null,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[uniPickerStyles.rowName, { color: colors.navy, flex: 1 }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {selected ? <Check color={colors.emerald} size={22} strokeWidth={2.5} /> : null}
                  </View>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
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
  stepTitleOffer: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  stepBodyOffer: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
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
  universityField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 50,
  },
  universityFieldText: { fontSize: 16, lineHeight: 22, fontWeight: '600', flexShrink: 1 },
  offerUploadZone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    minHeight: 168,
    marginTop: 4,
  },
  offerUploadPrompt: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
  offerVerifiedTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  offerFormatsHint: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  offerDeferHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: -4,
  },
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
  pilotBlock: { gap: 14, alignItems: 'stretch' },
  pilotWordmark: { fontSize: 36, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  pilotTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  pilotSubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  pilotInputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'nowrap',
  },
  pilotCell: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pilotError: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  pilotWaitlist: { alignSelf: 'center', paddingVertical: 8 },
  pilotWaitlistText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  pilotBack: { textAlign: 'center', fontSize: 13, paddingVertical: 4 },
});
