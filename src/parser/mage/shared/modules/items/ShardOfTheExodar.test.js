import SPELLS from 'common/SPELLS';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';

import ShardOfTheExodar from './ShardOfTheExodar';

describe('Mage/Shared/Items/ShardOfTheExodar', () => {
  let parser;
  let eventEmitter;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    eventEmitter = parser.getModule(EventEmitter);
  });

  it('counts freshly applied Bloodlusts', () => {
    const module = parser.loadModule(ShardOfTheExodar);
    const makeEvent = spellId => ({
      type: 'applybuff',
      targetID: parser.playerId,
      ability: {
        guid: spellId,
      },
    });

    // Regular Bloodlust
    eventEmitter.triggerEvent(makeEvent(SPELLS.BLOODLUST.id));
    expect(module.actualCasts).toBe(1);
    // It ignores non-Bloodlust buffs
    eventEmitter.triggerEvent(makeEvent(SPELLS.BERSERKING.id));
    expect(module.actualCasts).toBe(1);
    // It includes non-default Bloodlusts
    eventEmitter.triggerEvent(makeEvent(SPELLS.TIME_WARP.id));
    expect(module.actualCasts).toBe(2);
    // It includes drums
    eventEmitter.triggerEvent(makeEvent(SPELLS.DRUMS_OF_FURY.id));
    expect(module.actualCasts).toBe(3);
  });
});
