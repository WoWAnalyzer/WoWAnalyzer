import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class RampageUsage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
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
  }

  get suggestionThresholdsFrothingBerserker() {
    return {
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 5,
      },
      style: 'fixed',
    };
  }

  suggestions(when) {
    const {
      isGreaterThan: {
          minor,
          average,
          major,
        },
      } = this.suggestionThresholdsFrothingBerserker;

    if(this.casts.length > 0) {
      // Frothing Berserker users should cast Rampage at 100 rage only
      if(this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id)) {

        const castsBelow100 = [];
        let battle_cry_last = false;

        for (let i = 0; i < this.casts.length; i++) {
          const event = this.casts[i].event;
          const rage = Math.floor(event.classResources[0]['amount'] / 10);
          const battle_cry = this.combatants.selected.hasBuff(SPELLS.BATTLE_CRY.id, event.timestamp);

          if (rage !== 100 && !battle_cry) {
            castsBelow100.push(this.casts[i]);
          }

          // If running Reckless Abandon, a premature Rampage might make sense, as casting Battle Cry
          // instantly generates 100 rage.
          if (this.combatants.selected.hasTalent(SPELLS.RECKLESS_ABANDON_TALENT.id)) {
            if (!battle_cry_last && battle_cry) {
              battle_cry_last = true;
              
              // If last cast was done prematurely, check if it was cast very shortly before casting Battle Cry
              // if (castsBelow100.length > 0 && castsBelow100[castsBelow100.length - 1].event.classResources[0]['amount'] / 10 < 100) {
              if (castsBelow100.length > 0 && this.casts[i-1].event.classResources[0]['amount'] / 10 < 100) {
                if (event.timestamp - castsBelow100[castsBelow100.length - 1].event.timestamp < 2000) {
                  castsBelow100.splice(castsBelow100.length - 1, 1);
                  continue;
                }
              }
            } else if (battle_cry_last && !battle_cry) {
              battle_cry_last = false;
            }
          }
        }

        when(castsBelow100.length).isGreaterThan(minor)
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<Wrapper>Try to cast <SpellLink id={SPELLS.RAMPAGE.id} /> at 100 rage to proc <SpellLink id={SPELLS.FROTHING_BERSERKER_TALENT.id} />.</Wrapper>)
              .icon(SPELLS.RAMPAGE.icon)
              .actual(`${actual} out of ${this.casts.length} (${(actual / this.casts.length * 100).toFixed(2)}%) of your Rampage casts were cast below 100 rage.`)
              .recommended(`0 is recommended`)
              .regular(average).major(major);
          });

        // Carnage users should cast Rampage at 70 rage

        // Otherwise cast at 80 rage
        
      }
    }
  }
}

export default RampageUsage;