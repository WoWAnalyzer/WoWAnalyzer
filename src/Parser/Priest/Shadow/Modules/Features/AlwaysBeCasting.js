import React from 'react';

import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // handled in _removebuff
    SPELLS.VOID_TORRENT.id,
    SPELLS.MIND_FLAY.id,
    // SPELLS.DISPERSION.id,

    // rotational:
    SPELLS.VOID_BOLT.id,
    SPELLS.VOID_ERUPTION.id,
    SPELLS.MIND_BLAST.id,
    SPELLS.VAMPIRIC_TOUCH.id,
    SPELLS.SHADOW_WORD_DEATH.id,
    SPELLS.SHADOW_WORD_PAIN.id,
    SPELLS.SHADOWFIEND.id,
    SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id,

    // talents:
    SPELLS.MINDBENDER_TALENT_SHADOW.id,
    SPELLS.POWER_INFUSION_TALENT.id,
    SPELLS.SHADOW_CRASH_TALENT.id,
    SPELLS.SHADOW_WORD_VOID_TALENT.id,
    SPELLS.MIND_BOMB_TALENT.id,

    // utility:
    SPELLS.SHADOWFORM.id,
    SPELLS.MIND_VISION.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.MASS_DISPEL.id,
    SPELLS.LEVITATE.id,
    SPELLS.SHACKLE_UNDEAD.id,
    SPELLS.PURIFY_DISEASE.id,
  ];

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      actual,
      isGreaterThan: {
        minor,
        average,
        major,
      },
    } = this.suggestionThresholds;

    when(actual).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default AlwaysBeCasting;
