import React from 'react';

import Icon from 'common/Icon';
import { formatMilliseconds, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Tooltip from 'common/Tooltip';

import Abilities from '../../core/modules/Abilities';
import GlobalCooldown from './GlobalCooldown';
import Channeling from './Channeling';

import Haste from './Haste';

const debug = false;

class AlwaysBeCasting extends Analyzer {
  static dependencies = {
    haste: Haste,
    abilities: Abilities,
    globalCooldown: GlobalCooldown, // triggers the globalcooldown event
    channeling: Channeling, // triggers the channeling-related events
  };

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  get totalTimeWasted() {
    return this.owner.fightDuration - this.activeTime;
  }
  get downtimePercentage() {
    return 1 - this.activeTimePercentage;
  }
  get activeTimePercentage() {
    return this.activeTime / this.owner.fightDuration;
  }

  activeTime = 0;
  _lastGlobalCooldownDuration = 0;
  on_globalcooldown(event) {
    this._lastGlobalCooldownDuration = event.duration;
    if (event.trigger.prepull) {
      // Ignore prepull casts for active time since active time should only include casts during the
      return false;
    }
    if (event.trigger.type === EventType.BeginChannel) {
      // Only add active time for this channel, we do this when the channel is finished and use the highest of the GCD and channel time
      return false;
    }
    this.activeTime += event.duration;
    return true;
  }
  on_endchannel(event) {
    // If the channel was shorter than the GCD then use the GCD as active time
    let amount = event.duration;
    if (this.globalCooldown.isOnGlobalCooldown(event.ability.guid)) {
      amount = Math.max(amount, this._lastGlobalCooldownDuration);
    }
    this.activeTime += amount;
    return true;
  }

  processCast({ begincast, cast }) {
    if (!cast) {
      return;
    }
    const spellId = cast.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);

    if (!isOnGCD) {
      debug && console.log(formatMilliseconds(this.owner.fightDuration), `%cABC: ${cast.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }

    const globalCooldown = this.getGlobalCooldownDuration(spellId);

    const castStartTimestamp = (begincast || cast).timestamp;

    this.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId,
    );
  }

  showStatistic = true;
  position = STATISTIC_ORDER.CORE(10);
  static icons = {
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };
  statistic() {
    const boss = this.owner.boss;
    if (!this.showStatistic || (boss && boss.fight.disableDowntimeStatistic)) {
      return null;
    }
    if (!this.globalCooldown.isAccurate) {
      return null;
    }

    return (
      <StatisticBox
        position={this.position}
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(this.downtimePercentage)} %`}
        label="Downtime"
        tooltip={(
          <>
            Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br />
            <ul>
              <li>You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your time casting something.</li>
              <li>You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time casting nothing at all.</li>
            </ul>
          </>
        )}
        footer={(
          <div className="statistic-box-bar">
            <Tooltip content={<>You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your time casting something.</>}>
              <div
                className="stat-health-bg"
                style={{
                  width: `${this.activeTimePercentage * 100}%`,
                }}
              >
                <img src={this.constructor.icons.activeTime} alt="Active time" />
              </div>
            </Tooltip>
            <Tooltip content={<>You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time casting nothing at all.</>}>
              <div className="remainder DeathKnight-bg">
                <img src={this.constructor.icons.downtime} alt="Downtime" />
              </div>
            </Tooltip>
          </div>
        )}
      />
    );
  }

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.04,
        major: 0.06,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.downtimeSuggestionThresholds.actual).isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC), avoid delays between casting spells and cast instant spells when you have to move.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.downtimeSuggestionThresholds.isGreaterThan.average).major(this.downtimeSuggestionThresholds.isGreaterThan.major);
      });
  }
}

export default AlwaysBeCasting;
