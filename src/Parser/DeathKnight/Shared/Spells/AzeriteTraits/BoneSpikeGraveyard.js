import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

/**
 * Bone Spike Graveyard
 * Casting DnD (or Defile) impales enemies for x damage and causes y healing
 * Healing and Damage have their own events, no other tracking necessary
 * Shared between Blood and Unholy
 * 
 * Example Report: https://www.warcraftlogs.com/reports/bnQ4fpjv8hz9mJY3/#fight=1&source=9&translate=true
 */
class BoneSpikeGraveyard extends Analyzer{

  damage = 0;
  heal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BONE_SPIKE_GRAVEYARD.id);
    if (!this.active) {
      return;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BONE_SPIKE_GRAVEYARD_DAMAGE.id) {
      return;
    }

    this.damage += event.amount;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.BONE_SPIKE_GRAVEYARD_HEAL.id) {
      return;
    }

    this.heal += event.amount + (event.absorbed || 0);
  }

  statistic(){
    const dps = this.damage / (this.owner.fightDuration / 1000);
    const hps = this.heal / (this.owner.fightDuration / 1000);

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BONE_SPIKE_GRAVEYARD.id}
        value={(
          <React.Fragment>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))}% / {formatNumber(dps)} DPS<br />
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.heal))}% / {formatNumber(hps)} HPS<br />
          </React.Fragment>
        )}
        tooltip={`${SPELLS.BONE_SPIKE_GRAVEYARD.name} did a total of ${formatNumber(this.damage)} damage and ${formatNumber(this.heal)} healing.`}
      />
    );
  }
}

export default BoneSpikeGraveyard; 