import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

class InvokeChiJi extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
  }

  handleGust(event) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(50)}
        icon={<SpellIcon id={SPELLS.GUST_OF_MISTS_CHIJI.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <TooltipElement content="This is the effective healing contributed by Chi-Ji's Gust of Mists.">
            Gust of Mists Healing
          </TooltipElement>
        )}
      />
    );
  }
}

export default InvokeChiJi;