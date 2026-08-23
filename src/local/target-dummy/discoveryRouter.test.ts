import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodeCombatLogLine, LocalCombatLogParseError } from '../LocalCombatLogParser';
import { routeLocalCombatLogDiscovery, TargetDummyDiscoveryRouter } from './discoveryRouter';

function fixture(path: string): string {
  return readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), 'test-fixtures', path),
    'utf8',
  ).trimEnd();
}

function route(text: string) {
  const router = new TargetDummyDiscoveryRouter();
  const lines = text.split(/\r?\n/).filter(Boolean);
  lines.forEach((line, index) => router.consume(decodeCombatLogLine(line), index + 1));
  return router.finish();
}

const header =
  '8/14/2026 14:00:00.0000  COMBAT_LOG_VERSION,22,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,12.1.0,PROJECT_ID,1';
const player = 'Player-1,"Ada-Realm",0x511,0x80000000';
const target = 'Creature-1,"Localized Target",0xa28,0x80000000';
const damage = (second: number) =>
  `8/14/2026 14:00:${String(second).padStart(2, '0')}.0000  SPELL_DAMAGE,${player},${target},1,"Strike",0x1,100`;

describe('target-dummy discovery router', () => {
  it('streams the source file once while feeding both discovery consumers', async () => {
    const text = fixture('derived/current-retail-samples.log');
    const bytes = new TextEncoder().encode(text);
    const stream = vi.fn(
      () =>
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(bytes);
            controller.close();
          },
        }),
    );
    const file = { size: bytes.byteLength, stream } as unknown as File;

    const result = await routeLocalCombatLogDiscovery(file);

    expect(result.type).toBe('target-dummy-input-required');
    expect(stream).toHaveBeenCalledOnce();
  });

  it('routes a complete encounter envelope through unchanged encounter discovery', () => {
    const result = route(fixture('derived/encounter-envelope.log'));

    expect(result.type).toBe('encounter');
    if (result.type !== 'encounter') throw new Error('Expected encounter route');
    expect(result.discovery.report('route-test').fights).toEqual([
      expect.objectContaining({
        id: 1,
        boss: 610,
        name: 'Razorgore the Untamed',
        kill: false,
      }),
    ]);
  });

  it('routes a standalone target-dummy fixture to typed synthetic input', () => {
    const text = fixture('derived/current-retail-samples.log');
    const result = route(text);

    expect(result.type).toBe('target-dummy-input-required');
    if (result.type !== 'target-dummy-input-required') {
      throw new Error('Expected target-dummy route');
    }
    expect(result.discovery.sessions).toEqual([
      expect.objectContaining({
        playerGuid: 'Player-0000-00000001',
        targetGuids: ['Creature-0-0000-0-0-243208-0000000001'],
      }),
    ]);
    expect(result.discovery.recordsScanned).toBe(text.split('\n').length);
    expect(result.discovery.retainedState).toMatchObject({
      retainedRawLineCount: 0,
      retainedNormalizedEventCount: 0,
    });
    expect(result.build).toEqual({ gameVersion: 1, logVersion: 22, wowVersion: '12.1.0' });
  });

  it('gives a usable genuine encounter precedence over standalone dummy activity', () => {
    const result = route(
      [header, damage(1), damage(2), fixture('derived/encounter-envelope.log')].join('\n'),
    );

    expect(result.type).toBe('encounter');
    if (result.type !== 'encounter') throw new Error('Expected encounter route');
    expect(result.discovery.report('precedence').fights).toHaveLength(1);
  });

  it('requires combatant info inside a matching, closed encounter envelope', () => {
    const result = route(
      [
        header,
        '8/14/2026 14:00:01.0000  COMBATANT_INFO,Player-1,1,2,3',
        '8/14/2026 14:00:02.0000  ENCOUNTER_START,123,"Boss",16,20,1',
        '8/14/2026 14:00:03.0000  ENCOUNTER_END,456,"Other",16,20,1',
      ].join('\n'),
    );

    expect(result).toMatchObject({
      type: 'unsupported-input',
      error: {
        code: 'no-usable-encounter-or-target-dummy-session',
        message: expect.stringContaining('standalone file'),
      },
    });
  });

  it('selects synthetic preparation when an unusable encounter is followed by a session', () => {
    const result = route(
      [
        header,
        '8/14/2026 14:00:01.0000  ENCOUNTER_START,123,"Boss",16,20,1',
        '8/14/2026 14:00:02.0000  ENCOUNTER_END,123,"Boss",16,20,1',
        damage(20),
        damage(21),
      ].join('\n'),
    );

    expect(result.type).toBe('target-dummy-input-required');
  });

  it('preserves encounter version failures instead of treating them as synthetic input', () => {
    const router = new TargetDummyDiscoveryRouter();

    expect(() => router.consume(decodeCombatLogLine('COMBAT_LOG_VERSION,21,1,12.1.0'), 1)).toThrow(
      LocalCombatLogParseError,
    );
  });
});
