import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Mastery from '../Core/Mastery';

class CenarionWard extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
  };

  on_initialized() {
    const hasCenarionWard = this.combatants.selected.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
    this.active = hasCenarionWard;
  }

  statistic() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CENARION_WARD.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(directHealing);

    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CENARION_WARD.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    const totalPercent = directPercent + masteryPercent;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CENARION_WARD.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Cenarion Ward Healing"
        tooltip={`This is the sum of the direct healing from Cenarion Ward and the healing enabled by Cenarion Ward's extra mastery stack.
            <ul>
            <li>Direct: <b>${formatPercentage(directPercent)}%</b></li>
            <li>Mastery: <b>${formatPercentage(masteryPercent)}%</b></li>
            </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default CenarionWard;
