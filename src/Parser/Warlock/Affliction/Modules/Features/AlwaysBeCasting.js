import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.AGONY.id,
    SPELLS.CORRUPTION_CAST.id,
    SPELLS.DEMONIC_GATEWAY_CAST.id,
    SPELLS.DRAIN_SOUL.id,
    SPELLS.HEALTH_FUNNEL_CAST.id,
    SPELLS.LIFE_TAP.id,
    SPELLS.REAP_SOULS.id,
    SPELLS.SEED_OF_CORRUPTION_DEBUFF.id,
    SPELLS.SOULSTONE.id,
    SPELLS.UNENDING_RESOLVE.id,
    SPELLS.UNSTABLE_AFFLICTION_CAST.id,
    // talents
    SPELLS.HAUNT_TALENT.id,
    SPELLS.DEMONIC_CIRCLE_TALENT_SUMMON.id,
    SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT.id,
    SPELLS.MORTAL_COIL_TALENT.id,
    SPELLS.PHANTOM_SINGULARITY_TALENT.id,
    SPELLS.SOUL_HARVEST_TALENT.id,
    SPELLS.BURNING_RUSH_TALENT.id,
    SPELLS.SIPHON_LIFE_TALENT.id,
    // practically unused, for the sake of completeness
    SPELLS.SUMMON_DOOMGUARD_TALENTED.id,
    SPELLS.SUMMON_INFERNAL_TALENTED.id,
    SPELLS.DARK_PACT_TALENT.id,
    SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id,
    SPELLS.SUMMON_INFERNAL_UNTALENTED.id,
    SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id,
    SPELLS.HOWL_OF_TERROR_TALENT.id,
    SPELLS.GRIMOIRE_IMP.id,
    SPELLS.GRIMOIRE_VOIDWALKER.id,
    SPELLS.GRIMOIRE_FELHUNTER.id,
    SPELLS.GRIMOIRE_SUCCUBUS.id,
    SPELLS.SUMMON_IMP.id,
    SPELLS.SUMMON_VOIDWALKER.id,
    SPELLS.SUMMON_FELHUNTER.id,
    SPELLS.SUMMON_SUCCUBUS.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id} /></span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
