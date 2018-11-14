import SPELLS from 'common/SPELLS/index';
import RACES from 'game/RACES';
import SPECS from 'game/SPECS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/shared/modules/Abilities';

/**
 * Heals the target for 20% of the caster's total health over 5 sec.
 */
class GiftOfTheNaaru extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.race === RACES.Draenei;
    if (!this.active) {
      return;
    }

    let spell;
    switch (this.selectedCombatant.spec) {
      case SPECS.FROST_DEATH_KNIGHT:
      case SPECS.BLOOD_DEATH_KNIGHT:
      case SPECS.UNHOLY_DEATH_KNIGHT:
        spell = SPELLS.GIFT_OF_THE_NAARU_DK;
        break;
      case SPECS.SURVIVAL_HUNTER:
      case SPECS.MARKSMANSHIP_HUNTER:
      case SPECS.BEAST_MASTERY_HUNTER:
        spell = SPELLS.GIFT_OF_THE_NAARU_HUNTER;
        break;
      case SPECS.WINDWALKER_MONK:
      case SPECS.MISTWEAVER_MONK:
      case SPECS.BREWMASTER_MONK:
        spell = SPELLS.GIFT_OF_THE_NAARU_MONK;
        break;
      case SPECS.ARCANE_MAGE:
      case SPECS.FIRE_MAGE:
      case SPECS.FROST_MAGE:
        spell = SPELLS.GIFT_OF_THE_NAARU_MAGE;
        break;
      case SPECS.HOLY_PRIEST:
      case SPECS.SHADOW_PRIEST:
      case SPECS.DISCIPLINE_PRIEST:
        spell = SPELLS.GIFT_OF_THE_NAARU_PRIEST;
        break;
      case SPECS.HOLY_PALADIN:
      case SPECS.RETRIBUTION_PALADIN:
      case SPECS.PROTECTION_PALADIN:
        spell = SPELLS.GIFT_OF_THE_NAARU_PALADIN;
        break;
      case SPECS.RESTORATION_SHAMAN:
      case SPECS.ELEMENTAL_SHAMAN:
      case SPECS.ENHANCEMENT_SHAMAN:
        spell = SPELLS.GIFT_OF_THE_NAARU_SHAMAN;
        break;
      case SPECS.FURY_WARRIOR:
      case SPECS.ARMS_WARRIOR:
      case SPECS.PROTECTION_WARRIOR:
        spell = SPELLS.GIFT_OF_THE_NAARU_WARRIOR;
        break;
      default:
        this.error("Invalid spec found for Draenei character: ", this.selectedCombatant.spec);
        return;
    }

    this.abilities.add({
      spell: spell,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      cooldown: 180,
      gcd: null,
    });
  }

}

export default GiftOfTheNaaru;
