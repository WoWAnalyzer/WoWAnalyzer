import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options } from 'parser/core/Analyzer';
import { EndChannelEvent, EventType, GlobalCooldownEvent } from 'parser/core/Events';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

const debug = false;

const AVENGING_CRUSADER_SPELLS = [SPELLS.CRUSADER_STRIKE.id, SPELLS.JUDGMENT_CAST_HOLY.id];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  hasAC: boolean = false;

  constructor(options: Options) {
    super(options);

    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.FLASH_OF_LIGHT.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.HOLY_LIGHT.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.HOLY_SHOCK_CAST.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.LIGHT_OF_DAWN_CAST.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.LIGHT_OF_THE_MARTYR.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.WORD_OF_GLORY.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.HAMMER_OF_WRATH.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.BESTOW_FAITH_HOLY_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.HOLY_PRISM_HOLY_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.LIGHTS_HAMMER_HOLY_TALENT.id);

    this.hasAC = this.selectedCombatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id);

    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_MIGHT_HOLY_TALENT.id)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    }

    if (this.selectedCombatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT.id)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST_HOLY.id);
    }
  }

  countsAsHealingAbility(event: GlobalCooldownEvent | EndChannelEvent) {
    const spellId = event.ability.guid;

    if (event.type === EventType.GlobalCooldown) {
      if (spellId === SPELLS.HOLY_SHOCK_CAST.id && !event.trigger?.targetIsFriendly) {
        debug &&
          console.log(
            `%cABC: ${event.ability.name} (${spellId}) skipped for healing time; target is not friendly`,
            'color: orange',
          );
        return false;
      }
    }

    if (
      this.hasAC &&
      this.selectedCombatant.hasBuff(SPELLS.AVENGING_CRUSADER_TALENT.id, event.timestamp) &&
      AVENGING_CRUSADER_SPELLS.includes(spellId)
    ) {
      return true;
    }

    return super.countsAsHealingAbility(event);
  }
}

export default AlwaysBeCasting;
