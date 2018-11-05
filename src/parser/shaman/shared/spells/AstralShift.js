import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Analyzer from 'parser/core/Analyzer';

const ASTRAL_SHIFT_DR = 0.4;

class AstralShift extends Analyzer {
  damageReduced = 0;

  on_toPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ASTRAL_SHIFT.id)) {
      return;
    }
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced += damageTaken / (1 - (ASTRAL_SHIFT_DR)) * (ASTRAL_SHIFT_DR);
  }

  get totalDrps() {
    return this.damageReduced / this.owner.fightDuration * 1000;
  }

  statistic() {
    const tooltip = `
      The total estimated damage reduced was ${formatThousands(this.damageReduced)}.<br /><br />
 
      This is the lowest possible value. This value is pretty accurate for this log if you are looking at the actual gain over not having Astral Shift bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.`;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.ASTRAL_SHIFT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label="Estimated damage reduced"
        tooltip={tooltip}
      />
    );
  }

}

export default AstralShift;
