import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Mastery from '../Core/Mastery';

class Cultivation extends Analyzer {
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
        label="Cultivation Healing"
        tooltip={`This is the sum of the direct healing from Cultivation and the healing enabled by Cultivation's extra mastery stack.
            <ul>
            <li>Direct: <b>${formatPercentage(directPercent)}%</b></li>
            <li>Mastery: <b>${formatPercentage(masteryPercent)}%</b></li>
            </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  suggestions(when) {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CULTIVATION.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(directHealing);

    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CULTIVATION.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    const totalPercent = directPercent + masteryPercent;

    when(totalPercent).isLessThan(0.08)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your healing from <SpellLink id={SPELLS.CULTIVATION.id} /> could be improved. You may have too many healers or doing easy
          content, thus having low cultivation proc rate. You may considering selecting another talent.</span>)
          .icon(SPELLS.CULTIVATION.icon)
          .actual(`${formatPercentage(totalPercent)}% healing`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.02).major(recommended - 0.04);
      });
  }
}

export default Cultivation;
