import SPELLS from 'common/SPELLS';
import StatTracker from './StatTracker';

type StatBuffFunction = (selectedCombatant: unknown, item: null) => number;

describe('StatTracker default stat buffs', () => {
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
