import SPELLS from 'common/SPELLS';

import SPELLS from 'common/SPELLS';

import { formatPercentage, formatDuration } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import { STATISTIC_ORDER } from 'Main/StatisticBox';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  static ABILITIES_ON_GCD = [

    //Holy Power Builders
    SPELLS.CRUSADER_STRIKE.id,
    SPELLS.ZEAL_TALENT.id,
    SPELLS.BLADE_OF_JUSTICE.id,
    SPELLS.DIVINE_HAMMER_TALENT.id,
    SPELLS.WAKE_OF_ASHES.id,

    //Holy Power Spenders
    SPELLS.TEMPLARS_VERDICT.id,
    SPELLS.DIVINE_STORM.id,
    SPELLS.EXECUTION_SENTENCE_TALENT.id,
    SPELLS.JUSTICARS_VENGEANCE_TALENT.id,
    SPELLS.WORD_OF_GLORY_TALENT.id,

    //Other DPS Abilities
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CONSECRATION_TALENT.id,
    SPELLS.HOLY_WRATH_TALENT.id,

    //Utility
    SPELLS.DIVINE_STEED.id,
    SPELLS.BLINDING_LIGHT_TALENT.id,
    SPELLS.REPENTANCE_TALENT.id,
    SPELLS.EYE_FOR_AN_EYE_TALENT.id,
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CRUSADER_STRIKE.id,
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.DIVINE_STEED.id,
    26573, // Consecration
    SPELLS.BLINDING_LIGHT_TALENT.id,
    642, // Divine Shield
    SPELLS.LAY_ON_HANDS.id,
    SPELLS.BLESSING_OF_FREEDOM.id,
    1022, // Blessing of Protection
    853, // Hammer of Justice
    SPELLS.HAND_OF_RECKONING.id,
  ];

  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    super.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );
    this.verifyCast(begincast, cast, globalCooldown);
  }
  verifyCast(begincast, cast, globalCooldown) {
    if (cast.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }
    const castTime = cast.timestamp - begincast.timestamp;
    if (!this.constructor.inRange(castTime, globalCooldown, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
      console.warn(`Expected Flash of Light cast time (${castTime}) to match GCD (${Math.round(globalCooldown)}) @${formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000)}`, this.combatants.selected.activeBuffs());
    }
  }

  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your dead GCD time can be improved. Try to Always Be Casting (ABC)')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(1);
      });
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
