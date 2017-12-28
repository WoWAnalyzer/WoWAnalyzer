import React from 'react';

import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCastingHealing extends CoreAlwaysBeCasting {
  static HEALING_ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];

  healingTime = 0;
  get healingTimePercentage() {
    return this.healingTime / this.owner.fightDuration;
  }
  get nonHealingTimePercentage() {
    return 1 - this.healingTimePercentage;
  }

  _lastHealingCastFinishedTimestamp = null;

  on_globalcooldown(event) {
    super.on_globalcooldown(event);
    if (this.countsAsHealingAbility(event)) {
      this.healingTime += event.duration;
    }
  }
  countsAsHealingAbility(cast) {
    return this.constructor.HEALING_ABILITIES_ON_GCD.indexOf(cast.ability.guid) !== -1;
  }

  showStatistic = true;
  static icons = {
    healingTime: '/img/healing.png',
    activeTime: '/img/sword.png',
    downtime: '/img/afk.png',
  };
  statistic() {
    if (!this.showStatistic) {
      return null;
    }

    const downtimePercentage = this.downtimePercentage;
    const healingTimePercentage = this.healingTimePercentage;
    const nonHealCastTimePercentage = this.activeTimePercentage - healingTimePercentage;

    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(downtimePercentage)} %`}
        label="Downtime"
        tooltip={`Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br/>
        <li>You spent <b>${formatPercentage(healingTimePercentage)}%</b> of your time casting heals.</li>
        <li>You spent <b>${formatPercentage(nonHealCastTimePercentage)}%</b> of your time casting non-healing spells.</li>
        <li>You spent <b>${formatPercentage(downtimePercentage)}%</b> of your time casting nothing at all.</li>
        `}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${healingTimePercentage * 100}%` }}
              data-tip={`You spent <b>${formatPercentage(healingTimePercentage)}%</b> of your time casting heals.`}
            >
              <img src={this.constructor.icons.healingTime} alt="Healing time" />
            </div>
            <div
              className="Druid-bg"
              style={{ width: `${nonHealCastTimePercentage * 100}%` }}
              data-tip={`You spent <b>${formatPercentage(nonHealCastTimePercentage)}%</b> of your time casting non-healing spells.`}
            >
              <img src={this.constructor.icons.activeTime} alt="Non-heal cast time" />
            </div>
            <div
              className="remainder DeathKnight-bg"
              data-tip={`You spent <b>${formatPercentage(downtimePercentage)}%</b> of your time casting nothing at all.`}
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

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.3,
        average: 0.4,
        major: 0.45,
      },
      style: 'percentage',
    };
  }
  // Override these suggestion thresholds for healers: it's much less important to DPS so allow for considerable slack.
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 1,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.nonHealingTimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to reduce the amount of time you\'re not healing, for example by reducing the delay between casting spells, moving during the GCD and if you have to move try to continue healing with instant spells.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    when(this.downtimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to reduce your downtime, for example by reducing the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default AlwaysBeCastingHealing;
