import React from 'react';

import {
  formatMilliseconds,
  formatNumber,
  formatPercentage,
} from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import CrossIcon from 'interface/icons/Cross';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { CastEvent } from '../../core/Events';

const debug = false;
const MS_BUFFER = 100;

class CancelledCasts extends Analyzer {
  castsCancelled = 0;
  castsFinished = 0;
  beginCastSpell: CastEvent | undefined = undefined;
  wasCastStarted: boolean = false;
  cancelledSpellList: {
    [key: number]: {
      spellName: string,
      amount: number
    }
  } = {};
  IGNORED_ABILITIES: number[] = [];

  on_byPlayer_begincast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (this.IGNORED_ABILITIES.includes(spellId)) {
      return;
    }
    if (this.wasCastStarted && this.beginCastSpell !== undefined &&
      event.timestamp -
      this.beginCastSpell.timestamp >
      MS_BUFFER) {
      this.castsCancelled += 1;
      this.addToCancelledList();
    }
    this.beginCastSpell = event;
    this.wasCastStarted = true;
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    const beginCastAbility = this.beginCastSpell && this.beginCastSpell.ability;
    if (this.IGNORED_ABILITIES.includes(spellId) || !beginCastAbility) {
      return;
    }
    if (beginCastAbility.guid !== spellId && this.wasCastStarted) {
      this.castsCancelled += 1;
      this.addToCancelledList();
    }
    if (beginCastAbility.guid === spellId && this.wasCastStarted) {
      this.castsFinished += 1;
    }
    this.wasCastStarted = false;
  }

  addToCancelledList() {
    if (!this.beginCastSpell) {
      return;
    }
    const beginCastAbility = this.beginCastSpell.ability;
    if (!this.cancelledSpellList[beginCastAbility.guid]) {
      this.cancelledSpellList[beginCastAbility.guid] = {
        'spellName': beginCastAbility.name,
        'amount': 1,
      };
    } else {
      this.cancelledSpellList[beginCastAbility.guid].amount += 1;
    }
    debug && this.log(beginCastAbility.name + ' cast cancelled');
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

  on_fightend() {
    debug &&
    console.log(
      formatMilliseconds(this.owner.fightDuration),
      'Casts Finished:',
      `${formatNumber(this.castsFinished)}`,
    );
    debug &&
    console.log(
      formatMilliseconds(this.owner.fightDuration),
      'Casts Cancelled:',
      `${formatNumber(this.castsCancelled)}`,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="small"
        label="test"
        className="value"
        tooltip={(
          <>
            You cast {this.totalCasts} spells.
            <ul>
              <li>{this.castsFinished} casts were completed</li>
              <li>{this.castsCancelled} casts were cancelled</li>
            </ul>
          </>
        )}
      >
        <BoringValueText label="Cancelled Casts">
          <CrossIcon /> {formatPercentage(this.cancelledPercentage)}% <small>Casts Cancelled</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default CancelledCasts;
