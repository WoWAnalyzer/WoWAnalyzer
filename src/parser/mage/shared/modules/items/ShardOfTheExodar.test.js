import SPELLS from 'common/SPELLS';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import ShardOfTheExodar from './ShardOfTheExodar';

describe('Mage/Shared/Items/ShardOfTheExodar', () => {
  let parser;
  beforeEach(() => {
    parser = new TestCombatLogParser();
  });

  it('counts freshly applied Bloodlusts', () => {
    const module = new ShardOfTheExodar({ owner: parser });
    const makeEvent = spellId => ({
      type: 'applybuff',
      targetID: parser.playerId,
      ability: {
        guid: spellId,
      },
    });

    // Regular Bloodlust
    parser.triggerEvent(makeEvent(SPELLS.BLOODLUST.id));
    expect(module.actualCasts).toBe(1);
    // It ignores non-Bloodlust buffs
    parser.triggerEvent(makeEvent(SPELLS.BERSERKING.id));
    expect(module.actualCasts).toBe(1);
    // It includes non-default Bloodlusts
    parser.triggerEvent(makeEvent(SPELLS.TIME_WARP.id));
    expect(module.actualCasts).toBe(2);
    // It includes drums
    parser.triggerEvent(makeEvent(SPELLS.DRUMS_OF_FURY.id));
    expect(module.actualCasts).toBe(3);
  });
});
