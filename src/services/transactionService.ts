import { mockDelay } from './delay';
import type { AccountSummary, LedgerTransaction } from './types';

export type TransactionService = {
  getAccountSummary: () => Promise<AccountSummary>;
  getRecentTransactions: (limit?: number) => Promise<LedgerTransaction[]>;
};

const summary: AccountSummary = {
  availableBalanceGbp: '1247.63',
  accountMasked: 'Haven · Current',
  sortCode: '20-00-00',
  accountNumberLast4: '9012',
};

const recent: LedgerTransaction[] = [
  {
    id: 'tx_001',
    title: 'UCL Accommodation',
    occurredAt: '2026-05-02T09:15:00.000Z',
    amountGbp: '820.00',
    direction: 'debit',
    category: 'housing',
  },
  {
    id: 'tx_002',
    title: 'Inbound — Parent transfer',
    occurredAt: '2026-04-28T14:40:00.000Z',
    amountGbp: '1500.00',
    direction: 'credit',
    category: 'transfer_in',
  },
  {
    id: 'tx_003',
    title: 'Tesco Kensington',
    occurredAt: '2026-04-27T19:02:00.000Z',
    amountGbp: '38.44',
    direction: 'debit',
    category: 'groceries',
  },
];

export const transactionService: TransactionService = {
  async getAccountSummary() {
    await mockDelay();
    return { ...summary };
  },

  async getRecentTransactions(limit = 5) {
    await mockDelay();
    return recent.slice(0, limit).map((t) => ({ ...t }));
  },
};
