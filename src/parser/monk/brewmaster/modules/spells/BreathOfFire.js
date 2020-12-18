import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { t } from '@lingui/macro';

import Events from 'parser/core/Events';

import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';

const DEBUG_ABILITIES = false;

class BreathOfFire extends Analyzer {
  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.BREATH_OF_FIRE_DEBUFF.id) / this.owner.fightDuration;
  }

  get mitigatedHits() {
    return this.hitsWithBoF / (this.hitsWithBoF + this.hitsWithoutBoF);
  }

  get suggestionThreshold() {
    return {
      actual: this.mitigatedHits,
      // max possible now is 0.8 w/o shenanigans
      isLessThan: {
        minor: 0.7,
        average: 0.6,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  hitsWithBoF = 0;
  hitsWithoutBoF = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    const enemy = this.enemies.enemies[event.sourceID];
    if (enemy && enemy.hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.hitsWithBoF += 1;
    } else {
      if (DEBUG_ABILITIES && event.ability.guid !== SPELLS.MELEE.id) {
        console.log('hit w/o bof', event);
      }
      this.hitsWithoutBoF += 1;
    }
  }

  suggestions(when) {
    when(this.suggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> usage can be improved. The associated debuff is a key part of our damage mitigation.</>)
        .icon(SPELLS.BREATH_OF_FIRE.icon)
        .actual(t({
      id: "monk.brewmaster.suggestions.breathOfFire.hitsMitigated",
      message: `${formatPercentage(actual)}% of hits mitigated with Breath of Fire`
    }))
        .recommended(`> ${formatPercentage(recommended)}% is recommended`));
  }
}

export default BreathOfFire;
