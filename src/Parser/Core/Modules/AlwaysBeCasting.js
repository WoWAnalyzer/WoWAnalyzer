import React from 'react';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import { formatMilliseconds, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Abilities from './Abilities';
import GlobalCooldown from './GlobalCooldown';

import Haste from './Haste';

const debug = false;

class AlwaysBeCasting extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
    abilities: Abilities,
    globalCooldown: GlobalCooldown, // triggers the globalcooldown event
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
  on_globalcooldown(event) {
    this.activeTime += event.duration;
  }

  processCast({ begincast, cast }) {
    if (!cast) {
      return;
    }
    const spellId = cast.ability.guid;
    const isOnGcd = this.isOnGlobalCooldown(spellId);
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

  showStatistic = true;
  static icons = {
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };
  statistic() {
    if (!this.showStatistic) {
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
