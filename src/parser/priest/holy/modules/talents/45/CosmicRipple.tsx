import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import { HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

// Example Log: /report/C2NGDav6KHgc8ZWd/28-Mythic+Taloc+-+Kill+(7:07)/13-Ariemah
class CosmicRipple extends Analyzer {
  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;
  totalHits = 0;
  totalRipples = 0;
  lastRippleTimeStamp = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.COSMIC_RIPPLE_TALENT.id);
  }

  on_byPlayer_heal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COSMIC_RIPPLE_HEAL.id) {
      return;
    }
    this.overhealing += event.overheal || 0;
    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
    this.totalHits += 1;

    if (event.timestamp - this.lastRippleTimeStamp > 1000) {
      this.totalRipples += 1;
      this.lastRippleTimeStamp = event.timestamp;
    }
  }

  statistic() {
    return (
      <Statistic
        talent={SPELLS.COSMIC_RIPPLE_HEAL.id}
        value={(
          <ItemHealingDone amount={this.totalHealing} />
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      />

    );
  }
}

export default CosmicRipple;
