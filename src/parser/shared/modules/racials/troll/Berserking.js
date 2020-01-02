import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

/**
 * @property {Abilities} abilities
 */
class Berserking extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  castEfficiency = 0.8;
  extraSuggestion = null;

  constructor(options) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Troll;
    if (!this.active) {
      return;
    }

    this.gcd = (options.gcd === undefined) ? this.gcd : options.gcd;
    this.castEfficiency = (options.castEfficiency === undefined) ? this.castEfficiency : options.castEfficiency;

    this.abilities.add({
      spell: SPELLS.BERSERKING,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 180,
      gcd: null,
      timelineSortIndex: 35,
      castEfficiency: {
        suggestion: this.castEfficiency !== null,
        recommendedEfficiency: this.castEfficiency,
        extraSuggestion: this.extraSuggestion,
      },
    });
  }
}

export default Berserking;
