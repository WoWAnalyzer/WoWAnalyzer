import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import { formatThousands } from 'common/format';

class CosmicRipple extends Analyzer {

  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;
  totalHits = 0;
  totalRipples = 0;
  lastRippleTimeStamp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.COSMIC_RIPPLE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COSMIC_RIPPLE_HEAL.id) {
      return;
    }
    this.overhealing += event.overheal || 0;
    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
    this.totalHits++;

    if (event.timestamp - this.lastRippleTimeStamp > 1000) {
      this.totalRipples++;
      this.lastRippleTimeStamp = event.timestamp;
    }
  }
}

export default CosmicRipple;
