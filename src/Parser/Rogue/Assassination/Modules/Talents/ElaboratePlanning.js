import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Interface/Others/StatisticBox';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

class ElaboratePlanning extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELABORATE_PLANNING_TALENT.id);
  }

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELABORATE_PLANNING_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox 
        icon={<SpellIcon id={SPELLS.ELABORATE_PLANNING_TALENT.id} />}
        title={<SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} icon={false} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={(
          <dfn data-tip="Ideally you should be aiming for somewhere around 80% uptime. This can generally be accomplished with minimal energy pooling.">
            Elaborate Planning Uptime
          </dfn>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ElaboratePlanning;
