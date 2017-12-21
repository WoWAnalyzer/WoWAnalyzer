import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.CHAOS_BOLT.id,
    SPELLS.CONFLAGRATE.id,
    SPELLS.DEMONIC_GATEWAY_CAST.id,
    SPELLS.DRAIN_LIFE.id,
    SPELLS.HAVOC.id,
    SPELLS.HEALTH_FUNNEL_CAST.id,
    SPELLS.IMMOLATE_CAST.id,
    SPELLS.INCINERATE.id,
    SPELLS.LIFE_TAP.id,
    SPELLS.SOULSTONE.id,
    SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id,
    SPELLS.SUMMON_INFERNAL_UNTALENTED.id,
    SPELLS.GRIMOIRE_IMP.id,
    SPELLS.UNENDING_RESOLVE.id,
    // talents
    SPELLS.BURNING_RUSH_TALENT.id,
    SPELLS.CATACLYSM_TALENT.id,
    SPELLS.CHANNEL_DEMONFIRE_TALENT.id,
    SPELLS.DEMONIC_CIRCLE_TALENT_SUMMON.id,
    SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT.id,
    SPELLS.MORTAL_COIL_TALENT.id,
    SPELLS.SOUL_HARVEST_TALENT.id,
    SPELLS.SHADOWBURN_TALENT.id,
    // practically unused, for the sake of completeness
    SPELLS.SUMMON_DOOMGUARD_TALENTED.id,
    SPELLS.SUMMON_INFERNAL_TALENTED.id,
    SPELLS.DARK_PACT_TALENT.id,
    SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id,
    SPELLS.SHADOWFURY_TALENT.id,
    SPELLS.GRIMOIRE_VOIDWALKER.id,
    SPELLS.GRIMOIRE_FELHUNTER.id,
    SPELLS.GRIMOIRE_SUCCUBUS.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. When you know you'll be moving, try to save <SpellLink id={SPELLS.DIMENSIONAL_RIFT_CAST.id} /> or <SpellLink id={SPELLS.CONFLAGRATE.id} /> charges or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id} />. Make good use of your <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT.id} /> when you can. </span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
