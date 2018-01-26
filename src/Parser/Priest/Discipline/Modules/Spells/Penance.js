import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

/**
 * This module will try to use Speed of the Pious to determine new Penance casts
 * If Speed of the Pious is not available, we fallback to an estimate
 */
class Penance extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _speedOfThePiousAcquired = false;
  _previousPenanceTimestamp = null;
  _penanceBoltHitNumber = 0;
  _penanceBoltCastNumber = 0; // Used for the cast event, not the damage or healing ones
  casts = 0;
  hits = 0;

  isNewPenanceCast(timestamp) {
    return !this._previousPenanceTimestamp || (timestamp - this._previousPenanceTimestamp) > PENANCE_MINIMUM_RECAST_TIME;
  }

  // Speed of the Pious is applied at the start of Penance
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SPEED_OF_THE_PIOUS.id) {
      return;
    }
    this._speedOfThePiousAcquired = true;
    this.casts += 1;
    this._penanceBoltHitNumber = 0;
    this._penanceBoltCastNumber = 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if ((spellId !== SPELLS.PENANCE.id && spellId !== SPELLS.PENANCE_HEAL.id)) {
      return;
    }

    if (this._speedOfThePiousAcquired) {
      this._penanceBoltCastNumber += 1;
    } else {
      // Guesstimate based on magic number
      if (this.isNewPenanceCast(event.timestamp)) {
        this._previousPenanceTimestamp = event.timestamp;
        this._penanceBoltCastNumber = 1;
        this.casts += 1;
      }
    }

    event.penanceBoltNumber = this._penanceBoltCastNumber;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id) {
      return;
    }

    event.penanceBoltNumber = this._penanceBoltHitNumber;
    this._penanceBoltHitNumber += 1;
    this.hits += 1;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.PENANCE_HEAL.id) {
      return;
    }

    event.penanceBoltNumber = this._penanceBoltHitNumber;
    this._penanceBoltHitNumber += 1;
    this.hits += 1;
  }

  statistic() {
    const hasCastigation = this.combatants.selected.hasTalent(SPELLS.CASTIGATION_TALENT.id);
    const missedPenanceTicks = (this.casts * (3 + (hasCastigation ? 1 : 0))) - this.hits;

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PENANCE.id} />}
        value={missedPenanceTicks}
        label={(
          <dfn data-tip={
            `Each Penance cast has 3 bolts (4 if you're using Castigation). You should try to let this channel finish as much as possible. You channeled Penance ${this.casts} times.`
            }>
            Wasted Penance bolts
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Penance;
