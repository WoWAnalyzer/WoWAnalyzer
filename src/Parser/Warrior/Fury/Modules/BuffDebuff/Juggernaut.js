import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

class JuggernautReset extends Analyzer {

  resets = 0;
  stacksDropped = 0;
  stacksMax = 0;
  
  on_toPlayer_changebuffstack(event) {
    if(event.ability.guid !== SPELLS.JUGGERNAUT.id) {
      return;
    }
    
    if(event.newStacks < event.oldStacks) {
      this.resets += 1;
      this.stacksDropped += event.oldStacks;
    }

    if(this.stacksMax < event.newStacks) {
      this.stacksMax = event.newStacks;
    }
  }

  suggestions(when) {
    
    when(this.resets).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.JUGGERNAUT.id} /> stacks dropped during the fight.</span>)
          .icon(SPELLS.JUGGERNAUT.icon)
          .actual(`${actual} resets resulting in ${this.stacksDropped} stacks lost.`)
          .recommended(`0 is recommended`);
      });
  }

  juggernautResets() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Resets
        </div>
        <div className="flex-sub text-right">{this.resets}
        </div>
      </div>
    );
  }
  
  juggernautStacksDropped() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Stacks lost
        </div>
        <div className="flex-sub text-right">{this.stacksDropped}
        </div>
      </div>
    );
  }
  
  juggernautStacksMax() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Max stacks
        </div>
        <div className="flex-sub text-right">{this.stacksMax}
        </div>
      </div>
    );
  }
  
  juggernautStacksMaxDamageIncrease() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellIcon id={SPELLS.JUGGERNAUT.id} noLink /> Max stacks damage increase
        </div>
        <div className="flex-sub text-right">{this.stacksMax * 3}%
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox
        title="Juggernaut Statistics"
      >
        {this.juggernautResets()}
        {this.juggernautStacksDropped()}
        {this.juggernautStacksMax()}
        {this.juggernautStacksMaxDamageIncrease()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default JuggernautReset;