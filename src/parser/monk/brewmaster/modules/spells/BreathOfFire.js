import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { BOF as ABILITY_BLACKLIST } from '../constants/AbilityBlacklist';
import Events from 'parser/core/Events';

const DEBUG_ABILITIES = false;

class BreathOfFire extends Analyzer {
  static dependencies = {
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
      // max possible now is 0.8 w/o shenanigans
      isLessThan: {
        minor: 0.7,
        average: 0.6,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  constructor(options){
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (ABILITY_BLACKLIST.includes(event.ability.guid)) {
      return;
    }
    if (!this.enemies.getEntities()[event.sourceID]) {
      return; // either stagger or not a notable entity (e.g. imonar traps, environment damage) or an ability we want to ignore
    }

    if (this.enemies.enemies[event.sourceID].hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
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
          .actual(i18n._(t('monk.brewmaster.suggestions.breathOfFire.hitsMitigated')`${formatPercentage(actual)}% of hits mitigated with Breath of Fire`))
          .recommended(`> ${formatPercentage(recommended)}% is recommended`));
  }
}

export default BreathOfFire;
