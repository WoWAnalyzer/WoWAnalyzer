import React from 'react';
import StatisticBox from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Mastery from './Mastery';

class SpringBlossoms extends Module {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
  };

  on_initialized() {
    const hasSpringBlossoms = this.combatants.selected.hasTalent(SPELLS.SPRING_BLOSSOMS_TALENT.id);
    this.active = hasSpringBlossoms;
  }

  statistic() {
    const direct = this.mastery.getDirectHealing(SPELLS.SPRING_BLOSSOMS.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(direct);

    const mastery = this.mastery.getMasteryHealing(SPELLS.SPRING_BLOSSOMS.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(mastery);

    const totalPercent = directPercent + masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPRING_BLOSSOMS.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Spring Blossoms Healing"
        tooltip={`This is the sum of the direct healing from Spring Blossoms and the healing enabled by Spring Blossom's extra mastery stack.
            <ul>
            <li>Direct: <b>${formatPercentage(directPercent)}%</b></li>
            <li>Mastery: <b>${formatPercentage(masteryPercent)}%</b></li>
            </ul>`}
      />
    );
  }
  suggestions(when) {
    const direct = this.mastery.getDirectHealing(SPELLS.SPRING_BLOSSOMS.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(direct);

    const mastery = this.mastery.getMasteryHealing(SPELLS.SPRING_BLOSSOMS.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(mastery);

    const totalPercent = directPercent + masteryPercent;

    when(totalPercent).isLessThan(0.07)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your healing from <SpellLink id={SPELLS.SPRING_BLOSSOMS.id} /> could be improved.
          Either your efflorescence uptime could be improved or the encounter doesn't fit this talent very well.</span>)
          .icon(SPELLS.SPRING_BLOSSOMS.icon)
          .actual(`${formatPercentage(totalPercent)}% healing`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.02).major(recommended - 0.02);
      });
  }

}

export default SpringBlossoms;
