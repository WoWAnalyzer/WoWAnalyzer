import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';

/**
 * Bone Spike Graveyard
 * Casting DnD (or Defile) impales enemies for x damage and causes y healing
 * Healing and Damage have their own events, no other tracking necessary
 * Shared between Blood and Unholy
 * 
 * Example Report: https://www.warcraftlogs.com/reports/3H7pWyrJDnLB16jT/#fight=19&source=9
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
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BONE_SPIKE_GRAVEYARD.id}
        value={(
          <>
            <ItemDamageDone amount={this.damage} /><br />
            <ItemHealingDone amount={this.heal} />
          </>
        )}
        tooltip={`${SPELLS.BONE_SPIKE_GRAVEYARD.name} did a total of ${formatNumber(this.damage)} damage and ${formatNumber(this.heal)} healing.`}
      />
    );
  }
}

export default BoneSpikeGraveyard; 
