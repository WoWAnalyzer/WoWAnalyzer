import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const DEMONBOLT_SP_COEFFICIENT = 0.667;
const MAX_TRAVEL_TIME = 2000;
const debug = false;

class ShadowsBite extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  bonus = 0;
  damage = 0;

  _queue = [
    /*
      {
        timestamp: number
        targetID: number,
        targetInstance: number,
        applySB: boolean
        intellect: number
      }
     */
  ];
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SHADOWS_BITE.id);
    if (!this.active) {
      return;
    }

    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.SHADOWS_BITE.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.SHADOWS_BITE.id, rank);
        debug && this.log(`Rank ${rank}, damage ${damage}`);
        return total + damage;
      }, 0);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onDemonboltCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT), this.onDemonboltDamage);
  }

  onDemonboltCast(event) {
    // Shadow's Bite snapshots the bonus on cast
    this._queue.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      applySB: this.selectedCombatant.hasBuff(SPELLS.SHADOWS_BITE_BUFF.id),
      intellect: this.statTracker.currentIntellectRating,
    });
    debug && this.log('Pushed cast into queue, current queue: ', JSON.parse(JSON.stringify(this._queue)));
  }

  onDemonboltDamage(event) {
    // first filter out old casts
    this._queue = this._queue.filter(cast => event.timestamp < (cast.timestamp + MAX_TRAVEL_TIME));
    // try pairing damage event with casts in queue
    const castIndex = this._queue
      .findIndex(queuedCast => queuedCast.targetID === event.targetID
                                     && queuedCast.targetInstance === event.targetInstance);
    if (castIndex === -1) {
      debug && this.error('Encountered damage event with no buffed cast associated, queue:', JSON.parse(JSON.stringify(this._queue)), 'event', event);
      return;
    }

    const pairedCast = this._queue[castIndex];
    debug && this.log('Paired damage event with queued cast', pairedCast);

    if (pairedCast.applySB) {
      const [ bonusDamage ] = calculateBonusAzeriteDamage(event, [this.bonus], DEMONBOLT_SP_COEFFICIENT, pairedCast.intellect);
      debug && this.log(`Bonus damage: ${bonusDamage}`);

      this.damage += bonusDamage;
    }

    this._queue.splice(castIndex, 1);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.SHADOWS_BITE.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Demonbolt damage: ${formatThousands(this.damage)}<br /><br />
                The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ShadowsBite;
