import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import SpellIcon from 'common/SpellIcon';
import BoringValue from 'interface/statistics/components/BoringValueText';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import Mastery from '../core/Mastery';

class CenarionWard extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  constructor(...args) {
    super(...args);
    const hasCenarionWard = this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
    this.active = hasCenarionWard;
  }

  statistic() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CENARION_WARD_HEAL.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(directHealing);

    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CENARION_WARD_HEAL.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    const totalPercent = directPercent + masteryPercent;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL}
        size="flexible"
        tooltip={(
          <>
            This is the sum of the direct healing from Cenarion Ward and the healing enabled by Cenarion Ward's extra mastery stack.
            <ul>
              <li>Direct: <strong>{formatPercentage(directPercent)}%</strong></li>
              <li>Mastery: <strong>{formatPercentage(masteryPercent)}%</strong></li>
            </ul>
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.CENARION_WARD_HEAL.id} /> Cenarion Ward healing</>}>
          <>
            {formatPercentage(totalPercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default CenarionWard;
