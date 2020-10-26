import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';

import RunicPowerTracker from '../runicpower/RunicPowerTracker';

class RedThirst extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RED_THIRST_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_BLOOD), this.onCast);
  }

  onCast(event) {
    this.casts += 1;
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
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            {formatNumber(this.reduction)} sec total effective reduction and {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%) wasted reduction.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RED_THIRST_TALENT}>
          <>
            <UptimeIcon /> {formatNumber(this.averageReduction)} sec <small>average reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RedThirst;
