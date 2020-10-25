import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { DamageEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';

import { ISB as ABILITY_BLACKLIST } from '../constants/AbilityBlacklist';

export default class Shuffle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  hitsWith = 0;
  hitsWithout = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damageTaken);
  }

  _damageTaken(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (event.sourceID === undefined || !this.enemies.getEntities()[event.sourceID]) {
      return; // not a notable entity (e.g. imonar traps, environment damage)
    }
    if (ABILITY_BLACKLIST.includes(event.ability.guid)) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.SHUFFLE.id)) {
      this.hitsWith += 1;
    } else {
      this.hitsWithout += 1;
    }
  }

  get uptimeSuggestionThreshold() {
    return {
      actual: this.hitsWith / (this.hitsWith + this.hitsWithout),
      isLessThan: {
        minor: 0.98,
        average: 0.96,
        major: 0.94,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(
        <>You should maintain <SpellLink id={SPELLS.SHUFFLE.id} /> while actively tanking.</>
      ).icon(SPELLS.SHUFFLE.icon)
       .actual(`${formatPercentage(actual)}% of hits mitigated by Shuffle.`)
       .recommended(`< ${formatPercentage(recommended)}% is recommended`));
  }
}
