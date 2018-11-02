import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer from 'parser/core/Analyzer';

const SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK = 0.05;

class SpiritWolf extends Analyzer {
  damageReduced = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_WOLF_TALENT.id);
  }

  on_toPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_WOLF_BUFF.id)) {
      return;
    }
    const stacks = this.selectedCombatant.getBuff(SPELLS.SPIRIT_WOLF_BUFF.id).stacks;
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced += damageTaken / (1 - (SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks)) * (SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks);
  }

  get totalDrps() {
    return this.damageReduced / this.owner.fightDuration * 1000;
  }

  statistic() {
    const tooltip = `
      The total estimated damage reduced was ${formatThousands(this.damageReduced)}.<br /><br />
 
      This is the lowest possible value. This value is pretty accurate for this log if you are looking at the actual gain over not having Spirit Wolf bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.`;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(45)}
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.SPIRIT_WOLF_TALENT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label="Estimated damage reduced"
        tooltip={tooltip}
      />
    );
  }

}

export default SpiritWolf;
