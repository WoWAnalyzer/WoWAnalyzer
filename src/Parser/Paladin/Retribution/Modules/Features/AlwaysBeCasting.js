import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Holy Power Builders
    SPELLS.CRUSADER_STRIKE.id,
    SPELLS.ZEAL_TALENT.id,
    SPELLS.BLADE_OF_JUSTICE.id,
    SPELLS.DIVINE_HAMMER_TALENT.id,
    SPELLS.WAKE_OF_ASHES.id,

    // Holy Power Spenders
    SPELLS.TEMPLARS_VERDICT.id,
    SPELLS.DIVINE_STORM.id,
    SPELLS.EXECUTION_SENTENCE_TALENT.id,
    SPELLS.JUSTICARS_VENGEANCE_TALENT.id,
    SPELLS.WORD_OF_GLORY_TALENT.id,

    // Other DPS Abilities
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CONSECRATION_TALENT.id,
    SPELLS.HOLY_WRATH_TALENT.id,

    // Utility
    SPELLS.DIVINE_STEED.id,
    SPELLS.BLINDING_LIGHT_TALENT.id,
    SPELLS.REPENTANCE_TALENT.id,
    SPELLS.EYE_FOR_AN_EYE_TALENT.id,
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.CRUSADER_STRIKE.id,
    225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
    SPELLS.DIVINE_STEED.id,
    SPELLS.CONSECRATION_CAST.id,
    SPELLS.DIVINE_SHIELD.id,
    SPELLS.BLESSING_OF_FREEDOM.id,
    SPELLS.BLESSING_OF_PROTECTION.id,
    SPELLS.HAMMER_OF_JUSTICE.id,
    SPELLS.HAND_OF_RECKONING.id,
  ];

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(deadTimePercentage).isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant with range like <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> or <SpellLink id={SPELLS.DIVINE_STORM.id} /></Wrapper>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`)
            .regular(this.suggestionThresholds.isGreaterThan.average).major(this.suggestionThresholds.isGreaterThan.major);
        });
    }
  }

  static icons = {
    activeTime: '/img/wheelchair.png',
    downtime: '/img/afk.png',
  };
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
