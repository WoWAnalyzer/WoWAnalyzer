import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import {STATISTIC_ORDER} from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Rotational
    SPELLS.BLOODTHIRST.id,
    SPELLS.FURIOUS_SLASH.id,
    SPELLS.EXECUTE_FURY.id,
    SPELLS.RAGING_BLOW.id,
    SPELLS.RAMPAGE.id,
    SPELLS.WHIRLWIND_FURY.id,
    SPELLS.ODYNS_FURY.id,
    // Utility
    SPELLS.CHARGE.id,
    SPELLS.HEROIC_THROW.id,
    SPELLS.HEROIC_LEAP.id,
    // Talents
    SPELLS.SHOCKWAVE_TALENT.id,
    SPELLS.STORM_BOLT_TALENT.id,
    SPELLS.AVATAR_TALENT.id,
    SPELLS.BLOODBATH_TALENT.id,
    SPELLS.DRAGON_ROAR_TALENT.id,
  ];

suggestions(when) {
  const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

  when(deadTimePercentage).isGreaterThan(0.1)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Try casting your filler whether it be <SpellLink id={SPELLS.FURIOUS_SLASH.id} /> or <SpellLink id={SPELLS.WHIRLWIND_FURY.id} /> in between cooldowns. If on the move, try casting <SpellLink id={SPELLS.HEROIC_THROW.id} /></span>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(recommended + 0.15).major(recommended + 0.2);
    });
}

showStatistic = true;
statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;