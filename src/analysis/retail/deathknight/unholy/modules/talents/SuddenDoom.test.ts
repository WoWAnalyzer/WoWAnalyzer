import SPELLS from 'common/SPELLS';
import DK_SPELLS from 'common/SPELLS/deathknight';
import { AnyEvent, EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { SuddenDoomLinkNormalizer } from '../../normalizers/SuddenDoomLink';
import SuddenDoom from './SuddenDoom';

const SD = SPELLS.SUDDEN_DOOM_BUFF.id;
const DC = SPELLS.DEATH_COIL.id;
const NC = DK_SPELLS.NECROTIC_COIL.id;

function applybuff(timestamp: number): AnyEvent {
  return {
    type: EventType.ApplyBuff,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function applybuffstack(timestamp: number, stack: number): AnyEvent {
  return {
    type: EventType.ApplyBuffStack,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    stack,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function removebuffstack(timestamp: number, stack: number): AnyEvent {
  return {
    type: EventType.RemoveBuffStack,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    stack,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function refreshbuff(timestamp: number): AnyEvent {
  return {
    type: EventType.RefreshBuff,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function removebuff(timestamp: number): AnyEvent {
  return {
    type: EventType.RemoveBuff,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function fightend(timestamp: number): AnyEvent {
  return {
    type: EventType.FightEnd,
    timestamp,
  } as AnyEvent;
}

function cast(timestamp: number, spellId = DC): AnyEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 2,
    targetIsFriendly: false,
    ability: { guid: spellId, name: 'Death Coil', type: 32, abilityIcon: '' },
  } as AnyEvent;
}

function setup(events: AnyEvent[]) {
  const parser = new TestCombatLogParser();
  const linkNorm = parser.loadModule(SuddenDoomLinkNormalizer, {
    priority: 0,
  }) as EventLinkNormalizer;
  const module = parser.loadModule(SuddenDoom, { priority: 1 }) as SuddenDoom;

  const normalized = linkNorm.normalize(events);
  parser.processEvents(normalized);
  return module;
}

describe('SuddenDoom analyzer', () => {
  it('tracks a simple consume: applybuff → cast → removebuff', () => {
    const module = setup([applybuff(1000), cast(1200), removebuff(1450)]);

    expect(module.consumedProcs).toBe(1);
    expect(module.wastedProcs).toBe(0);
    expect(module.totalProcs).toBe(1);
  });

  it('tracks an expired proc (removebuff with no cast nearby)', () => {
    const module = setup([applybuff(1000), removebuff(11000)]);

    expect(module.consumedProcs).toBe(0);
    expect(module.wastedExpires).toBe(1);
    expect(module.totalProcs).toBe(1);
  });

  it('does not count refreshbuff as overwritten when it co-occurs with removebuffstack', () => {
    // Real WCL pattern: at 2 stacks, cast consumes one, new proc arrives simultaneously.
    // WCL emits: cast → removebuffstack(stack=1) + refreshbuff at same timestamp.
    // The refreshbuff is NOT an overwrite — it's a new proc arriving.
    const module = setup([
      applybuff(1000),
      applybuffstack(2000, 2),
      cast(3000),
      removebuffstack(3250, 1),
      refreshbuff(3250),
      // Then consume the remaining stack
      cast(4000),
      removebuff(4250),
    ]);

    expect(module.consumedProcs).toBe(2);
    expect(module.wastedRefreshes).toBe(0);
    expect(module.wastedExpires).toBe(0);
    expect(module.totalProcs).toBe(2);
  });

  it('counts a genuine overwrite when refreshbuff fires without removebuffstack', () => {
    // At 1 stack, no removebuffstack, refreshbuff alone = true overwrite
    const module = setup([applybuff(1000), refreshbuff(5000), cast(6000), removebuff(6250)]);

    expect(module.consumedProcs).toBe(1);
    expect(module.wastedRefreshes).toBe(1);
    expect(module.totalProcs).toBe(2);
  });

  it('expires all stacks when a multi-stack buff expires', () => {
    // 2 stacks expire without any cast — both are wasted
    const module = setup([applybuff(1000), applybuffstack(2000, 2), removebuff(15000)]);

    expect(module.consumedProcs).toBe(0);
    expect(module.wastedExpires).toBe(2);
    expect(module.totalProcs).toBe(2);
  });

  it('handles the full 2-stack consume-and-reproc sequence from real data', () => {
    // Real pattern: applybuff → applybuffstack(2) → cast → removebuffstack(1) + refreshbuff
    //              → cast → removebuff
    // Two consumed, zero wasted
    const module = setup([
      applybuff(1000),
      applybuffstack(2000, 2),
      cast(3000, NC),
      removebuffstack(3230, 1),
      refreshbuff(3230),
      cast(4000, NC),
      removebuff(4248),
    ]);

    expect(module.consumedProcs).toBe(2);
    expect(module.wastedProcs).toBe(0);
    expect(module.totalProcs).toBe(2);
  });

  it('handles multiple sequential procs correctly', () => {
    const module = setup([
      // Proc 1: consumed
      applybuff(1000),
      cast(2000),
      removebuff(2250),
      // Proc 2: expired
      applybuff(5000),
      removebuff(15000),
      // Proc 3: consumed
      applybuff(20000),
      cast(21000),
      removebuff(21250),
    ]);

    expect(module.consumedProcs).toBe(2);
    expect(module.wastedExpires).toBe(1);
    expect(module.totalProcs).toBe(3);
  });

  it('expires active stacks on fight end', () => {
    const module = setup([applybuff(1000), applybuffstack(2000, 2), fightend(5000)]);

    expect(module.consumedProcs).toBe(0);
    expect(module.wastedExpires).toBe(2);
    expect(module.totalProcs).toBe(2);
  });

  it('does not add expired procs on fight end if already consumed', () => {
    const module = setup([applybuff(1000), cast(2000), removebuff(2250), fightend(5000)]);

    expect(module.consumedProcs).toBe(1);
    expect(module.wastedExpires).toBe(0);
    expect(module.totalProcs).toBe(1);
  });

  it('does not double-count when cast fires before removebuff', () => {
    // Cast at 2000, removebuff at 2250 (within 500ms link window)
    // Both onCast and onRemoveBuff see this — should only count once
    const module = setup([applybuff(1000), cast(2000), removebuff(2250)]);

    expect(module.consumedProcs).toBe(1);
    expect(module.totalProcs).toBe(1);
  });
});
