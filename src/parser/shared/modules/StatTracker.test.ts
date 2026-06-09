import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import StatTracker from './StatTracker';

type StatBuffFunction = (selectedCombatant: unknown, item: null) => number;

describe('StatTracker default stat buffs', () => {
  it('tracks low-quality Frenzied Focus as 100 haste rating', () => {
    const buff = StatTracker.DEFAULT_BUFFS[SPELLS.FRENZIED_FOCUS.id];
    const selectedCombatant = {
      getGear: (slot: string) =>
        slot === 'MAINHAND'
          ? { permanentEnchant: ITEMS.WEAPON_BERSERKERS_RAGE_R1.effectId }
          : undefined,
    };

    expect((buff.haste as StatBuffFunction)(selectedCombatant, null)).toBe(100);
  });

  it('tracks high-quality Frenzied Focus as 125 haste rating', () => {
    const buff = StatTracker.DEFAULT_BUFFS[SPELLS.FRENZIED_FOCUS.id];
    const selectedCombatant = {
      getGear: (slot: string) =>
        slot === 'MAINHAND'
          ? { permanentEnchant: ITEMS.WEAPON_BERSERKERS_RAGE_R2.effectId }
          : undefined,
    };

    expect((buff.haste as StatBuffFunction)(selectedCombatant, null)).toBe(125);
  });

  it('applies Fanatical Inspiration to the selected combatant highest secondary stat', () => {
    const buff = StatTracker.DEFAULT_BUFFS[SPELLS.FANATICAL_INSPIRATION.id];
    const selectedCombatant = {
      pullStats: {
        crit: 602,
        haste: 883,
        mastery: 596,
        versatility: 337,
      },
    };

    expect((buff.haste as StatBuffFunction)(selectedCombatant, null)).toBe(173);
    expect((buff.crit as StatBuffFunction)(selectedCombatant, null)).toBe(0);
    expect((buff.mastery as StatBuffFunction)(selectedCombatant, null)).toBe(0);
    expect((buff.versatility as StatBuffFunction)(selectedCombatant, null)).toBe(0);
  });
});
