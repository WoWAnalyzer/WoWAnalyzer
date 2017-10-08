import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class IcicleTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  IciclesWasted = 0;

  on_initialized() {
	const hasGlacialSpike = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
	this.active = hasGlacialSpike;
  }
  
  on_refreshbuff(event) {
	  if(event.ability.guid === SPELLS.GLACIAL_SPIKE_BUFF.id) {
		  this.IciclesWasted += 1;
	  }
  }
  
  suggestions(when) {
    when(this.IciclesWasted).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You wasted {this.IciclesWasted} <SpellLink id={SPELLS.ICICLES.id}/>.  Try to cast <SpellLink id={SPELLS.GLACIAL_SPIKE.id}/> once you get to 5 Icicles to avoid wasting them.</span>)
          .icon(SPELLS.ICICLES.icon)
          .actual(`${formatNumber(actual)} Icicles Wasted`)
          .recommended(`${formatNumber(recommended)} is recommended`)
          .regular(3).major(10);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICICLES.id} />}
        value={`${formatNumber(this.IciclesWasted)}`}
        label="Icicles Wasted" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default IcicleTracker;
