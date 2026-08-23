import { describe, expect, it } from 'vitest';
import {
  decodeCombatLogLine,
  decodeCsvLine,
  parseCombatLog,
  parseCombatLogTimestamp,
} from './LocalCombatLogParser';

describe('LocalCombatLogParser', () => {
  it('decodes quoted CSV fields and timestamps', () => {
    expect(decodeCsvLine('one,"two, still two","say ""hi"""')).toEqual([
      'one',
      'two, still two',
      'say "hi"',
    ]);
    expect(parseCombatLogTimestamp('2026/08/17 12:34:56.789')).toBe(
      Date.UTC(2026, 7, 17, 12, 34, 56, 789),
    );
  });

  it('recovers an unterminated encounter as a wipe and preserves unicode actors', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,999,Razorgore',
        '2026/08/17 12:00:02.000,COMBATANT_INFO,Player-1,"Åsa",0,0,0,0,251',
        '2026/08/17 12:00:03.000,SPELL_CAST_SUCCESS,Player-1,"Åsa",0,Creature-1,Boss,0,123,Strike,1',
      ].join('\n'),
      'test-id',
    );
    expect(result.report.locator).toEqual({ kind: 'local', id: 'test-id' });
    expect(result.report.fights).toHaveLength(1);
    expect(result.report.fights[0].kill).toBe(false);
    expect(result.report.friendlies[0].name).toBe('Åsa');
    expect(result.events.some((event) => event.type === 'cast')).toBe(true);
    expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes('wipe'))).toBe(true);
  });

  it('accepts Retail headers where format precedes project', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,22,1,12.1.0',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,999,Razorgore',
        '2026/08/17 12:00:02.000,COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
        '2026/08/17 12:00:03.000,ENCOUNTER_END,999,Razorgore,1',
      ].join('\n'),
    );
    expect(result.report.logVersion).toBe(22);
  });

  it('decodes native WoW timestamp/event prefixes', () => {
    expect(decodeCombatLogLine('8/17 12:00:00.000  COMBAT_LOG_VERSION,22,1,12.1.0')).toEqual([
      '8/17 12:00:00.000',
      'COMBAT_LOG_VERSION',
      '22',
      '1',
      '12.1.0',
    ]);
    expect(parseCombatLogTimestamp('8/17 12:00:00.000')).not.toBeNull();
  });

  it('tolerates BOM-prefixed and bare version headers', () => {
    expect(decodeCombatLogLine('\uFEFF8/17 12:00:00.000 COMBAT_LOG_VERSION,22,1')).toEqual([
      '8/17 12:00:00.000',
      'COMBAT_LOG_VERSION',
      '22',
      '1',
    ]);
    expect(() =>
      parseCombatLog(
        [
          'COMBAT_LOG_VERSION,22,1,12.1.0',
          '8/17 12:00:01.000  ENCOUNTER_START,1,Boss',
          '8/17 12:00:02.000  COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
          '8/17 12:00:03.000  ENCOUNTER_END,1,Boss,1',
        ].join('\n'),
      ),
    ).not.toThrow();
  });

  it('accepts the current Retail v22 timestamp and named version fields', () => {
    const header =
      '8/14/2026 12:08:52.7962  COMBAT_LOG_VERSION,22,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,12.1.0,PROJECT_ID,1';
    expect(decodeCombatLogLine(header)).toEqual([
      '8/14/2026 12:08:52.7962',
      'COMBAT_LOG_VERSION',
      '22',
      'ADVANCED_LOG_ENABLED',
      '1',
      'BUILD_VERSION',
      '12.1.0',
      'PROJECT_ID',
      '1',
    ]);
    expect(parseCombatLogTimestamp('8/14/2026 12:08:52.7962')).toBe(
      Date.UTC(2026, 7, 14, 12, 8, 52, 796),
    );
  });

  it('uses v22 actor positions, encounter difficulty, and combatant spec', () => {
    const result = parseCombatLog(
      [
        '8/14/2026 12:08:52.7962  COMBAT_LOG_VERSION,22,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,12.1.0,PROJECT_ID,1',
        '8/14/2026 12:08:52.7972  ZONE_CHANGE,469,"Blackwing Lair",9',
        '8/14/2026 12:09:00.7432  SPELL_CAST_SUCCESS,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12557-00007EE8CE,"Grethok the Controller",0x10a48,0x80000000,49020,"Obliterate",0x1',
        '8/14/2026 12:09:00.7442  SWING_DAMAGE,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12557-00007EE8CE,"Grethok the Controller",0x10a48,0x80000000,Player-3702-0A70D8DF,0000000000000000,607040,607040,2535,334,1956,62,0,0,6,200,1000,0,-7621.32,-1024.47,287,0.2419,286,60959128,63784932,60901192,1,0,0,0,nil,nil,nil',
        '8/14/2026 12:09:00.7452  SPELL_ENERGIZE,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,49020,"Obliterate",0x1,Player-3702-0A70D8DF,0000000000000000,607040,607040,2535,334,1956,62,0,0,6,200,1000,0,-7621.32,-1024.47,287,0.2419,286,20.0000,0.0000,6,1000',
        '8/14/2026 12:09:00.7772  ENCOUNTER_START,610,"Razorgore the Untamed",9,40,469',
        '8/14/2026 12:09:01.0002  COMBATANT_INFO,Player-3702-0A70D8DF,1,1944,513,30352,334,0,0,0,0,1186,1186,1186,98,52,276,276,276,0,1175,34,34,34,1956,251,[]',
        '8/14/2026 12:09:01.1002  SPELL_CAST_SUCCESS,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12435-00007EE8CE,"Razorgore the Untamed",0x10a48,0x80000000,49184,"Howling Blast",0x10,Player-3702-0A70D8DF,0000000000000000,607040,607040,2535,334,1956,62,0,0,5,6,6,2,-7621.32,-1024.47,287,0.2419,286',
        '8/14/2026 12:09:01.1012  SPELL_AURA_APPLIED,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12435-00007EE8CE,"Razorgore the Untamed",0x10a48,0x80000000,55095,"Frost Fever",0x10,DEBUFF',
        '8/14/2026 12:09:01.1022  SPELL_DAMAGE,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12435-00007EE8CE,"Razorgore the Untamed",0x10a48,0x80000000,49184,"Howling Blast",0x10,Creature-0-1465-469-4188-12435-00007EE8CE,0000000000000000,50000,100000,0,0,100,0,0,0,0,0,0,0,-7616.54,-1024.10,287,3.2303,32,12345,13000,-1,16,nil,nil,2345,1,nil,nil,nil',
        '8/14/2026 12:09:01.1032  SPELL_HEAL,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,45470,"Death Strike",0x20,Player-3702-0A70D8DF,0000000000000000,600000,607040,2535,334,1956,62,0,0,6,200,1000,0,-7621.32,-1024.47,287,0.2419,286,4000,5000,1000,0,nil',
        '8/14/2026 12:09:01.1042  SWING_DAMAGE,Creature-0-1465-469-4188-12435-00007EE8CE,"Razorgore the Untamed",0x10a48,0x80000000,Player-3702-0A70D8DF,"Pølsefatter-ArgentDawn-EU",0x511,0x80000000,Creature-0-1465-469-4188-12435-00007EE8CE,0000000000000000,50000,100000,0,0,100,0,0,0,0,0,0,0,-7616.54,-1024.10,287,3.2303,32,7000,7500,-1,1,nil,nil,0,nil,nil,nil,nil',
        '8/14/2026 12:09:04.0002  ENCOUNTER_END,610,"Razorgore the Untamed",9,40,0',
      ].join('\n'),
    );
    expect(result.report.fights[0]).toMatchObject({
      name: 'Razorgore the Untamed',
      difficulty: 9,
      size: 40,
      kill: false,
    });
    expect(result.report.friendlies).toEqual([
      expect.objectContaining({ name: 'Pølsefatter-ArgentDawn-EU' }),
    ]);
    expect(result.report.enemies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Razorgore the Untamed', type: 'NPC' }),
      ]),
    );
    expect(result.actors.find((actor) => actor.name === 'Pølsefatter-ArgentDawn-EU')).toMatchObject(
      {
        className: 'DeathKnight',
        fightDetails: { 1: { specID: 251 } },
      },
    );
    expect(result.events.find((event) => event.type === 'cast')).toMatchObject({
      ability: { guid: 49020, name: 'Obliterate' },
    });
    expect(result.events.find((event) => event.type === 'damage')).toMatchObject({
      ability: { guid: 6603, name: 'Auto Attack' },
      amount: 57936,
      unmitigatedAmount: 63784932,
      overkill: 60901192,
    });
    expect(result.events.find((event) => event.type === 'resourcechange')).toMatchObject({
      ability: { guid: 49020, name: 'Obliterate' },
      resourceChange: 20,
      waste: 0,
      resourceChangeType: 6,
      classResources: [{ type: 6, amount: 200, max: 1000 }],
    });
    expect(
      result.events.find((event) => event.type === 'cast' && event.ability.guid === 49184),
    ).toMatchObject({
      classResources: [{ type: 5, amount: 6, max: 6, cost: 2 }],
      resourceActor: 1,
    });
    expect(result.events.find((event) => event.type === 'applydebuff')).toMatchObject({
      ability: { guid: 55095, name: 'Frost Fever' },
      sourceIsFriendly: true,
      targetIsFriendly: false,
    });
    expect(
      result.events.find((event) => event.type === 'damage' && event.ability.guid === 49184),
    ).toMatchObject({
      amount: 12345,
      absorbed: 2345,
      overkill: 0,
      hitType: 2,
      tick: false,
    });
    expect(result.events.find((event) => event.type === 'heal')).toMatchObject({
      amount: 4000,
      overheal: 1000,
      absorbed: 0,
      hitType: 1,
    });
    expect(
      result.events.find((event) => event.type === 'damage' && event.sourceIsFriendly === false),
    ).toMatchObject({
      amount: 7000,
      targetIsFriendly: true,
    });
  });

  it('keeps participants and combatant info scoped to each fight', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,1,First',
        '2026/08/17 12:00:01.100,COMBATANT_INFO,Player-1,Unknown,0,0,0,0,251',
        '2026/08/17 12:00:01.200,COMBATANT_INFO,Player-2,Bryn,0,0,0,0,65',
        '2026/08/17 12:00:01.300,SPELL_CAST_SUCCESS,Player-1,Ada,0,Creature-1,Boss,0,100,Strike,1',
        '2026/08/17 12:00:01.400,SPELL_SUMMON,Player-1,Ada,0,Pet-1,Wolf,0,200,Summon,1',
        '2026/08/17 12:00:02.000,ENCOUNTER_END,1,First,1',
        '2026/08/17 12:01:01.000,ENCOUNTER_START,2,Second',
        '2026/08/17 12:01:01.100,COMBATANT_INFO,Player-1,Ada,0,0,0,0,250',
        '2026/08/17 12:01:01.200,COMBATANT_INFO,Player-3,Cora,0,0,0,0,264',
        '2026/08/17 12:01:01.300,SPELL_CAST_SUCCESS,Player-1,Ada,0,Creature-2,Boss,0,101,Strike,1',
        '2026/08/17 12:01:02.000,ENCOUNTER_END,2,Second,1',
      ].join('\n'),
    );

    const ada = result.actors.find((actor) => actor.guid === 'Player-1')!;
    expect(ada.name).toBe('Ada');
    expect(ada.fightIds).toEqual([1, 2]);
    expect(ada.fightDetails[1]).toMatchObject({ specID: 251, role: 'dps' });
    expect(ada.fightDetails[2]).toMatchObject({ specID: 250, role: 'tank' });
    expect(ada.fightDetails[1].combatant.timestamp).not.toBe(
      ada.fightDetails[2].combatant.timestamp,
    );
    expect(result.events.filter((event) => event.type === 'combatantinfo')).toMatchObject([
      { specID: 251 },
      { specID: 65 },
      { specID: 250 },
      { specID: 264 },
    ]);

    expect(result.report.friendlies.find((player) => player.name === 'Bryn')?.fights).toEqual([
      { id: 1 },
    ]);
    expect(result.report.friendlies.find((player) => player.name === 'Cora')?.fights).toEqual([
      { id: 2 },
    ]);
    expect(result.report.friendlyPets[0].fights).toEqual([{ id: 1, instances: 1 }]);
  });

  it('normalizes absorbed records and accepts missed records without damage events', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,1,Boss',
        '2026/08/17 12:00:01.100,COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
        '2026/08/17 12:00:01.200,SPELL_CAST_SUCCESS,Player-2,Healer,0,Player-1,Ada,0,456,Barrier,2',
        '2026/08/17 12:00:01.300,SPELL_ABSORBED,Creature-1,Boss,0,Player-1,Ada,0,123,Hit,1,Player-2,Healer,0,0,456,Barrier,2,789',
        '2026/08/17 12:00:01.400,SPELL_MISSED,Creature-1,Boss,0,Player-1,Ada,0,123,Hit,1,DODGE',
        '2026/08/17 12:00:02.000,ENCOUNTER_END,1,Boss,1',
      ].join('\n'),
    );

    expect(result.events.find((event) => event.type === 'absorbed')).toMatchObject({
      ability: { guid: 456, name: 'Barrier' },
      extraAbility: { guid: 123, name: 'Hit' },
      amount: 789,
      sourceID: result.actors.find((actor) => actor.guid === 'Player-2')?.id,
    });
    expect(result.events.filter((event) => event.type === 'damage')).toHaveLength(0);
    expect(result.diagnostics).toEqual([]);
  });

  it('accepts non-normalized metadata, landed swings, and failed casts without warnings', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:00.100,MAP_CHANGE,2444,Dragon Isles',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,1,Boss',
        '2026/08/17 12:00:01.100,COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
        '2026/08/17 12:00:01.200,SWING_DAMAGE,Player-1,Ada,0,Creature-1,Boss,0,100,-1,1,0,0,0,nil,nil,nil',
        '2026/08/17 12:00:01.201,SWING_DAMAGE_LANDED,Player-1,Ada,0,Creature-1,Boss,0,100,-1,1,0,0,0,nil,nil,nil',
        '2026/08/17 12:00:01.300,SPELL_CAST_FAILED,Player-1,Ada,0,Creature-1,Boss,0,123,Strike,1,Out of range',
        '2026/08/17 12:00:02.000,ENCOUNTER_END,1,Boss,1',
      ].join('\n'),
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.events.filter((event) => event.type === 'damage')).toHaveLength(1);
    expect(result.events.filter((event) => event.type === 'cast')).toHaveLength(0);
  });

  it('normalizes environmental damage and periodic energize records', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,1,Boss',
        '2026/08/17 12:00:01.100,COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
        '2026/08/17 12:00:01.200,ENVIRONMENTAL_DAMAGE,0000000000000000,Environment,0,Player-1,Ada,0,FALLING,100,-1,1,0,0,0,nil,nil,nil',
        '2026/08/17 12:00:01.300,SPELL_PERIODIC_ENERGIZE,Player-1,Ada,0,Player-1,Ada,0,123,Regeneration,1,5,0,6,100',
        '2026/08/17 12:00:02.000,ENCOUNTER_END,1,Boss,1',
      ].join('\n'),
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.events.find((event) => event.type === 'damage')).toMatchObject({
      ability: { guid: 0, name: 'FALLING', type: 1 },
      amount: 100,
      targetIsFriendly: true,
    });
    expect(result.events.find((event) => event.type === 'resourcechange')).toMatchObject({
      ability: { guid: 123, name: 'Regeneration' },
      resourceChange: 5,
      resourceChangeType: 6,
    });
  });

  it('normalizes healing absorbed records', () => {
    const result = parseCombatLog(
      [
        '2026/08/17 12:00:00.000,COMBAT_LOG_VERSION,1,22',
        '2026/08/17 12:00:01.000,ENCOUNTER_START,1,Boss',
        '2026/08/17 12:00:01.100,COMBATANT_INFO,Player-1,Ada,0,0,0,0,251',
        '2026/08/17 12:00:01.200,SPELL_HEAL_ABSORBED,Player-2,Absorber,0x518,0,Player-1,Ada,0x518,0,448005,Healing Absorb,2,Player-3,Healer,0x518,0,1244893,Restoring Light,2,1193,1193',
        '2026/08/17 12:00:02.000,ENCOUNTER_END,1,Boss,1',
      ].join('\n'),
    );

    const absorber = result.actors.find((actor) => actor.guid === 'Player-2');
    const healer = result.actors.find((actor) => actor.guid === 'Player-3');
    expect(result.diagnostics).toEqual([]);
    expect(result.events.find((event) => event.type === 'healabsorbed')).toMatchObject({
      ability: { guid: 448005, name: 'Healing Absorb' },
      sourceID: absorber?.id,
      targetID: result.actors.find((actor) => actor.guid === 'Player-1')?.id,
      healerID: healer?.id,
      healerAbility: { guid: 1244893, name: 'Restoring Light' },
      amount: 1193,
    });
  });
});
