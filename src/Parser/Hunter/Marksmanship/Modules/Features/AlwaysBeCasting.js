import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    ...CoreAlwaysBeCasting.dependencies,
    combatants: Combatants,
  };

  static ABILITIES_ON_GCD = [
    // Marksmanship:

    // Rotational
    SPELLS.AIMED_SHOT.id,
    SPELLS.WINDBURST.id,
    SPELLS.ARCANE_SHOT.id,
    SPELLS.MULTISHOT.id,
    SPELLS.MARKED_SHOT.id,

    //Utility
    SPELLS.TAR_TRAP.id,
    SPELLS.FREEZING_TRAP.id,
    SPELLS.CONCUSSIVE_SHOT.id,
    SPELLS.FLARE.id,
    SPELLS.BURSTING_SHOT.id,

    //Off GCD
    //SPELLS.DISENGAGE_TALENT.id,
    //SPELLS.ASPECT_OF_THE_TURTLE.id,
    //SPELLS.ASPECT_OF_THE_CHEETAH.id,
    //SPELLS.EXHILARATION.id,
    //SPELLS.TRUESHOT.id,

    //Talents
    SPELLS.BLACK_ARROW_TALENT.id,
    SPELLS.EXPLOSIVE_SHOT_TALENT.id,
    SPELLS.SIDEWINDERS_TALENT.id,
    SPELLS.PIERCING_SHOT_TALENT.id,
    SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
    SPELLS.BARRAGE_TALENT.id,
    SPELLS.SENTINEL_TALENT.id,
    SPELLS.BINDING_SHOT_TALENT.id,
    SPELLS.WYVERN_STING_TALENT.id,
    SPELLS.CAMOUFLAGE_TALENT.id,
  ];

  get suggestionThresholds() {
    if (this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id)) {
      return {
        actual: this.downtimePercentage,
        isGreaterThan: {
          minor: 0.3,
          average: 0.35,
          major: 0.4,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.downtimePercentage,
        isGreaterThan: {
          minor: 0.02,
          average: 0.04,
          major: 0.06,
        },
        style: 'percentage',
      };
    }
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    //When playing with sidewinders your downtime is significantly different than when you play without, this is due to losing all instant casts
    if (this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id)) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your downtime can be improved. Try and minimise the time spent standing around doing nothing, even though you are playing with <SpellLink id={SPELLS.SIDEWINDERS_TALENT.id} />.</Wrapper>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    } else {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your downtime can be improved. Try to Always Be Casting (ABC), this means you should try to reduce the delay between casting spells. Even if you have to move, try casting something instant like <SpellLink id={SPELLS.ARCANE_SHOT.id} /> for single target or <SpellLink id={SPELLS.MULTISHOT.id} /> for multiple targets.</Wrapper>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    }
  }
}

export default AlwaysBeCasting;
