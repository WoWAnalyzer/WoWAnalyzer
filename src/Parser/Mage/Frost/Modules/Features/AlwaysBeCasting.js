import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.FROSTBOLT.id,
    SPELLS.ICE_LANCE.id,
    SPELLS.FROZEN_ORB.id,
    SPELLS.FROST_NOVA.id,
    SPELLS.BLINK.id,
    SPELLS.ICE_BLOCK.id,
    SPELLS.BLIZZARD.id,
    SPELLS.FLURRY.id,
    SPELLS.ICE_BARRIER.id,
    SPELLS.CONE_OF_COLD.id,
	  SPELLS.EBONBOLT.id,
    SPELLS.SPELL_STEAL.id,
    SPELLS.INVISIBILITY.id,
    SPELLS.SUMMON_WATER_ELEMENTAL.id,
    SPELLS.SLOW_FALL.id,
    // talents
    SPELLS.RAY_OF_FROST_TALENT.id,
    SPELLS.MIRROR_IMAGE_TALENT.id,
    SPELLS.RUNE_OF_POWER_TALENT.id,
    SPELLS.ICE_NOVA_TALENT.id,
    SPELLS.RING_OF_FROST_TALENT.id,
    SPELLS.FROST_BOMB_TALENT.id,
	  SPELLS.GLACIAL_SPIKE_TALENT.id,
	  SPELLS.COMET_STORM_TALENT.id,
  ];

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    if (this.owner.boss.fight.noDowntimeSuggestion !== true) {
      when(deadTimePercentage).isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting instants, even unbuffed <SpellLink id={SPELLS.ICE_LANCE.id} /> spam is better than nothing.</span>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`)
            .regular(this.downtimeSuggestionThresholds.isGreaterThan.average).major(this.downtimeSuggestionThresholds.isGreaterThan.major);
        });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
