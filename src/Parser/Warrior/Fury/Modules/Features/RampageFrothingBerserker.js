import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

/*
  Frothing Berserker users should maximize casts with 100 rage to proc Frothing Berserker the post
  Carnage users should cast as soon as possible, i.e. at 70 rage
  Massacre users (not from Soul of the Battlelord) should cast as soon as possible, i.e. at 85 rage
  Whenever Battle Cry is active, user should cast Rampage whenever possible - regardless of talents
*/

class RampageFrothingBerserker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  last_timestamp = null;
  casts_counter = 0;
  premature_counter = 0;
  reckless_abandon = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
    this.reckless_abandon = this.combatants.selected.hasTalent(SPELLS.RECKLESS_ABANDON_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.RAMPAGE.id) { 
      const rage = Math.floor(event.classResources[0].amount / 10);
      
      // Ignore any free casts due to Massacre talent
      if(this.combatants.selected.hasBuff(SPELLS.MASSACRE.id)) {
        return;
      }
      
      this.casts_counter++;

      if (rage < 100 && !this.combatants.selected.hasBuff(SPELLS.BATTLE_CRY.id)) {
        this.premature_counter++;
        this.last_timestamp = event.timestamp;
      }

    } else if (event.ability.guid === SPELLS.BATTLE_CRY.id && this.last_timestamp && this.reckless_abandon) {
      
      if (event.timestamp - this.last_timestamp < 2000) {
        this.premature_counter--;
        this.last_timestamp = null;
      }
    }
  }

  get suggestionThresholdsFrothingBerserker() {
    return {
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
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

      const prematureCastRatio = this.premature_counter / this.casts_counter;
      
      // Frothing Berserker users should cast Rampage at 100 rage only
      if(this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id)) {
        when(prematureCastRatio).isGreaterThan(minor)
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<React.Fragment>Try to cast <SpellLink id={SPELLS.RAMPAGE.id} /> at 100 rage to proc <SpellLink id={SPELLS.FROTHING_BERSERKER_TALENT.id} />.</React.Fragment>)
              .icon(SPELLS.RAMPAGE.icon)
              .actual(`${formatPercentage(actual)}% (${this.premature_counter} out of ${this.casts_counter}) of your Rampage casts were cast below 100 rage.`)
              .recommended(`0% is recommended`)
              .regular(average).major(major);
          });
    }
  }
}

export default RampageFrothingBerserker;
