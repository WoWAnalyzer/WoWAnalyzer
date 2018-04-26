import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import { BOF as ABILITY_BLACKLIST } from '../Constants/AbilityBlacklist';

const DEBUG_ABILITIES = false;

class BreathOfFire extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  hitsWithBoF = 0;
  hitsWithoutBoF = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BREATH_OF_FIRE_DEBUFF.id) / this.owner.fightDuration;
  }

  get mitigatedHits() {
    return this.hitsWithBoF / (this.hitsWithBoF + this.hitsWithoutBoF);
  }

  get suggestionThreshold() {
    return {
      actual: this.mitigatedHits,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  on_toPlayer_damage(event) {
    if(event.ability.guid === SPELLS.STAGGER_TAKEN.id || ABILITY_BLACKLIST.includes(event.ability.guid) || !(event.sourceID in this.enemies.getEntities())) {
      return; // either stagger or not a notable entity (e.g. imonar traps, environment damage) or an ability we want to ignore
    }

    if(this.enemies.enemies[event.sourceID].hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.hitsWithBoF += 1;
    } else {
      if(DEBUG_ABILITIES) { console.log('hit w/o bof', event); }
      this.hitsWithoutBoF += 1;
    }
  }

  suggestions(when) {
    when(this.suggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> uptime can be improved. The associated debuff is a key part of our damage mitigation.</React.Fragment>)
          .icon(SPELLS.BREATH_OF_FIRE.icon)
          .actual(`${formatPercentage(actual)}% Breath of Fire uptime`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default BreathOfFire;
