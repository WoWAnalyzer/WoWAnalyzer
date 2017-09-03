import React from 'react';
import StatisticBox from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

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
        label="Spring Blossoms"
        tooltip={`This is the sum of the direct healing from Spring Blossoms and the healing enabled by Spring Blossom's extra mastery stack. The direct healing from Spring Blossoms is ${formatPercentage(directPercent)}% of your healing done, and the mastery healing from Spring Blossoms is ${formatPercentage(masteryPercent)}%`}
      />
    );
  }

}

export default SpringBlossoms;
