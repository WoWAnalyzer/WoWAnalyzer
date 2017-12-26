import React from 'react';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import { formatMilliseconds, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Haste from './Haste';

const debug = false;

class AlwaysBeCasting extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
  };

  // TODO: Should all this props be lower case?
  static ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];
  static STATIC_GCD_ABILITIES = {
    // Abilities which GCD is not affected by haste.
    // [spellId] : [gcd value in seconds]
  };

  // TODO: Add channels array to fix issues where is channel started pre-combat it doesn't register the `begincast` and considers the finish a GCD adding downtime. This can also be used to automatically add the channelVerifiers.

  static BASE_GCD = 1500;
  static MINIMUM_GCD = 750;

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  totalTimeWasted = 0;

  _currentlyCasting = null;
  on_byPlayer_begincast(event) {
    const cast = {
      begincast: event,
      cast: null,
    };

    this._currentlyCasting = cast;
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGcd = this.constructor.ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    // This fixes a crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
    if (!isOnGcd) {
      return;
    }

    if (this._currentlyCasting && this._currentlyCasting.begincast.ability.guid !== event.ability.guid) {
      // This is a different spell then registered in `begincast`, previous cast was interrupted
      this._currentlyCasting = null;
    }

    const logEntry = this._currentlyCasting || {
      begincast: null,
    };
    logEntry.cast = event;

    this.processCast(logEntry);
    this._currentlyCasting = null;
  }

  processCast({ begincast, cast }) {
    if (!cast) {
      return;
    }
    const spellId = cast.ability.guid;
    const isOnGcd = this.constructor.ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    // const isFullGcd = this.constructor.FULLGCD_ABILITIES.indexOf(spellId) !== -1;

    if (!isOnGcd) {
      debug && console.log(formatMilliseconds(this.owner.fightDuration), `%cABC: ${cast.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }

    const globalCooldown = this.getCurrentGlobalCooldown(spellId);

    // TODO: Change this to begincast || cast
    const castStartTimestamp = (begincast || cast).timestamp;

    this.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );
  }
  _lastCastFinishedTimestamp = null;
  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    const timeWasted = castStartTimestamp - (this._lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    if (debug) {
      const fightDuration = formatMilliseconds(this.owner.fightDuration);
      const num = (value, padding = 4) => Math.floor(value).toString().padStart(padding);
      console.log(`%c${[
        fightDuration,
        'ABC:',
        'total:', num(this.totalTimeWasted, 6),
        'this:', num(timeWasted),
        'gcd:', num(globalCooldown),
        'casttime:', num(cast.timestamp - castStartTimestamp), `(${begincast ? 'channeled' : 'instant'})`.padEnd(11),
        'haste:', `${formatPercentage(this.haste.current).padStart(6)}%`,
        cast.ability.name.padEnd(30), spellId,
      ].join('  ')}`, `color: ${timeWasted < 0 ? (timeWasted < -50 ? 'red' : 'orange') : '#000'}`);
    }

    this._lastCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
  }
  on_finished() {
    // If the player cast something just before fight end `_lastCastFinishedTimestamp` might be in the future resulting in negative downtime. The Math.max takes care of that.
    const timeWasted = Math.max(0, this.owner.fight.end_time - (this._lastCastFinishedTimestamp || this.owner.fight.start_time));
    this.totalTimeWasted += timeWasted;
  }

  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.haste.current);
  }

  /**
   * Can be used to determine the accuracy of the Haste tracking. This does not work properly on abilities that can get reduced channel times from other effects such as talents or traits.
   */
  _verifyChannel(spellId, defaultCastTime, begincast, cast) {
    if (cast.ability.guid === spellId) {
      if (!begincast) {
        console.error('Missing begin cast for channeled ability:', cast);
        return;
      }

      const actualCastTime = cast.timestamp - begincast.timestamp;
      const expectedCastTime = Math.round(defaultCastTime / (1 + this.haste.current));
      if (!this.constructor.inRange(actualCastTime, expectedCastTime, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
        console.warn(`ABC: ${SPELLS[spellId].name} channel: Expected actual ${actualCastTime}ms to be expected ${expectedCastTime}ms ± 50ms @ ${formatMilliseconds(cast.timestamp - this.owner.fight.start_time)}`, this.combatants.selected.activeBuffs());
      }
    }
  }

  static calculateGlobalCooldown(haste) {
    const gcd = this.BASE_GCD / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(this.MINIMUM_GCD, gcd);
  }
  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }

  get downtimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }
  get activeTimePercentage() {
    return 1 - this.downtimePercentage;
  }

  showStatistic = true;
  static icons = {
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };
  statistic() {
    const boss = this.owner.boss;
    if (!this.showStatistic || (boss && boss.fight.disableDowntimeStatistic)) {
      return null;
    }

      return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(this.downtimePercentage)} %`}
        label="Downtime"
        tooltip={`Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br/>
        <li>You spent <b>${formatPercentage(this.activeTimePercentage)}%</b> of your time casting something.</li>
        <li>You spent <b>${formatPercentage(this.downtimePercentage)}%</b> of your time casting nothing at all.</li>
        `}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${this.activeTimePercentage * 100}%` }}
              data-tip={`You spent <b>${formatPercentage(this.activeTimePercentage)}%</b> of your time casting something.`}
            >
              <img src={this.constructor.icons.activeTime} alt="Active time" />
            </div>
            <div
              className="remainder DeathKnight-bg"
              data-tip={`You spent <b>${formatPercentage(this.downtimePercentage)}%</b> of your time casting nothing at all.`}
            >
              <img src={this.constructor.icons.downtime} alt="Downtime" />
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
      );
  }

  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
