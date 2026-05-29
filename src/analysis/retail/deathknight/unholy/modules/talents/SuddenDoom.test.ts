import SPELLS from 'common/SPELLS';
import DK_SPELLS from 'common/SPELLS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { AnyEvent, EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import { SuddenDoomLinkNormalizer } from '../../normalizers/SuddenDoomLink';
import SuddenDoom from './SuddenDoom';

const SD = SPELLS.SUDDEN_DOOM_BUFF.id;
const DC = SPELLS.DEATH_COIL.id;
const NC = DK_SPELLS.NECROTIC_COIL.id;
const SS = 55090;

function applybuff(timestamp: number): AnyEvent {
  return {
    type: EventType.ApplyBuff,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: { guid: SD, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  };
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
  };
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
  };
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
  };
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
  };
}

function fightend(timestamp: number): AnyEvent {
  return {
    type: EventType.FightEnd,
    timestamp,
  } as AnyEvent;
}

function cast(timestamp: number, spellId = DC, runicPowerRaw?: number): AnyEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 2,
    targetIsFriendly: false,
    ability: { guid: spellId, name: 'Death Coil', type: 32, abilityIcon: 'ability_deathcoil' },
    classResources:
      runicPowerRaw === undefined
        ? undefined
        : [
            {
              type: RESOURCE_TYPES.RUNIC_POWER.id,
              amount: runicPowerRaw,
              cost: 0,
              max: 1300,
            },
          ],
  };
}

function setup(events: AnyEvent[]) {
  const parser = new TestCombatLogParser();
  const linkNorm = parser.loadModule(SuddenDoomLinkNormalizer, {
    priority: 0,
  }) as EventLinkNormalizer;
  const module = parser.loadModule(SuddenDoom, { priority: 1 }) as SuddenDoom;

  // Stub dependencies so the module works in the test environment.
  // abilities: onAnyCast uses this to filter off-GCD / external casts — return a valid on-GCD ability for every spell.
  // runicPowerTracker: fallback when classResources is absent from a cast event.
  const moduleWithDeps = module as unknown as {
    deps: {
      abilities: { getAbility: (_spellId: number) => { gcd: { static: number } } };
      runicPowerTracker: { current: number };
    };
  };

  moduleWithDeps.deps.abilities = {
    getAbility: (_spellId: number) => ({ gcd: { static: 1500 } }),
  };
  moduleWithDeps.deps.runicPowerTracker = { current: 0 };

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

  it('does not count refreshbuff as overwritten when it arrives before removebuffstack', () => {
    const module = setup([
      applybuff(1000),
      applybuffstack(2000, 2),
      cast(3000),
      refreshbuff(3250),
      removebuffstack(3250, 1),
      cast(4000),
      removebuff(4250),
    ]);

    expect(module.consumedProcs).toBe(2);
    expect(module.wastedRefreshes).toBe(0);
    expect(module.wastedExpires).toBe(0);
    expect(module.totalProcs).toBe(2);
  });

  it('does not create a phantom consume window when cast is before applybuffstack and linked removal is later', () => {
    const module = setup([
      applybuff(1000),
      cast(3000, NC),
      applybuffstack(3070, 2),
      removebuffstack(3250, 1),
      refreshbuff(3250),
      cast(4000, NC),
      removebuff(4250),
    ]);

    expect(module.consumedProcs).toBe(2);
    expect(module.wastedProcs).toBe(0);
    expect(module.totalProcs).toBe(2);
    expect(module.procWindows).toHaveLength(2);
    expect(module.procWindows[0].casts).toHaveLength(1);
    expect(module.procWindows[0].casts[0].spellId).toBe(NC);
    expect(module.procWindows[1].casts).toHaveLength(1);
    expect(module.procWindows[1].casts[0].spellId).toBe(NC);
  });

  it('does not count refreshbuff as overwrite when only 1 stack is active', () => {
    const module = setup([applybuff(1000), refreshbuff(5000), cast(6000), removebuff(6250)]);

    expect(module.consumedProcs).toBe(1);
    expect(module.wastedRefreshes).toBe(0);
    expect(module.totalProcs).toBe(1);
  });

  it('counts overwrite when refreshbuff happens at 2 stacks without a same-timestamp consume', () => {
    const module = setup([
      applybuff(1000),
      applybuffstack(2000, 2),
      refreshbuff(3000),
      fightend(4000),
    ]);

    expect(module.consumedProcs).toBe(0);
    expect(module.wastedRefreshes).toBe(1);
    expect(module.wastedExpires).toBe(2);
    expect(module.totalProcs).toBe(3);
  });

  it('preserves cast history on overwritten windows', () => {
    const module = setup([
      applybuff(1000),
      applybuffstack(2000, 2),
      cast(2500, SS, 200),
      refreshbuff(3000),
      fightend(4000),
    ]);

    const overwrittenWindow = module.procWindows.find((w) => w.resolution === 'overwritten');

    expect(overwrittenWindow).toBeDefined();
    expect(overwrittenWindow!.casts).toHaveLength(1);
    expect(overwrittenWindow!.casts[0].spellId).toBe(SS);
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
    expect(module.procWindows[0].casts[0].suddenDoomStacks).toBe(2);
    expect(module.procWindows[1].casts).toHaveLength(1);
    expect(module.procWindows[1].casts[0].spellId).toBe(NC);
    expect(module.procWindows[1].casts[0].suddenDoomStacks).toBe(1);
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

  it('tracks casts while a proc is active until consumption', () => {
    const module = setup([
      applybuff(1000),
      cast(1200, SS, 100),
      cast(1300, DC, 250),
      removebuff(1450),
    ]);

    expect(module.procWindows).toHaveLength(1);
    expect(module.procWindows[0].resolution).toBe('consumed');
    expect(module.procWindows[0].casts).toHaveLength(2);
    expect(module.procWindows[0].casts[0].spellId).toBe(SS);
    expect(module.procWindows[0].casts[0].hadEnoughRunicPower).toBe(false);
    expect(module.procWindows[0].casts[1].spellId).toBe(DC);
    expect(module.procWindows[0].casts[1].hadEnoughRunicPower).toBe(true);
  });

  it('flags expired procs that had at least one 15+ RP cast opportunity', () => {
    const module = setup([applybuff(1000), cast(1500, SS, 200), removebuff(11000)]);

    expect(module.wastedExpires).toBe(1);
    expect(module.expiredWithSpendableRunicPower).toBe(1);
  });
});
