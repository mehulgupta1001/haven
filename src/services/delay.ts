/** Simulates BaaS / network latency for mock integrations */
export const MOCK_NETWORK_DELAY_MS = 500;

export function mockDelay(ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
