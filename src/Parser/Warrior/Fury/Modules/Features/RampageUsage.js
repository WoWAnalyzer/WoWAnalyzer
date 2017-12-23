import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
// import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import SPELLS from 'common/SPELLS';
// import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
// import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';
import Wrapper from 'common/Wrapper';

class RampageUsage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    // spellUsable: SpellUsable,
  };

  casts = []

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.RAMPAGE.id) {
      return;
    }
    
    const rage = Math.floor(event.classResources[0]['amount'] / 10);
    
    // Ignore any free casts due to Massacre talent
    if(this.combatants.selected.hasBuff(SPELLS.MASSACRE.id)) {
      return;
    }

    // Frothing Berserker users should maximize casts with 100 rage to proc Frothing Berserker the post
    this.casts.push({rage: rage, event: event});

    // console.log("Total rampage casts: " + this.casts + ", casts at 100 rage: " + this.castsAt100Rage + ", average rage spent: " + this.rageSpent / this.casts + ", percent at 100: " + this.castsAt100Rage / this.casts);
  }

  get suggestionThresholdsFrothingBerserker() {
    return {
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      isLessThan: {
          minor,
          average,
          major,
        },
      } = this.suggestionThresholdsFrothingBerserker;

    if(this.casts.length > 0) {
      const averageRage = this.casts.reduce(function(acc, obj) { return acc + obj.rage; }, 0) / this.casts.length;
      console.log("average:" + averageRage + ", casts: " + this.casts.length);
    }
    
    // Frothing Berserker users should cast Rampage at 100 rage only
    // if(this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id)) {
    // when((this.castsAt100Rage / this.casts).toFixed(2)).isLessThan(minor)
    //   .addSuggestion((suggest, actual, recommended) => {
    //     return suggest(<Wrapper>Try to cast <SpellLink id={SPELLS.RAMPAGE.id} /> at 100 rage to proc <SpellLink id={SPELLS.FROTHING_BERSERKER_TALENT.id} />.</Wrapper>)
    //       .icon(SPELLS.RAMPAGE.icon)
    //       .actual(`${actual * 100}% of your Rampage casts were cast at 100 rage.`)
    //       .recommended(`>${minor * 100}% is recommended`)
    //       .regular(average).major(major);
    //   });

      // Carnage users should cast Rampage at 70 rage

      // Otherwise cast at 80 rage
    // }
  }
}

export default RampageUsage;