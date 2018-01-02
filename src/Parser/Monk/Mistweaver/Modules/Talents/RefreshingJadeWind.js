import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

const TARGETSPERCAST = 78;

class RefreshingJadeWind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healsRJW = 0;
  healingRJW = 0;
  overhealingRJW = 0;
  castRJW = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id);
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.REFRESHING_JADE_WIND_TALENT.id) {
      this.castRJW += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.REFRESHING_JADE_WIND_HEAL.id) {
      this.healsRJW += 1;
      this.healingRJW += event.amount;
      if (event.overheal) {
        this.overhealingRJW += event.amount;
      }
    }
  }

  get avgTargetsHitPerRJWPercentage() {
    return (this.healsRJW / this.castRJW) / TARGETSPERCAST || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerRJWPercentage,
      isLessThan: {
        minor: .9,
        average: .8,
        major: .7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
              You are not utilizing your <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> effectively. <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> excells when you hit 6 targets for the duration of the spell. The easiest way to accomplish this is to stand in melee, but there can be other uses when the raid stacks for various abilities.
          </Wrapper>
        )
          .icon(SPELLS.REFRESHING_JADE_WIND_TALENT.icon)
          .actual(`${formatPercentage(this.avgRJWTargetsPercentage)}% of targets hit per Refreshing Jade Wind`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  on_finished() {
    if (debug) {
      console.log(`RJW Casts: ${this.castRJW}`);
      console.log(`RJW Targets Hit: ${this.healsRJW}`);
      console.log('RJW Targets Hit per Cast: ', (this.healsRJW / this.castRJW));
      console.log(`Avg Heals per Cast: ${this.healingRJW / this.castRJW}`);
      console.log(`Avg Heals Amount: ${this.healingRJW / this.healsRJW}`);
    }
  }
}

export default RefreshingJadeWind;
