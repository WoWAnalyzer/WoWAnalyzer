import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

const debug = false;

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HOLY_LIGHT.id,
    SPELLS.HOLY_SHOCK_CAST.id,
    SPELLS.LIGHT_OF_DAWN_CAST.id,
    SPELLS.LIGHT_OF_THE_MARTYR.id,
    SPELLS.BESTOW_FAITH_TALENT.id,
    SPELLS.HOLY_PRISM_TALENT.id,
    SPELLS.LIGHTS_HAMMER_TALENT.id,
  ];

  constructor(...args) {
    super(...args);

    if (this.selectedCombatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id)) {
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST.id);
      this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    } else {
      if (this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id)) {
        this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
      }
      if (this.selectedCombatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id)) {
        this.constructor.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST.id);
      }
    }
  }

  countsAsHealingAbility(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HOLY_SHOCK_CAST.id && !event.trigger.targetIsFriendly) {
      debug &&
        console.log(
          `%cABC: ${event.ability.name} (${spellId}) skipped for healing time; target is not friendly`,
          'color: orange',
        );
      return false;
    }

    // using crusdars might, count Crusader Strike healing spell, or if Avenging Crusdaer is active, count for healing //
    if (
      spellId === SPELLS.CRUSADER_STRIKE.id &&
      !this.selectedCombatant.hasBuff(SPELLS.AVENGING_CRUSADER_TALENT.id, event.timestamp) &&
      !this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id)
    ) {
      return false;
    }

    // if judging light, always count as healing spell, or if Avenging Crusdaer is active, count for healing //
    if (
      spellId === SPELLS.JUDGMENT_CAST.id &&
      !this.selectedCombatant.hasBuff(SPELLS.AVENGING_CRUSADER_TALENT.id, event.timestamp) &&
      !this.selectedCombatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id)
    ) {
      return false;
    }
    return super.countsAsHealingAbility(event);
  }
}

export default AlwaysBeCasting;
