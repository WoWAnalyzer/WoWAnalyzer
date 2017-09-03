import React from 'react';
import StatisticBox from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Mastery from './Mastery';

class Cultivation extends Module {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
  };

  on_initialized() {
    const hasCultivation = this.combatants.selected.hasTalent(SPELLS.CULTIVATION_TALENT.id);
    this.active = hasCultivation;
  }

  statistic() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CULTIVATION.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(directHealing);

    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CULTIVATION.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    const totalPercent = directPercent + masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CULTIVATION.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Cultivation"
        tooltip={`This is the sum of the direct healing from Cultivation and the healing enabled by Cultivation's extra mastery stack. The direct healing from Cultivation is ${formatPercentage(directPercent)}% of your healing done, and the mastery healing from Cultivation is ${formatPercentage(masteryPercent)}%`}
      />
    );
  }

}

export default Cultivation;
