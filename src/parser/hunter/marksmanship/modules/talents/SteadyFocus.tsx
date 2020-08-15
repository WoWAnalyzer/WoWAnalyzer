import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import HasteIcon from 'interface/icons/Haste';
import { formatPercentage } from 'common/format';
import { STEADY_FOCUS_HASTE_PERCENT } from 'parser/hunter/marksmanship/constants';

/**
 * Using Steady Shot twice in a row increases your Haste by 7% for 10 sec.
 *
 * Example log:
 *
 */

class SteadyFocus extends Analyzer {

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STEADY_FOCUS_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.STEADY_FOCUS_BUFF.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * STEADY_FOCUS_HASTE_PERCENT;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.STEADY_FOCUS_TALENT}>
          <>
            <HasteIcon /> {formatPercentage(this.avgHaste)}% <small>average Haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default SteadyFocus;
