import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

const MAX_STACKS = 12;
const DEFAULT_PER_SOUL_DURATION = 5;
const BACK_PER_SOUL_DURATION = 6.5;

const debug = true;

class WastedDeadwindHarvester extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _maxBuffDuration = DEFAULT_PER_SOUL_DURATION * MAX_STACKS * 1000;
  _perSoulDuration = DEFAULT_PER_SOUL_DURATION * 1000;
  _tormentedSoulCounter = 0;
  _castTimestamp = null;
  _expectedBuffEndTimestamp = null;
  _effectiveBuffDuration = 0;
  _potentialBuffDuration = 0;   // this is essentially what duration we would have if there was no maximum duration


  on_initialized() {
    if (this.combatants.selected.hasBack(ITEMS.REAP_AND_SOW.id)) {
      this._maxBuffDuration = BACK_PER_SOUL_DURATION * MAX_STACKS * 1000;
      this._perSoulDuration = BACK_PER_SOUL_DURATION * 1000;
    }
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      this._tormentedSoulCounter = 1;
    }
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      this._tormentedSoulCounter = event.stack;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REAP_SOULS.id) {
      return;
    }
    // first Reap
    if (!this._expectedBuffEndTimestamp) {
      this._expectedBuffEndTimestamp = event.timestamp + this._tormentedSoulCounter * this._perSoulDuration;
    } else {
      // we either refresh the buff or cast a fresh new reap
      if (event.timestamp >= this._expectedBuffEndTimestamp) {
        // new reap will never exceed the max duration
        this._expectedBuffEndTimestamp = event.timestamp + this._tormentedSoulCounter * this._perSoulDuration;
      }
      else {
        const remainingDuration = this._expectedBuffEndTimestamp - event.timestamp;
        const newBuffDuration = this._tormentedSoulCounter * this._perSoulDuration;

        // add buff duration that has passed
        const passedDuration = event.timestamp - this._castTimestamp;
        this._potentialBuffDuration += passedDuration;
        this._effectiveBuffDuration += passedDuration;

        const total = remainingDuration + newBuffDuration;
        if (total > this._maxBuffDuration) {
          const wasted = total - this._maxBuffDuration;
          this._potentialBuffDuration += wasted; // add only what we wasted, the actual used time is added in removebuff or few lines up from here

          this._expectedBuffEndTimestamp = event.timestamp + this._maxBuffDuration;
        }
        else {
          this._expectedBuffEndTimestamp += newBuffDuration;
        }
      }
    }
    this._castTimestamp = event.timestamp;
    this._tormentedSoulCounter = 0;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.DEADWIND_HARVESTER.id) {
      return;
    }
    // buff expired, nothing was wasted
    const duration = event.timestamp - this._castTimestamp;
    this._potentialBuffDuration += duration;
    this._effectiveBuffDuration += duration;
  }

  on_finished() {
    debug && console.log(`Wasted duration: ${this.wastedDuration} = ${formatPercentage(this.wastedDuration / this._potentialBuffDuration)} %`);
  }

  get wastedDuration() {
    return this._potentialBuffDuration - this._effectiveBuffDuration;
  }

  get wastedPercentage() {
    return this.wastedDuration / this._potentialBuffDuration;
  }
  get suggestionThresholds() {
    // TODO
    return {
      actual: this.wastedPercentage,
      isGreaterThan: {
        minor: 0.01,
        average: 0.025,
        major: 0.05,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEADWIND_HARVESTER.id}/>}
        value={`${formatPercentage(this.wastedPercentage)} %`}
        label="Duration wasted"
      />
    );
  }

  suggestions(when) {
    // TODO
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You're wasting your <SpellLink id={SPELLS.DEADWIND_HARVESTER.id}/> buff. Try to pay attention to how many <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/> you have when you cast <SpellLink id={SPELLS.REAP_SOULS.id}/> so you don't exceed the maximum duration.</Wrapper>)
          .icon(SPELLS.DEADWIND_HARVESTER.icon)
          .actual(`${formatPercentage(actual)}% of Deadwind Harvester duration wasted`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default WastedDeadwindHarvester;
