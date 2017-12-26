import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.CALL_DREADSTALKERS.id,
    SPELLS.DEMONIC_EMPOWERMENT.id,
    SPELLS.DEMONWRATH_CAST.id,
    SPELLS.DOOM.id,
    SPELLS.FELSTORM.id, // TODO: verify it is casted by player or pet
    SPELLS.HAND_OF_GULDAN_CAST.id,
    SPELLS.LIFE_TAP.id,
    SPELLS.SHADOW_BOLT.id,
    SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id,
    SPELLS.SUMMON_INFERNAL_UNTALENTED.id,
    SPELLS.THALKIELS_CONSUMPTION_CAST.id,
    SPELLS.SUMMON_FELGUARD.id,
    SPELLS.SOULSTONE.id,
    SPELLS.HEALTH_FUNNEL_CAST.id,
    SPELLS.UNENDING_RESOLVE.id,
    SPELLS.DEMONIC_GATEWAY_CAST.id,
    // talents
    SPELLS.DEMONIC_CIRCLE_TALENT_SUMMON.id,
    SPELLS.DEMONIC_CIRCLE_TALENT_TELEPORT.id,
    SPELLS.MORTAL_COIL_TALENT.id,
    SPELLS.SOUL_HARVEST_TALENT.id,
    SPELLS.BURNING_RUSH_TALENT.id,
    SPELLS.GRIMOIRE_FELGUARD.id,
    SPELLS.SUMMON_DARKGLARE_TALENT.id,
    SPELLS.DEMONBOLT_TALENT.id,
    // practically unused, for the sake of completeness
    SPELLS.SHADOWFLAME_TALENT.id,
    SPELLS.SHADOWFURY_TALENT.id,
    SPELLS.DARK_PACT_TALENT.id,
    SPELLS.GRIMOIRE_IMP.id,
    SPELLS.GRIMOIRE_VOIDWALKER.id,
    SPELLS.GRIMOIRE_FELHUNTER.id,
    SPELLS.GRIMOIRE_SUCCUBUS.id,
    SPELLS.SUMMON_DOOMGUARD_TALENTED.id,
    SPELLS.SUMMON_INFERNAL_TALENTED.id,
    SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id,
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
