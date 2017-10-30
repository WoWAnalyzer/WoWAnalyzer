import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class IcicleTracker extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  wasted = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_toPlayer_refreshbuff(event) {
    if(event.ability.guid === SPELLS.GLACIAL_SPIKE_BUFF.id) {
      this.wasted += 1;
	  }
  }

  suggestions(when) {
    const wastedPerMinute = (this.wasted) / (this.owner.fightDuration / 60000);
    when(wastedPerMinute).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You wasted {wastedPerMinute.toFixed(2)} <SpellLink id={SPELLS.ICICLES_BUFF.id}/> Per Minute.  Try to cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id}/> once you get to 5 Icicles to avoid wasting them. Getting some wasted Icicles is unavoidable since <SpellLink id={SPELLS.FROSTBOLT.id}/> has a chance to generate 2 Icicles, but you should try and keep this number as low as possible.</span>)
          .icon(SPELLS.ICICLES_BUFF.icon)
          .actual(`${formatNumber(actual)} Icicles Wasted`)
          .recommended(`${formatNumber(3)} is recommended`)
          .regular(3).major(5);
      });
  }
  statistic() {
    const wastedPerMinute = (this.wasted) / (this.owner.fightDuration / 60000);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICICLES_BUFF.id} />}
        value={`${wastedPerMinute.toFixed(2)}`}
        label="Icicles Wasted Per Minute" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default IcicleTracker;
