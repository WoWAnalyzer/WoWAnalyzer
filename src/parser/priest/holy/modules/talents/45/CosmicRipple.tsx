import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/C2NGDav6KHgc8ZWd/28-Mythic+Taloc+-+Kill+(7:07)/13-Ariemah
class CosmicRipple extends Analyzer {
  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;
  totalHits = 0;
  totalRipples = 0;
  lastRippleTimeStamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.COSMIC_RIPPLE_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COSMIC_RIPPLE_HEAL), this.onHeal);
  }

  onHeal(event: HealEvent) {
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
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(3)}
      >
        <BoringSpellValueText spell={SPELLS.COSMIC_RIPPLE_HEAL}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CosmicRipple;
