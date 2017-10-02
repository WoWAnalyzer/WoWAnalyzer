import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [

    // Marksmanship:
    SPELLS.AIMED_SHOT.id,
    SPELLS.WINDBURST.id,
    SPELLS.ARCANE_SHOT.id,
    SPELLS.MULTISHOT.id,
    SPELLS.MARKED_SHOT.id,
    SPELLS.TAR_TRAP.id,
    SPELLS.FREEZING_TRAP.id,

    SPELLS.BLACK_ARROW_TALENT.id,
    SPELLS.EXPLOSIVE_SHOT_TALENT.id,
    SPELLS.SIDEWINDERS_TALENT.id,
    SPELLS.PIERCING_SHOT_TALENT.id,
    SPELLS.TRICK_SHOT_TALENT.id,
    SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
    SPELLS.BARRAGE_TALENT.id,


  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your dead GCD time can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant like <SpellLink id={SPELLS.ARCANE_SHOT.id} /> for single target or <SpellLink id={SPELLS.MULTISHOT.id} /> for multiple</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.10);
      });
  }

  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Dead time"
        tooltip="Dead time is available casting time not used for casting any spell. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/being stunned), etc."
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
