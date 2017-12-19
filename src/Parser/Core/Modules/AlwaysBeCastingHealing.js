import React from 'react';

import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCastingHealing extends CoreAlwaysBeCasting {
  static HEALING_ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];

  totalHealingTimeWasted = 0;
  get nonHealingTimePercentage() {
    return this.totalHealingTimeWasted / this.owner.fightDuration;
  }

  _lastHealingCastFinishedTimestamp = null;

  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    super.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );

    if (this.countsAsHealingAbility(cast)) {
      const healTimeWasted = castStartTimestamp - (this._lastHealingCastFinishedTimestamp || this.owner.fight.start_time);
      this.totalHealingTimeWasted += healTimeWasted;
      this._lastHealingCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
    }
  }
  on_finished() {
    super.on_finished();

    const healTimeWasted = this.owner.fight.end_time - (this._lastHealingCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalHealingTimeWasted += healTimeWasted;
  }
  countsAsHealingAbility(cast) {
    return this.constructor.HEALING_ABILITIES_ON_GCD.indexOf(cast.ability.guid) !== -1;
  }

  showStatistic = true;
  statistic() {
    if (!this.showStatistic) {
      return null;
    }

    const downtime = this.totalTimeWasted;
    const healingTime = this.owner.fightDuration - this.totalHealingTimeWasted;
    const nonHealCastTime = this.totalHealingTimeWasted - this.totalTimeWasted;

    const downtimePercentage = downtime / this.owner.fightDuration;
    const healingTimePercentage = healingTime / this.owner.fightDuration;
    const nonHealCastTimePercentage = nonHealCastTime / this.owner.fightDuration;

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
              <img src="/img/healing.png" alt="Healing time" />
            </div>
            <div
              className="Druid-bg"
              style={{ width: `${nonHealCastTimePercentage * 100}%` }}
              data-tip={`You spent <b>${formatPercentage(nonHealCastTimePercentage)}%</b> of your time casting non-healing spells.`}
            >
              <img src="/img/sword.png" alt="Non-heal cast time" />
            </div>
            <div
              className="remainder DeathKnight-bg"
              data-tip={`You spent <b>${formatPercentage(downtimePercentage)}%</b> of your time casting nothing at all.`}
            >
              <img src="/img/afk.png" alt="Downtime" />
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCastingHealing;
