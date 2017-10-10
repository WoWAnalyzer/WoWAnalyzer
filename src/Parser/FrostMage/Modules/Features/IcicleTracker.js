import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class IcicleTracker extends Module {

  wasted = 0;

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
	this.active = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_toPlayer_refreshbuff(event) {
    if(event.ability.guid === SPELLS.GLACIAL_SPIKE_BUFF.id) {
      this.wasted += 1;
	  }
  }

  suggestions(when) {
    when(this.wasted).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You wasted {this.wasted} <SpellLink id={SPELLS.ICICLES.id}/>.  Try to cast <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id}/> once you get to 5 Icicles to avoid wasting them. Getting some wasted Icicles is unavoidable since <SpellLink id={SPELLS.FROSTBOLT.id}/> has a chance to generate 2 Icicles, but you should try and keep this number as low as possible.</span>)
          .icon(SPELLS.ICICLES.icon)
          .actual(`${formatNumber(actual)} Icicles Wasted`)
          .recommended(`${formatNumber(5)} is recommended`)
          .regular(7).major(12);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ICICLES.id} />}
        value={`${formatNumber(this.wasted)}`}
        label="Icicles Wasted" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default IcicleTracker;
