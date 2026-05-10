import { mockDelay } from './delay';
import type { HavenCardState } from './types';

export type CardService = {
  getPrimaryCard: () => Promise<HavenCardState>;
  setFrozen: (frozen: boolean) => Promise<HavenCardState>;
  setDailySpendCapGbp: (cap: string) => Promise<HavenCardState>;
  setContactless: (enabled: boolean) => Promise<HavenCardState>;
  requestPinReveal: () => Promise<{ obfuscatedLastTwo: string; mockNote: string }>;
  requestReplacement: (reason: 'lost' | 'damaged' | 'compromised') => Promise<{ reference: string }>;
};

let mockCard: HavenCardState = {
  id: 'crd_hvn_visa_01',
  scheme: 'visa_debit',
  programmeName: 'Haven · Visa Debit (Thredd issuer processor · Marqeta-style controls — mock)',
  lastFour: '4829',
  expiryMonth: '08',
  expiryYear: '28',
  status: 'active',
  contactlessEnabled: true,
  dailySpendCapGbp: '400.00',
  applePayReady: false,
  googlePayReady: false,
};

export const cardService: CardService = {
  async getPrimaryCard() {
    await mockDelay();
    return { ...mockCard };
  },

  async setFrozen(frozen) {
    await mockDelay();
    mockCard = {
      ...mockCard,
      status: frozen ? 'frozen' : 'active',
      contactlessEnabled: frozen ? false : mockCard.contactlessEnabled,
    };
    return { ...mockCard };
  },

  async setDailySpendCapGbp(cap) {
    await mockDelay();
    mockCard = { ...mockCard, dailySpendCapGbp: cap };
    return { ...mockCard };
  },

  async setContactless(enabled) {
    await mockDelay();
    if (mockCard.status === 'frozen') {
      mockCard = { ...mockCard, contactlessEnabled: false };
      return { ...mockCard };
    }
    mockCard = { ...mockCard, contactlessEnabled: enabled };
    return { ...mockCard };
  },

  async requestPinReveal() {
    await mockDelay();
    return {
      obfuscatedLastTwo: '••',
      mockNote: 'Live flow: PCI vault + device biometric. This prototype never stores or displays a real PIN.',
    };
  },

  async requestReplacement(reason) {
    await mockDelay();
    void reason;
    return { reference: 'HVN-CARDREP-MOCK-88421' };
  },
};
