import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const TARGETSPERCAST = 78;

class RefreshingJadeWind extends Analyzer {
  healsRJW = 0;
  healingRJW = 0;
  overhealingRJW = 0;
  castRJW = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_TALENT), this.rjwBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_TALENT), this.rjwHeal);
  }

  rjwBuff(event) {
    this.castRJW += 1;
  }

  rjwHeal(event) {
    this.healsRJW += 1;
    this.healingRJW += (event.amount || 0) + (event.absorbed || 0);
    this.overhealingRJW += event.overheal || 0;
  }

  get avgTargetsHitPerRJWPercentage() {
    return (this.healsRJW / this.castRJW) / TARGETSPERCAST || 0;
  }

  get rjwEffectiveness() {
    const rjwEfficiency = (this.healsRJW / (this.castRJW * TARGETSPERCAST)) || 0;
    return rjwEfficiency.toFixed(4);
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
          <>
              You are not utilizing your <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> effectively. <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> excells when you hit 6 targets for the duration of the spell. The easiest way to accomplish this is to stand in melee, but there can be other uses when the raid stacks for various abilities.
          </>,
        )
          .icon(SPELLS.REFRESHING_JADE_WIND_TALENT.icon)
          .actual(`${formatPercentage(this.avgRJWTargetsPercentage)}% of targets hit per Refreshing Jade Wind`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }
}

export default RefreshingJadeWind;
