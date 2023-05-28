import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

/**
 * @property {Abilities} abilities
 */
class BloodFury extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  castEfficiency = 0.8;
  extraSuggestion = null;

  constructor(
    options: Options & {
      castEfficiency?: number;
      abilities: Abilities;
    },
  ) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Orc;
    if (!this.active) {
      return;
    }

    this.castEfficiency =
      options.castEfficiency === undefined ? this.castEfficiency : options.castEfficiency;

    options.abilities.add({
      spell: [
        SPELLS.BLOOD_FURY_PHYSICAL.id,
        SPELLS.BLOOD_FURY_SPELL_AND_PHYSICAL.id,
        SPELLS.BLOOD_FURY_SPELL.id,
      ],
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
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

export default BloodFury;
