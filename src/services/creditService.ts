import { mockDelay } from './delay';
import type { CreditJourneyState, OpenBankingConnectionStep } from './types';

export type CreditService = {
  getCreditJourney: () => Promise<CreditJourneyState>;
  /** Simulates Open Banking rent-reporting handoff */
  simulateOpenBankingStep: (step: OpenBankingConnectionStep) => Promise<{ ok: true }>;
};

const journey: CreditJourneyState = {
  rentReportingStatus: 'linking_bank',
  equifaxPartnerReference: 'HVN-RNT-UK-449210',
  lastRentReportDate: null,
};

export const creditService: CreditService = {
  async getCreditJourney() {
    await mockDelay();
    return { ...journey };
  },

  async simulateOpenBankingStep(step) {
    await mockDelay();
    // In production this would redirect to an OB auth URL; mock accepts any progression
    void step;
    return { ok: true };
  },
};
