import React from 'react';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';

// Example Log: /report/C2NGDav6KHgc8ZWd/28-Mythic+Taloc+-+Kill+(7:07)/13-Ariemah
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
    this.totalHits += 1;

    if (event.timestamp - this.lastRippleTimeStamp > 1000) {
      this.totalRipples += 1;
      this.lastRippleTimeStamp = event.timestamp;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
        talent={SPELLS.COSMIC_RIPPLE_HEAL.id}
        value={(
          <ItemHealingDone amount={this.totalHealing} />
        )}
        position={STATISTIC_ORDER.CORE(3)}
      />

    );
  }
}

export default CosmicRipple;
