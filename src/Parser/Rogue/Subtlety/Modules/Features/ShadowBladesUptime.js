import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';


class ShadowBladesUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  statistic() {
    const shadowDanceUptime = this.combatants.selected.getBuffUptime(SPELLS.SHADOW_DANCE_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_DANCE_BUFF.id} />}
        value={`${formatPercentage(shadowDanceUptime)} %`}
        label={(
          <dfn data-tip={'Shadow Dance up time'}>
            Shadow Dance up time
          </dfn>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default ShadowBladesUptime;
