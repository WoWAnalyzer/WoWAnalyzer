import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

const debug = false;

class InvokeChiJi extends Analyzer {
  static dependencies = {
    conbatants: Combatants
  };

  petID = null;
  healing = 0;
  overhealing = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  handleGust(event) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  fightEndDebug() {
    console.log('Chi-Ji summoned!');
  }

  statistic() {
    if (this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id)) {
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
    return <span/>
  }
};

export default InvokeChiJi;