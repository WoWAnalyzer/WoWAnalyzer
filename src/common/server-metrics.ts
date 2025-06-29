import makeApiUrl from './makeApiUrl';

export interface ServerMetrics {
  /**
   * The number of cooldown errors per minute.
   */
  cooldownErrorRate: number;
  /**
   * The number of unknown abilities used per minute.
   */
  unknownAbilityErrorRate: number;
  /**
   * The number of gcd errors per minute.
   */
  gcdErrorRate: number;
  /**
   * The fractional active time ratio (from 0.00 to 1.00)
   */
  activeTimeRatio: number;
}

export interface Selection {
  reportCode: string;
  fightId: number;
  playerId: number;
  configName: string;
}

// note: not naming it 'server-metrics' to avoid zealous adblock extensions blocking it as an ad tracking call (which it is not)
const ENDPOINT = 'v1/server-data';

export async function uploadServerMetrics(
  selection: Selection,
  serverMetrics: ServerMetrics,
): Promise<void> {
  try {
    const response = await fetch(makeApiUrl(ENDPOINT), {
      body: JSON.stringify({
        selection,
        serverMetrics,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.info('failed to upload spec server data', response, await response.text());
    }
  } catch (err) {
    // never trigger errors from this.
    console.info('failed to upload spec server data', err);
  }
}
