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
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.LIGHT_OF_THE_MARTYR_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.WORD_OF_GLORY.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.HOLY_LIGHT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.HOLY_SHOCK_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.LIGHT_OF_DAWN_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.HAMMER_OF_WRATH_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS.HOLY_PRISM_TALENT.id);

    this.hasAC = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_MIGHT_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    }

    if (this.selectedCombatant.hasTalent(TALENTS.JUDGMENT_OF_LIGHT_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST_HOLY.id);
    }
  }

  isHealingAbility(event: EndChannelEvent | GlobalCooldownEvent) {
    const spellId = event.ability.guid;

    if (event.type === EventType.GlobalCooldown) {
      if (spellId === TALENTS.HOLY_SHOCK_TALENT.id && !event.trigger?.targetIsFriendly) {
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
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_CRUSADER_TALENT.id, event.timestamp) &&
      AVENGING_CRUSADER_SPELLS.includes(spellId)
    ) {
      return true;
    }

    return super.isHealingAbility(event);
  }
}

export default AlwaysBeCasting;
