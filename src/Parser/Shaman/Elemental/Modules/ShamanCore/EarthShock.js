import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import { STATISTIC_ORDER } from 'Main/StatisticBox';


class EarthShock extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  maelstromSpend = [];
  maelstromSpendInAscendence = [];
  latershock=false;


  get avgMalestromSpend() {
    let spend = this.maelstromSpend.reduce((prev, cur) => {
      return prev + cur;
    }, 0);
    spend /= this.maelstromSpend.length || 1;
    return spend;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.EARTH_SHOCK.id && !this.latershock) {
      this.latershock=true;
      if (event.resource.type === RESOURCE_TYPES.MAELSTROM.id){
          if (this.player.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id)) {
            this.maelstromSpendInAscendence.push(event.resource.amount);
          }
          else {
            this.maelstromSpend.push(event.resource.amount);
          }
        }
    }

    if(event.resource.amount<40)
      this.latershock=false;

  }

  suggestions(when) {
  /*  if (true) {
      when(Math.abs((70+85)/2-this.avgMalestromSpend)).isGreaterThan(12.5)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> when you have 70-85 Maelstrom when gambling.</span>)
            .icon(SPELLS.EARTH_SHOCK.icon)
            .actual(`${this.avgMalestromSpend} Maelstrom spend on avg.`)
            .recommended(`70-85 is recommended`)
            .regular(5).major(15);
        });
    }*/
  }
}

export default EarthShock;
