import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EventType, type AnyEvent } from 'parser/core/Events';
import { describe, expect, it } from 'vitest';

import { routeLocalCombatLogDiscovery } from './discoveryRouter';
import { normalizePreparedTargetDummyImport, prepareTargetDummyImport } from './prepareImport';
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

function streamFile(contents: string, name: string): File {
  const bytes = new TextEncoder().encode(contents);
  return {
    name,
    size: bytes.byteLength,
    stream: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        },
      }),
  } as File;
}

describe('prepared target-dummy import', () => {
  it('rescans, normalizes, and batches one synthetic fight without rewriting source data', async () => {
    const source = fixture('derived/current-retail-samples.log').replace(
      '8/14/2026 12:46:23.3732  SPELL_CAST_SUCCESS',
      '8/14/2026 12:46:22.0000  COMBATANT_INFO,Player-0000-00000001,251\n8/14/2026 12:46:23.3732  SPELL_CAST_SUCCESS',
    );
    const file = streamFile(source, 'current-retail-samples.log');
    const route = await routeLocalCombatLogDiscovery(file);
    if (route.type !== 'target-dummy-input-required') throw new Error('Expected synthetic route');
    const session = route.discovery.sessions[0];
    const prepared = prepareTargetDummyInput(route.discovery, route.localActors, route.build, {
      playerGuid: session.playerGuid,
      sessionId: session.id,
      simcProfile: PROFILE,
    });
    if (!prepared.ok) throw new Error(`${prepared.error.code}: ${prepared.error.message}`);

    const plan = prepareTargetDummyImport(
      'target-dummy-report',
      route.discovery,
      route.localActors,
      prepared.value,
    );
    const batches: { fightId: number; events: AnyEvent[] }[] = [];
    await normalizePreparedTargetDummyImport(file, plan, (fightId, events) => {
      batches.push({ fightId, events });
    });
    const events = batches.flatMap((batch) => batch.events);

    expect(plan.fight).toEqual({
      id: 1,
      start_time: session.fightStart,
      end_time: session.end,
      boss: -1,
      name: 'Training Dummy',
      kill: false,
    });
    expect(plan.report).toMatchObject({
      code: 'target-dummy-report',
      fights: [plan.fight],
      start: session.fightStart,
      end: session.end,
      enemies: [
        {
          name: 'Cleave Training Dummy',
          guid: 243208,
          fights: [{ id: 1 }],
        },
      ],
    });
    expect(batches.every((batch) => batch.fightId === 1)).toBe(true);
    expect(events[0]).toBe(plan.combatantInfo);
    expect(events.filter((event) => event.type === EventType.CombatantInfo)).toHaveLength(1);
    expect(events.find((event) => event.type === EventType.Cast)).toMatchObject({
      timestamp: session.activityStart,
      sourceID: plan.combatantInfo.sourceID,
      ability: { guid: 207230, name: 'Frostscythe' },
      mapID: 2393,
    });
    expect(events.find((event) => event.type === EventType.Damage)).toMatchObject({
      timestamp: session.activityStart,
      sourceID: plan.combatantInfo.sourceID,
      targetID: expect.any(Number),
      ability: { guid: 207230, name: 'Frostscythe' },
      amount: 2771,
      unmitigatedAmount: 2690,
      mapID: 2393,
    });
    expect(plan.actors.find((actor) => actor.guid === prepared.value.playerGuid)).toMatchObject({
      fightIds: [1],
      fightDetails: { 1: { specID: 251, role: 'dps' } },
    });
    expect(plan.report.friendlyPets).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Risen Ghoul', petOwner: 1 })]),
    );
  });
});
