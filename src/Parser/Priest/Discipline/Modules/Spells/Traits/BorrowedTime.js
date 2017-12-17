import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Penance from '../Penance';

const CONSUMERS = new Set([
  SPELLS.LIGHTS_WRATH.id,
  SPELLS.PENANCE_HEAL.id,
  SPELLS.PENANCE.id,
  SPELLS.SMITE.id,
]);

const BORROWED_TIME_HASTE_PER_RANK = 0.05;

class BorrowedTime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    penance: Penance,
  };

  _borrowedTimeRank = 0;
  _borrowedTimeHaste = 0;
  _pendingCast = undefined;
  _lastCast = undefined;
  _lastCastSavings = 0;

  rawTimeSaved = 0;
  timeSaved = 0;

  on_initialized() {
    this._borrowedTimeRank = this.combatants.selected.traitsBySpellId[SPELLS.BORROWED_TIME_TRAIT.id];
    this._borrowedTimeHaste = this._borrowedTimeRank * BORROWED_TIME_HASTE_PER_RANK;
    this.active = this._borrowedTimeRank > 0;
  }

  playerHasBorrowedTimeAt(timestamp) {
    return this.combatants.selected.hasBuff(SPELLS.BORROWED_TIME.id, timestamp);
  }

  addRealBenefitFromBorrowedTime(event) {
    if (this._lastCast) {
      const endBeforeBorrowedTime = this._lastCast.timestamp + this._lastCastSavings;
      const realSavings = endBeforeBorrowedTime - event.timestamp;

      this.timeSaved += (realSavings >= 0 ? realSavings : 0);
      this._lastCast = undefined;
      this._lastCastSavings = 0;
    }
  }

  on_byPlayer_begincast(event) {
    this.addRealBenefitFromBorrowedTime(event);

    if (!CONSUMERS.has(event.ability.guid) || !this.playerHasBorrowedTimeAt(event.timestamp)) {
      return;
    }

    this._pendingCast = event;
  }

  // Needed to detect Penance start cast, nice one
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SPEED_OF_THE_PIOUS.id || !this.playerHasBorrowedTimeAt(event.timestamp)) {
      return;
    }

    this._pendingCast = event;
  }

  on_byPlayer_cast(event) {
    this.addRealBenefitFromBorrowedTime(event);

    if (!CONSUMERS.has(event.ability.guid) || !this._pendingCast || !this.playerHasBorrowedTimeAt(event.timestamp)) {
      return;
    }
    if (event.penanceBoltNumber && event.penanceBoltNumber < 3) {
      return;
    }

    const castDuration = event.timestamp - this._pendingCast.timestamp;
    const castDurationWithoutBorrowedTime = castDuration * (1 + this._borrowedTimeHaste);
    const castSaving = (castDurationWithoutBorrowedTime - castDuration);

    this._lastCast = event;
    this._lastCastSavings = castSaving;

    this.rawTimeSaved += castSaving;
  }

  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticBox
            icon={<SpellIcon id={SPELLS.BORROWED_TIME.id} />}
            value={`${formatDuration(this.rawTimeSaved / 1000)}`}
            label="Gross Time Saved"
            containerProps={{ className: 'col-xs-12' }}
          />
        </div>
        <div className="row">
          <StatisticBox
            icon={<SpellIcon id={SPELLS.BORROWED_TIME.id} />}
            value={`${formatDuration(this.timeSaved / 1000)}`}
            label={(
              <dfn data-tip={'This is the amount of saved time that you actively casted during, this will not account for having to move or other similar checks.'}>
                Time Saved Used
              </dfn>
            )}
            containerProps={{ className: 'col-xs-12' }}
          />
        </div>
      </div>
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(60);
}

export default BorrowedTime;
