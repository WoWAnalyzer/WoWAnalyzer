import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import RunicPowerTracker from '../runicpower/RunicPowerTracker';

class RedThirst extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RED_THIRST_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VAMPIRIC_BLOOD.id) {
      this.casts += 1;
    }
  }

  get reduction(){
    return this.runicPowerTracker.cooldownReduction / 1000;
  }

  get wastedReduction(){
    return this.runicPowerTracker.cooldownReductionWasted / 1000;
  }

  get averageReduction(){
    return (this.reduction / this.casts) || 0;
  }

  get wastedPercent(){
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.RED_THIRST_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(7)}
        value={`${formatNumber(this.averageReduction)} sec`}
        label="Red Thirst average reduction"
        tooltip={`${formatNumber(this.reduction)} sec total effective reduction and ${formatNumber(this.wastedReduction)} sec (${formatPercentage(this.wastedPercent)}%) wasted reduction.`}
      />
    );
  }
}

export default RedThirst;
