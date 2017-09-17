import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';

import SoulShardEvents from '../SoulShards/SoulShardEvents';

const debug = false;

//estimated maximum time in ms between each Incinerate damage event to count as from one cast
//the talent makes Incinerate cleave into all surrounding targets, so it makes sense that the Incinerates arrive at approximately same time, this is the tolerance for the "approximately"
const CLEAVE_THRESHOLD = 50;

class FireAndBrimstone extends Module {
  static dependencies = {
    combatants: Combatants,
    soulShardEvents: SoulShardEvents,
  };

  _primaryTargets = [];
  _lastIncinerate = 0;
  _lastIncinerateIndex = 0;
  _groupedTargets = [];

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
    const incinerateEvent = {
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      fragments: event.amount,  //only the real generated, don't care about the wasted fragments
      damage: event.damage,
    };
    //first incinerate
    if (this._lastIncinerate === 0) {
      this._lastIncinerate = event.timestamp;
      //index stays at 0
      this._groupedTargets.push(
        [
          incinerateEvent,
        ]
      );
    }    else {
      //another Incinerate landed on target within 50ms of a previous one, add to the same group, also probably don't overwrite the timestamp?
      if (event.timestamp < this._lastIncinerate + CLEAVE_THRESHOLD) {
        this._groupedTargets[this._lastIncinerateIndex].push(incinerateEvent);
      }      else {
        //start another group
        this._lastIncinerate = event.timestamp;
        this._groupedTargets.push(
          [
            incinerateEvent,
          ]
        );
        this._lastIncinerateIndex += 1;
      }
    }
  }

  on_finished() {
    debug && console.log('primary targets', this._primaryTargets);
    debug && console.log('all targets', this._allTargets);
    debug && console.log('grouped targets', this._groupedTargets);

    //remove the primary targets, should be left with the cleaved targets
    this._primaryTargets.forEach((event, index) => {
      if (!this._groupedTargets[index]) {
        //can happen if _primaryTargets is larger than _groupedTargets, not sure why
        return;
      }
      //look into the same index in _groupedTargets, find an event with the same target ID and instance and delete it
      const primaryTargetIndex = this._groupedTargets[index].findIndex(groupedEvent => groupedEvent.targetID === event.targetID && groupedEvent.targetInstance === event.targetInstance);
      if (primaryTargetIndex === -1) {
        //shouldn't happen that it doesn't exists, but if yes
        return;
      }
      this._groupedTargets[index].splice(primaryTargetIndex, 1);
    });

    this._groupedTargets.forEach(group => {
      if (group.length > 0) {
        group.forEach(event => {
          this.generatedCleaveFragments += event.fragments;
          this.bonusDmg += event.damage;
        });
      }
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} />}
        value={this.generatedCleaveFragments}
        label='Bonus fragments gained'
        tooltip={`Your Fire and Brimstone talent also contributed ${formatNumber(this.bonusDmg)} bonus cleave damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default FireAndBrimstone;
