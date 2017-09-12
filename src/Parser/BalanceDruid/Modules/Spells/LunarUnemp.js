import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
//import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
//import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Empowerments from '../Core/Empowerments';

//const debug = false;

class LunarUnemp extends Empowerments {
  suggestions(when) {    
    when(this.UnempLunar).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You casted {actual} unempowered <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> out of {this.LunarCasts} total.</span>)
          .icon(SPELLS.LUNAR_STRIKE.icon)
          .actual(`${actual} Unempowered LS`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.06).major(recommended + 0.11);
      });
  }

  /*statistic() {
    //const unempPercentage = this.UnempSolar / this.SolarCasts;
    
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LUNAR_STRIKE.id} />}
        value={`${this.UnempLunar} / ${this.LunarCasts}`}
        label='Unempowered LS'
        tooltip={`You got total <b>${this.UnempLunar}</b> of unempowered Lunar Wrath casts`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);*/
}

export default LunarUnemp;
