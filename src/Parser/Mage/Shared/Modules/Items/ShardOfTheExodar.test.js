import SPELLS from 'common/SPELLS';

import ShardOfTheExodar from './ShardOfTheExodar';

describe('Mage/Shared/Items/ShardOfTheExodar', () => {
  it('counts freshly applied Bloodlusts', () => {
    const module = new ShardOfTheExodar();
    const makeEvent = spellId => ({
      ability: {
        guid: spellId,
      },
    });

    // Regular Bloodlust
    module.on_toPlayer_applybuff(makeEvent(SPELLS.BLOODLUST.id));
    expect(module.actualCasts).toBe(1);
    // It ignores non-Bloodlust buffs
    module.on_toPlayer_applybuff(makeEvent(SPELLS.BERSERKING.id));
    expect(module.actualCasts).toBe(1);
    // It includes non-default Bloodlusts
    module.on_toPlayer_applybuff(makeEvent(SPELLS.TIME_WARP.id));
    expect(module.actualCasts).toBe(2);
    // It includes drums
    module.on_toPlayer_applybuff(makeEvent(SPELLS.DRUMS_OF_FURY.id));
    expect(module.actualCasts).toBe(3);
  });
});
