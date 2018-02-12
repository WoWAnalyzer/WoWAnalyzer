import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from "Parser/Core/Modules/Combatants";
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class SliceAndDiceUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
	on_initialized(){
		this.active = this.combatants.selected.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id);
  }

  get percentUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.SLICE_AND_DICE_TALENT.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GARROTE.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={`Slice And Dice Uptime`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(100);

}

export default SliceAndDiceUptime;
