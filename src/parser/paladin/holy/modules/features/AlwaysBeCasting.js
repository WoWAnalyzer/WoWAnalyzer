import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'parser/core/modules/AlwaysBeCastingHealing';

const debug = false;

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HOLY_LIGHT.id,
    SPELLS.HOLY_SHOCK_CAST.id,
    // ABILITIES.JUDGMENT_CAST.id, // Only with either JoL
    SPELLS.LIGHT_OF_DAWN_CAST.id,
    SPELLS.LIGHT_OF_THE_MARTYR.id,
    SPELLS.BESTOW_FAITH_TALENT.id,
    SPELLS.HOLY_PRISM_TALENT.id,
    SPELLS.LIGHTS_HAMMER_TALENT.id,
    // ABILITIES.CRUSADER_STRIKE.id, // Only with Crusader's Might, is added in constructor if applicable
  ];

  constructor(...args) {
    super(...args);

    if (this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id)) {
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    }
    if (this.selectedCombatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id)) {
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST.id);
    }
  }

  countsAsHealingAbility(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HOLY_SHOCK_CAST.id && !event.trigger.targetIsFriendly) {
      debug && console.log(`%cABC: ${event.ability.name} (${spellId}) skipped for healing time; target is not friendly`, 'color: orange');
      return false;
    }
    return super.countsAsHealingAbility(event);
  }
}

export default AlwaysBeCasting;
