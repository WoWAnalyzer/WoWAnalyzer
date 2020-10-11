import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { DamageEvent } from 'parser/core/Events';

import { ISB as ABILITY_BLACKLIST } from '../constants/AbilityBlacklist';

export default class Shuffle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  hitsWith = 0;
  hitsWithout = 0;

  constructor(options: any) {
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
      style: 'percentage',
    };
  }
}
