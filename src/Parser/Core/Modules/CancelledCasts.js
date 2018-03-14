import React from 'react';

import Icon from 'common/Icon';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class CancelledCasts extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  castsCancelled = 0;
  castsFinished = 0;
  beginCastSpell = 0;
  wasCastStarted;
  cancelledSpellList = {};

  static IGNORED_ABILITIES = [];

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (this.constructor.IGNORED_ABILITIES.includes(spellId)) {
      return;
    }
    if (this.wasCastStarted) {
      this.castsCancelled += 1;
      this.addToCancelledList(event);
    }
    this.beginCastSpell = event.ability;
    this.wasCastStarted = true;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.constructor.IGNORED_ABILITIES.includes(spellId)) {
      return;
    }
    if (this.beginCastSpell.guid !== spellId && this.wasCastStarted) {
      this.castsCancelled += 1;
      this.addToCancelledList(event);
    }
    if (this.beginCastSpell.guid === spellId && this.wasCastStarted) {
      this.castsFinished += 1;
    }
    this.wasCastStarted = false;
  }

  addToCancelledList(event) {
    if (!this.cancelledSpellList[this.beginCastSpell.guid]) {
      this.cancelledSpellList[this.beginCastSpell.guid] = {
        'spellName': this.beginCastSpell.name,
        'amount': 1,
      };
    } else {
      this.cancelledSpellList[this.beginCastSpell.guid].amount += 1;
    }
    debug && console.log("cast cancelled at: ", event.timestamp);
  }
  get totalCasts() {
    return this.castsCancelled + this.castsFinished;
  }

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get cancelledCastSuggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  on_finished() {
    debug && console.log(formatMilliseconds(this.owner.fightDuration), 'Casts Finished:', `${formatNumber(this.castsFinished)}`);
    debug && console.log(formatMilliseconds(this.owner.fightDuration), 'Casts Cancelled:', `${formatNumber(this.castsCancelled)}`);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="inv_misc_map_01" alt="Cancelled Casts" />}
        value={`${formatPercentage(this.cancelledPercentage)} %`}
        label="Casts Cancelled"
        tooltip={`You cast ${this.totalCasts} spells.
          <ul>
            <li>${this.castsFinished} casts were completed</li>
            <li>${this.castsCancelled} casts were cancelled</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default CancelledCasts;
