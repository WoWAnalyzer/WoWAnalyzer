import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { routeLocalCombatLogDiscovery } from './discoveryRouter';
import { prepareTargetDummyInput } from './preparation';

const TALENT_EXPORT =
  'CsPAkXBWxkyfx9CbGaHonEAhLNAzMMjZAz2MzMzMLzMjMjxYYmxgZmZmZmZmZAAAAAAAAAYMbDMgFwywEyYBzMmZGYAYYmBYmBD';
const PROFILE = `# SimC Addon 12.1.0-02
# WoW 12.1.0.69299, TOC 120100
deathknight="Téstknight"
level=90
race=dark_iron_dwarf
region=eu
server=argent_dawn
spec=frost
talents=${TALENT_EXPORT}
head=,id=249970,ilevel=289
main_hand=,id=237846,ilevel=295`;

function fixture(path: string): string {
  return readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), 'test-fixtures', path),
    'utf8',
  );
}

async function syntheticRoute() {
  const bytes = new TextEncoder().encode(fixture('derived/current-retail-samples.log'));
  const route = await routeLocalCombatLogDiscovery({
    size: bytes.byteLength,
    stream: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        },
      }),
  } as File);
  if (route.type !== 'target-dummy-input-required') {
    throw new Error('Expected target-dummy discovery');
  }
  return route;
}

describe('target-dummy input preparation', () => {
  it('binds the selected session and matching SimC profile without rereading the file', async () => {
    const route = await syntheticRoute();
    const session = route.discovery.sessions[0];

    const result = prepareTargetDummyInput(route.discovery, route.localActors, route.build, {
      playerGuid: session.playerGuid,
      sessionId: session.id,
      simcProfile: PROFILE,
    });

    if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
    expect(result.value).toMatchObject({
      playerGuid: 'Player-0000-00000001',
      session: { id: session.id },
      combatantInfo: {
        event: {
          sourceID: expect.any(Number),
          timestamp: session.fightStart,
          specID: 251,
        },
        diagnostics: expect.arrayContaining([expect.objectContaining({ severity: 'warning' })]),
      },
    });
  });

  it('returns a recoverable typed failure for a stale player/session selection', async () => {
    const route = await syntheticRoute();

    expect(
      prepareTargetDummyInput(route.discovery, route.localActors, route.build, {
        playerGuid: 'Player-stale',
        sessionId: 'session-stale',
        simcProfile: PROFILE,
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'SIMC_PROFILE_MALFORMED', recoverable: true },
    });
  });

  it('enforces the exact capture build during synthetic preparation', async () => {
    const route = await syntheticRoute();
    const session = route.discovery.sessions[0];

    expect(
      prepareTargetDummyInput(
        route.discovery,
        route.localActors,
        { ...route.build, wowVersion: '12.1.1' },
        {
          playerGuid: session.playerGuid,
          sessionId: session.id,
          simcProfile: PROFILE,
        },
      ),
    ).toMatchObject({ ok: false, error: { code: 'SIMC_UNSUPPORTED_BUILD' } });
  });
});
