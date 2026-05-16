import type { FiatCurrencyCode } from '../data/fiatCurrencies';

export type { FiatCurrencyCode } from '../data/fiatCurrencies';

/** Any balance / FX display code in Haven (matches platform fiat catalog incl. GBP). */
export type SupportedFiat = FiatCurrencyCode;

/** @deprecated Use FiatCurrencyCode — alias for onboarding “receive money in” field */
export type HomeReceiveCurrency = FiatCurrencyCode;

export type AuthSession = {
  userId: string;
  email: string;
  displayName: string;
  /** Russell Group or University of London institution chosen at onboarding */
  universityName: string;
  /** Currency guardians most often send — must exist in the fiat catalog */
  receiveCurrency: FiatCurrencyCode;
  universityEmailVerified: boolean;
  /** ISO-8601 signup time — card delivery banner (mock may backdate for demos) */
  createdAt?: string;
};

export type KycStage = 'identity' | 'visa' | 'university_email';

/** Mock pipeline — production target: Onfido for passport + visa vignette liveness */
export type KycApplication = {
  currentStage: KycStage;
  identityComplete: boolean;
  visaComplete: boolean;
  universityEmailComplete: boolean;
  submittedAt: string;
  /** Provider we present as the document standard to regulators / universities */
  mockDocumentProvider: 'Onfido';
};

export type MoneyAmount = {
  currency: SupportedFiat;
  /** Minor units avoided — store as decimal string for mock clarity */
  amount: string;
};

export type LedgerTransaction = {
  id: string;
  title: string;
  occurredAt: string;
  amountGbp: string;
  direction: 'credit' | 'debit';
  category: string;
};

export type AccountSummary = {
  availableBalanceGbp: string;
  accountMasked: string;
  sortCode: string;
  accountNumberLast4: string;
};

export type RentReportingStatus =
  | 'not_started'
  | 'linking_bank'
  | 'awaiting_landlord'
  | 'reporting_active';

export type CreditJourneyState = {
  rentReportingStatus: RentReportingStatus;
  equifaxPartnerReference: string;
  lastRentReportDate: string | null;
};

export type OpenBankingConnectionStep = 'select_provider' | 'authorize' | 'confirmed';

export type CardScheme = 'visa_debit';

export type HavenCardState = {
  id: string;
  scheme: CardScheme;
  /** Marqeta / Thredd-style processor programme (mock) */
  programmeName: string;
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  status: 'active' | 'frozen';
  contactlessEnabled: boolean;
  /** Soft daily POS cap in GBP */
  dailySpendCapGbp: string;
  /** Wallet push readiness after full KYC */
  applePayReady: boolean;
  googlePayReady: boolean;
};
