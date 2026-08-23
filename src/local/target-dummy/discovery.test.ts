import { describe, expect, it } from 'vitest';
import { decodeCombatLogLine } from '../LocalCombatLogParser';
import {
  classifyTargetDummyActorGuid,
  COMBATLOG_OBJECT_AFFILIATION_MINE,
  TargetDummyActorDiscovery,
} from './discovery';

const MINE = 'Player-1,"Téstknight-Realm",0x511,0x0';
const OTHER = 'Player-2,"Nearby-Realm",0x518,0x0';
const SECOND_MINE = 'Player-3,"Second-Realm",0x511,0x0';
const TARGET = 'Creature-1,"Localized Target",0xa28,0x0';

function record(second: number, event: string, payload: string): string[] {
  return decodeCombatLogLine(
    `8/14/2026 14:00:${second.toString().padStart(2, '0')}.0000  ${event},${payload}`,
  );
}

function timedRecord(time: string, event: string, payload: string): string[] {
  return decodeCombatLogLine(`8/14/2026 ${time}.0000  ${event},${payload}`);
}

function scan(lines: readonly string[][]) {
  const discovery = new TargetDummyActorDiscovery();
  for (const line of lines) discovery.consume(line);
  return discovery.finish();
}

describe('target-dummy actor discovery', () => {
  it('classifies actors by GUID shape rather than localized names or flags', () => {
    expect(classifyTargetDummyActorGuid('Player-1')).toBe('player');
    expect(classifyTargetDummyActorGuid('Creature-1')).toBe('creature');
    expect(classifyTargetDummyActorGuid('Pet-1')).toBe('pet');
    expect(classifyTargetDummyActorGuid('Guardian-1')).toBe('guardian');
    expect(classifyTargetDummyActorGuid('Vehicle-1')).toBe('vehicle');
    expect(classifyTargetDummyActorGuid('GameObject-1')).toBe('game-object');
    expect(classifyTargetDummyActorGuid('Localized Training Dummy')).toBeUndefined();
  });

  it('deduplicates actor aggregates and ranks direct hostile player activity', () => {
    const result = scan([
      record(1, 'SPELL_CAST_SUCCESS', `${MINE},${TARGET},1,"Strike",0x1`),
      record(2, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(3, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(4, 'SPELL_CAST_SUCCESS', `${OTHER},${TARGET},2,"Other",0x1`),
      record(5, 'SPELL_HEAL', `${OTHER},${OTHER},3,"Heal",0x2,100`),
    ]);

    expect(result.actors).toHaveLength(3);
    expect(result.players.map((player) => player.guid)).toEqual(['Player-1', 'Player-2']);
    expect(result.players[0]).toMatchObject({
      guid: 'Player-1',
      name: 'Téstknight-Realm',
      flags: 0x511,
      recorderCandidate: true,
      outgoingCastCount: 1,
      outgoingDamageCount: 2,
      directHostileActionCount: 3,
      targetInteractionCount: 1,
    });
    expect(result.proposedRecorderGuid).toBe('Player-1');
    expect(result.actors.find((actor) => actor.guid === 'Creature-1')).toMatchObject({
      name: 'Localized Target',
      sourceObservationCount: 0,
      targetObservationCount: 4,
    });
  });

  it('proposes a recorder only for exactly one mine player', () => {
    const noMine = scan([record(1, 'SPELL_DAMAGE', `${OTHER},${TARGET},1,"Strike",0x1,100`)]);
    expect(noMine.proposedRecorderGuid).toBeUndefined();

    const multipleMine = scan([
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(2, 'SPELL_DAMAGE', `${SECOND_MINE},${TARGET},1,"Strike",0x1,100`),
    ]);
    expect(multipleMine.players.filter((player) => player.recorderCandidate)).toHaveLength(2);
    expect(multipleMine.proposedRecorderGuid).toBeUndefined();
  });

  it('adds combatant-only players and unions flags across observations', () => {
    const result = scan([
      record(1, 'COMBATANT_INFO', 'Player-4,1,2,3'),
      record(2, 'SPELL_AURA_APPLIED', `Player-4,"Name",0x510,0x0,${MINE},1,"Buff",0x1,BUFF`),
      record(3, 'SPELL_DAMAGE', `Player-4,"Name",0x1,0x0,${TARGET},1,"Strike",0x1,100`),
    ]);
    expect(result.players.find((player) => player.guid === 'Player-4')).toMatchObject({
      name: 'Name',
      flags: 0x511,
      recorderCandidate: true,
    });
  });

  it('retains aggregate state, not source lines or normalized events', () => {
    const discovery = new TargetDummyActorDiscovery();
    for (let index = 0; index < 200; index += 1) {
      discovery.consume(record(index % 60, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`));
    }
    const result = discovery.finish();
    expect(result.recordsScanned).toBe(200);
    expect(result.retainedState).toEqual({
      actorCount: 2,
      candidateWindowCount: 8,
      ownedEntityCount: 0,
      retainedRawLineCount: 0,
      retainedNormalizedEventCount: 0,
    });
    expect(result).not.toHaveProperty('records');
    expect(result).not.toHaveProperty('events');
    expect(COMBATLOG_OBJECT_AFFILIATION_MINE).toBe(1);
  });
});

describe('target-dummy session discovery', () => {
  it('groups cleave per player and explains likely confidence', () => {
    const secondTarget = 'Creature-2,"Second localized target",0xa28,0x0';
    const result = scan([
      record(0, 'COMBAT_LOG_VERSION', '22,1,12.1.0'),
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(11, 'SPELL_DAMAGE', `${MINE},${secondTarget},1,"Strike",0x1,100`),
      record(21, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
    ]);

    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      id: 'Player-1-session-1',
      playerGuid: 'Player-1',
      targetGuids: ['Creature-1', 'Creature-2'],
      durationMs: 20_000,
      confidence: 'likely',
      qualifyingActionCount: 3,
      playerInitiatedActionCount: 3,
    });
    expect(result.sessions[0].fightStart).toBe(result.sessions[0].activityStart - 1_000);
    expect(result.sessions[0].reasons).toEqual(
      expect.arrayContaining([
        'multiple-player-actions',
        'minimum-duration-met',
        'sustained-activity',
        'multi-target',
      ]),
    );
  });

  it('splits on gaps greater than the configurable inactivity threshold', () => {
    const result = scan([
      timedRecord('14:00:01', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      timedRecord('14:00:11', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      timedRecord('14:00:21', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      timedRecord('14:00:31', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      timedRecord('14:00:42', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
    ]);
    expect(result.sessions.map((session) => session.id)).toEqual([
      'Player-1-session-1',
      'Player-1-session-2',
    ]);
    expect(result.sessions.map((session) => session.qualifyingActionCount)).toEqual([4, 1]);

    const custom = new TargetDummyActorDiscovery({ inactivityThresholdMs: 5_000 });
    custom.consume(timedRecord('14:00:01', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1`));
    custom.consume(timedRecord('14:00:07', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1`));
    expect(custom.finish().sessions).toHaveLength(2);
  });

  it('uses ownership priority and never infers ownership from a matching name', () => {
    const pet = 'Creature-3,"Risen Ghoul",0xa28,0x0';
    const sameNamed = 'Creature-4,"Risen Ghoul",0xa28,0x0';
    const result = scan([
      record(1, 'SPELL_SUMMON', `${OTHER},${pet},1,"Summon",0x1`),
      record(2, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(
        3,
        'SPELL_DAMAGE',
        `${pet},${TARGET},2,"Claw",0x1,Creature-3,Player-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1`,
      ),
      record(4, 'SPELL_DAMAGE', `${sameNamed},${TARGET},2,"Claw",0x1,100`),
    ]);

    expect(result.ownedEntities).toContainEqual({
      guid: 'Creature-3',
      ownerGuid: 'Player-1',
      evidence: 'advanced-owner-guid',
    });
    expect(result.ownedEntities.find((owned) => owned.guid === 'Creature-4')).toBeUndefined();
    expect(result.sessions.find((session) => session.playerGuid === 'Player-1')).toMatchObject({
      qualifyingActionCount: 2,
      playerInitiatedActionCount: 1,
    });
  });

  it('uses summon and unique-recorder mine evidence to extend an existing window', () => {
    const summoned = 'Pet-1,"Ghoul",0xa28,0x0';
    const mineGuardian = 'Guardian-1,"Guardian",0x1,0x0';
    const result = scan([
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(2, 'SPELL_SUMMON', `${MINE},${summoned},2,"Summon",0x1`),
      record(3, 'SPELL_DAMAGE', `${summoned},${TARGET},3,"Claw",0x1,100`),
      record(4, 'SPELL_DAMAGE', `${mineGuardian},${TARGET},4,"Blast",0x1,100`),
    ]);
    expect(result.ownedEntities).toEqual(
      expect.arrayContaining([
        { guid: 'Pet-1', ownerGuid: 'Player-1', evidence: 'summon' },
        { guid: 'Guardian-1', ownerGuid: 'Player-1', evidence: 'affiliation-mine' },
      ]),
    );
    expect(result.sessions[0]).toMatchObject({
      qualifyingActionCount: 3,
      playerInitiatedActionCount: 1,
    });

    const noRecorder = scan([
      record(1, 'SPELL_DAMAGE', `${OTHER},${TARGET},1,"Strike",0x1,100`),
      record(2, 'SPELL_DAMAGE', `${mineGuardian},${TARGET},4,"Blast",0x1,100`),
    ]);
    expect(noRecorder.ownedEntities).toHaveLength(0);
    expect(noRecorder.sessions[0].qualifyingActionCount).toBe(1);

    const laterAmbiguity = scan([
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(2, 'SPELL_DAMAGE', `${mineGuardian},${TARGET},4,"Blast",0x1,100`),
      record(3, 'SPELL_DAMAGE', `${SECOND_MINE},${TARGET},5,"Other",0x1,100`),
    ]);
    expect(laterAmbiguity.ownedEntities).toHaveLength(0);
    expect(
      laterAmbiguity.sessions.find((session) => session.playerGuid === 'Player-1'),
    ).toMatchObject({ qualifyingActionCount: 1 });
  });

  it('allows periodic damage to extend but not create a normal session', () => {
    const result = scan([
      record(1, 'SPELL_PERIODIC_DAMAGE', `${MINE},${TARGET},1,"Dot",0x1,100`),
      record(2, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Strike",0x1,100`),
      record(3, 'SPELL_PERIODIC_DAMAGE', `${MINE},${TARGET},1,"Dot",0x1,100`),
    ]);
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      qualifyingActionCount: 2,
      playerInitiatedActionCount: 1,
    });
  });

  it('excludes genuine encounters and their short hostile lead-in', () => {
    const result = scan([
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Pre-pull",0x1,100`),
      record(2, 'ENCOUNTER_START', '123,"Boss",16,20,1'),
      record(3, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Inside",0x1,100`),
      record(4, 'ENCOUNTER_END', '123,"Boss",16,20,1'),
      record(5, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"After",0x1,100`),
    ]);
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]).toMatchObject({
      activityStart: Date.UTC(2026, 7, 14, 14, 0, 5),
      qualifyingActionCount: 1,
    });
  });

  it('splits at hard, backwards-time, version, and target-death boundaries', () => {
    const lines = [
      timedRecord('14:00:10', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"One",0x1,100`),
      timedRecord('14:00:11', 'ZONE_CHANGE', '1,"Zone",0'),
      timedRecord('14:00:12', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Two",0x1,100`),
      timedRecord('14:00:09', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Backwards",0x1,100`),
      timedRecord('14:00:10', 'COMBAT_LOG_VERSION', '22,1,12.1.0'),
      timedRecord('14:00:11', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Three",0x1,100`),
      timedRecord('14:00:12', 'UNIT_DIED', `nil,nil,0x0,0x0,${TARGET}`),
      timedRecord('14:00:13', 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Four",0x1,100`),
    ];
    const result = scan(lines);
    expect(result.sessions).toHaveLength(5);
    expect(result.sessions.map((session) => session.qualifyingActionCount)).toEqual([
      1, 1, 1, 1, 1,
    ]);
    expect(
      result.sessions.find((session) => session.activityStart === Date.UTC(2026, 7, 14, 14, 0, 12))
        ?.fightStart,
    ).toBe(Date.UTC(2026, 7, 14, 14, 0, 11));
    expect(
      result.sessions.find((session) => session.activityStart === Date.UTC(2026, 7, 14, 14, 0, 13))
        ?.fightStart,
    ).toBe(Date.UTC(2026, 7, 14, 14, 0, 12));
  });

  it('keeps nearby-player activity in a separate per-player window', () => {
    const result = scan([
      record(1, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Mine",0x1,100`),
      record(2, 'SPELL_DAMAGE', `${OTHER},${TARGET},2,"Nearby",0x1,100`),
      record(3, 'SPELL_DAMAGE', `${MINE},${TARGET},1,"Mine",0x1,100`),
    ]);
    expect(result.sessions.map((session) => session.playerGuid)).toEqual(['Player-1', 'Player-2']);
    expect(result.sessions[0].qualifyingActionCount).toBe(2);
    expect(result.sessions[1].qualifyingActionCount).toBe(1);
  });
});
