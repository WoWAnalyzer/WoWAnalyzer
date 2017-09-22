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

  showStatistic = false;
  statistic() {
    if (!this.showStatistic) {
      return null;
    }
    const nonHealingTimePercentage = this.totalHealingTimeWasted / this.owner.fightDuration;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(nonHealingTimePercentage)} %`}
        label="Non healing time"
        tooltip={`Non healing time is available casting time not used for a spell that helps you heal. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), DPSing, etc. Any spell casts that did not have a positive healing effect were considered downtime.<br /><br />You spent ${formatPercentage(deadTimePercentage)}% of your time casting nothing at all.`}
        footer={(
          <div className="statistic-bar">
            <div
              className="remainder Hunter-bg"
              data-tip="Amount of time you were active."
            >
              <img src="/img/play.png" alt="Active time" />
            </div>
            <div
              className="DeathKnight-bg"
              style={{ width: `${this.totalHealingTimeWasted / this.owner.fightDuration * 100}%` }}
              data-tip="Amount of downtime during which you could have been casting something."
            >
              <img src="/img/afk.png" alt="AFK time" />
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
