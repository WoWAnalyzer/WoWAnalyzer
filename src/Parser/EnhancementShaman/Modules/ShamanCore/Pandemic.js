import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const SPELLID = SPELLS.FLAMETONGUE_BUFF.id;
const PANDEMIC_THRESHOLD = 11500;
const debug = false;

class Pandemic extends Module {
  ft_timestamp = [];
  early_refresh = [];
  refresh_avearge;
  static dependencies = {
    combatants: Combatants,
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid === SPELLID) {
      this.ft_timestamp.push(event.timestamp);

    }
  }

  on_byPlayer_refreshbuff(event) {
    if(event.ability.guid === SPELLID) {
      this.ft_timestamp.push(event.timestamp);
    }
  }

  on_finished() {
    let diff;

    for (let i = 1; i < this.ft_timestamp.length; i++) {
      diff = this.ft_timestamp[i] - this.ft_timestamp[i - 1];
      if(diff < PANDEMIC_THRESHOLD) {
        this.early_refresh.push(diff);
      }
    }
    debug && console.log(this.early_refresh);
    if(this.early_refresh.length > 0) {
      this.refresh_avearge = this.early_refresh.reduce((a, b) => a + b) / this.early_refresh.length;
    }
  }

  suggestions(when) {
    when(this.early_refresh.length).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Avoid refreshing Flametonue with more then 4.5 sec left on the buff. Some early refreshes are unavoidable.`)
          .icon(SPELLS.FLAMETONGUE_BUFF.icon)
          .actual(`${actual} early refreshes`)
          .recommended(`${(recommended)} recommended`)
          .regular(recommended+2).major(recommended + 5);
      });
  }
}

export default Pandemic;
