import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const TARGETSPERCAST = 78;

class RefreshingJadeWind extends Analyzer {
  healsRJW: number = 0;
  healingRJW: number = 0;
  overhealingRJW: number = 0;
  castRJW: number = 0;

  constructor(options: Options){
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REFRESHING_JADE_WIND_TALENT), this.rjwBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REFRESHING_JADE_WIND_HEAL), this.rjwHeal);
  }

  rjwBuff(event: ApplyBuffEvent) {
    this.castRJW += 1;
  }

  rjwHeal(event: HealEvent) {
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
          <>
              You are not utilizing your <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> effectively. <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> excells when you hit 6 targets for the duration of the spell. The easiest way to accomplish this is to stand in melee, but there can be other uses when the raid stacks for various abilities.
          </>,
        )
          .icon(SPELLS.REFRESHING_JADE_WIND_TALENT.icon)
          .actual(`${formatPercentage(this.avgTargetsHitPerRJWPercentage)}${i18n._(t('monk.mistweaver.suggestions.refreshingJadeWind.avgTargetsHit')`% of targets hit per Refreshing Jade Wind`)}`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }
}

export default RefreshingJadeWind;
