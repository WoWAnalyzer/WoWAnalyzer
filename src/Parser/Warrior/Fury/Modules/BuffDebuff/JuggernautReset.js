import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class juggernautReset extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  resets = 0;
  stacksDropped = 0;

  on_toPlayer_changebuffstack(event) {
    if(event.ability.guid === SPELLS.JUGGERNAUT.id && event.newStacks < event.oldStacks) {
      this.resets += 1;
      this.stacksDropped += event.oldStacks;
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

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.JUGGERNAUT.id} />}
        value={`${this.resets} resets`}
        label={`${this.stacksDropped} stacks dropped`}
      />
    );
  }
}

export default juggernautReset;