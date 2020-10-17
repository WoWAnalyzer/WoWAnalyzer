import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class ChiBurst extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;
  raidSize = 0;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHI_BURST_TALENT.id);
    this.raidSize = Object.keys(this.combatants.players).length;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_TALENT), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_HEAL), this.onHeal);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onCast(event) {
    this.castChiBurst += 1;
  }

  onHeal(event) {
    const targetId = event.targetID;

    if (!this.combatants.players[targetId]) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.targetsChiBurst += 1;
  }

  get avgTargetsHitPerCB() {
    return this.targetsChiBurst / this.castChiBurst || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerCB,
      isLessThan: {
        minor: this.raidSize * 0.3,
        average: this.raidSize * 0.25,
        major: this.raidSize * 0.2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
          <>
            You are not utilizing your <SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> talent as effectively as you should. You should work on both your positioning and aiming of the spell. Always aim for the highest concentration of players, which is normally melee.
          </>,
        )
          .icon(SPELLS.CHI_BURST_TALENT.icon)
          .actual(i18n._(t('monk.mistweaver.suggestions.chiBurst.targetsHit')`${this.avgTargetsHitPerCB.toFixed(2)} targets hit per Chi Burst cast - ${formatPercentage(this.avgTargetsHitPerCB / this.raidSize)}% of raid hit`))
          .recommended('30% of the raid hit is recommended'));
  }

  onFightend() {
    if (debug) {
      console.log(`ChiBurst Casts: ${this.castChiBurst}`);
      console.log(`Total Chi Burst Healing: ${this.healing}`);
      console.log(`Chi Burst Targets Hit: ${this.targetsChiBurst}`);
    }
  }
}

export default ChiBurst;
