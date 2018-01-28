import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Abilities
    SPELLS.DEMONS_BITE.id,
    SPELLS.ANNIHILATION.id,
    SPELLS.BLADE_DANCE.id,
    SPELLS.CHAOS_STRIKE.id,
    SPELLS.DEATH_SWEEP.id,
    SPELLS.EYE_BEAM.id,
    SPELLS.FURY_OF_THE_ILLIDARI.id,
    SPELLS.THROW_GLAIVE_HAVOC.id,
    SPELLS.CHAOS_NOVA.id,
    SPELLS.METAMORPHOSIS_HAVOC.id,

    // Talents
    SPELLS.FELBLADE_TALENT.id,
    SPELLS.FEL_BARRAGE_TALENT.id,
    SPELLS.FEL_ERUPTION_TALENT.id,

    //Utility
    SPELLS.FEL_RUSH.id,
    SPELLS.VENGEFUL_RETREAT.id,
  ];

  static STATIC_GCD_ABILITIES = {
    [SPELLS.FEL_RUSH.id]: 250,
    [SPELLS.VENGEFUL_RETREAT.id]: 1000, //Not actually on the GCD but blocks all spells during its animation for 1 second
  }

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }


  suggestions(when) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, use your movement spells like <SpellLink id={SPELLS.FEL_RUSH.id} icon/>, <SpellLink id={SPELLS.FELBLADE_TALENT.id} icon/>, or <SpellLink id={SPELLS.VENGEFUL_RETREAT.id} icon/> to quickly get back to the boss.</Wrapper>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
