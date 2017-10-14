import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.FROSTBOLT.id,
    SPELLS.ICE_LANCE_CAST.id,
    SPELLS.FROZEN_ORB.id,
    SPELLS.FROST_NOVA.id,
    SPELLS.BLINK.id,
    SPELLS.ICE_BLOCK.id,
    SPELLS.BLIZZARD.id,
    SPELLS.FLURRY.id,
    SPELLS.ICE_BARRIER.id,
    SPELLS.CONE_OF_COLD.id,
	  SPELLS.EBONBOLT.id,
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

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting instants, even unbuffed <SpellLink id={SPELLS.ICE_LANCE_CAST.id} /> spam is better than nothing.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }
  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Dead time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Downtime"
        tooltip="Downtime is available casting time not used for casting any spell. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/being stunned), etc."
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
