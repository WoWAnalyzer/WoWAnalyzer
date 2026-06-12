import ITEMS from 'common/ITEMS/midnight/enchants';
import SPELLS from 'common/SPELLS/midnight/enchants';
import { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import FrenziedFocus from './FrenziedFocus';

type WeaponSlot = 'MAINHAND' | 'OFFHAND';

function makeOptions(
  enchants: Partial<Record<WeaponSlot, number>>,
  statTracker: Pick<StatTracker, 'add'>,
): Options {
  return {
    owner: {
      selectedCombatant: {
        getGear: (slot: WeaponSlot) =>
          enchants[slot] == null ? undefined : { permanentEnchant: enchants[slot] },
      },
    },
    priority: 0,
    statTracker,
  } as unknown as Options;
}

function loadFrenziedFocus(enchants: Partial<Record<WeaponSlot, number>>) {
  const statTracker = {
    add: vi.fn(),
  };

  return {
    analyzer: new FrenziedFocus(makeOptions(enchants, statTracker)),
    statTracker,
  };
}

describe('FrenziedFocus', () => {
  it('tracks rank 1 Frenzied Focus as 100 haste rating', () => {
    const { statTracker } = loadFrenziedFocus({
      MAINHAND: ITEMS.WEAPON_BERSERKERS_RAGE_R1.effectId,
    });

    expect(statTracker.add).toHaveBeenCalledWith(SPELLS.FRENZIED_FOCUS.id, { haste: 100 });
  });

  it('tracks rank 2 Frenzied Focus as 125 haste rating', () => {
    const { statTracker } = loadFrenziedFocus({
      MAINHAND: ITEMS.WEAPON_BERSERKERS_RAGE_R2.effectId,
    });

    expect(statTracker.add).toHaveBeenCalledWith(SPELLS.FRENZIED_FOCUS.id, { haste: 125 });
  });

  it('uses the highest equipped Frenzied Focus rank', () => {
    const { statTracker } = loadFrenziedFocus({
      MAINHAND: ITEMS.WEAPON_BERSERKERS_RAGE_R1.effectId,
      OFFHAND: ITEMS.WEAPON_BERSERKERS_RAGE_R2.effectId,
    });

    expect(statTracker.add).toHaveBeenCalledWith(SPELLS.FRENZIED_FOCUS.id, { haste: 125 });
  });

  it('is inactive without a matching weapon enchant', () => {
    const { analyzer, statTracker } = loadFrenziedFocus({});

    expect(analyzer.active).toBe(false);
    expect(statTracker.add).not.toHaveBeenCalled();
  });
});
