import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';

import SoulShardEvents from '../SoulShards/SoulShardEvents';

class FireAndBrimstone extends Module {
  static dependencies = {
    combatants: Combatants,
    soulShardEvents: SoulShardEvents,
  };

  _primaryTargets = [];

  generatedCleaveFragments = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FIRE_AND_BRIMSTONE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.INCINERATE.id) {
      return;
    }
    this._primaryTargets.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
  }

  on_soulshardfragment_gained(event) {
    if (event.ability.guid !== SPELLS.INCINERATE.id) {
      return;
    }
    // should find FIRST (oldest) Incinerate cast, so even though you can fire multiple Incinerates before the first hits, this should pair the events correctly even if they have the same ID and instance
    const primaryTargetEventIndex = this._primaryTargets.findIndex(primary => primary.targetID === event.targetID && primary.targetInstance === event.targetInstance);
    if (primaryTargetEventIndex !== -1) {
      // it's a Incinerate damage on primary target, delete the event so it doesn't interfere with another casts
      this._primaryTargets.splice(primaryTargetEventIndex, 1);
      return;
    }
    // should be cleaved damage
    this.generatedCleaveFragments += event.amount;
    this.bonusDmg += event.damage;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} />}
        value={this.generatedCleaveFragments}
        label="Bonus fragments gained"
        tooltip={`Your Fire and Brimstone talent also contributed ${formatNumber(this.bonusDmg)} bonus cleave damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default FireAndBrimstone;
