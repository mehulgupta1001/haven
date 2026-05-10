import { mockDelay } from './delay';
import type { KycApplication } from './types';

export type KycService = {
  getApplication: () => Promise<KycApplication>;
};

/** Three-stage onboarding: Identity → Visa → University .ac.uk email — target Onfido for docs */
const application: KycApplication = {
  currentStage: 'visa',
  identityComplete: true,
  visaComplete: false,
  universityEmailComplete: false,
  submittedAt: '2026-05-07T11:20:00.000Z',
  mockDocumentProvider: 'Onfido',
};

export const kycService: KycService = {
  async getApplication() {
    await mockDelay();
    return { ...application };
  },
};
