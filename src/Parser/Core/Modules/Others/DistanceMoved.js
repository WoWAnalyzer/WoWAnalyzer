import React from 'react';

import Icon from 'common/Icon';
import { formatThousands } from 'common/format';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import { STATISTIC_ORDER } from 'Main/SmallStatisticBox';


const debug = false;

class DistanceMoved extends Analyzer {
  lastPositionUpdate = null;
  totalDistanceMoved = 0;
  timeSpentMoving = 0;

  // Events
  on_cast(event) {
    if (this.owner.byPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_damage(event) {
    if (this.owner.toPlayer(event)) {
      // Damage coordinates are for the target, so they are only accurate when done TO player
      this.updatePlayerPosition(event);
    }
  }

  on_energize(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_heal(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  on_absorbed(event) {
    if (this.owner.toPlayer(event)) {
      this.updatePlayerPosition(event);
    }
  }

  // Data parsing
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  updateTotalDistance(event) {
    if (!this.lastPositionUpdate) {
      return;
    }
    const distanceMoved = this.calculateDistance(this.lastPositionUpdate.x, this.lastPositionUpdate.y, event.x, event.y);
    if (distanceMoved !== 0) {
      this.timeSpentMoving += event.timestamp - this.lastPositionUpdate.timestamp;
      this.totalDistanceMoved += distanceMoved;
    }    
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.updateTotalDistance(event);
    this.lastPositionUpdate = event;
  }

  statistic() {
    const dist_value = `≈${formatThousands(this.totalDistanceMoved)} yards`;
    const dist_label = "Distance moved";
    const dist_tooltip = `≈${formatThousands(this.totalDistanceMoved / (this.owner.fightDuration / 1000) * 60)} yards per minute. Consider this when analyzing the fight, as some fights require more movement than others. Unnecessary movement can result in a DPS/HPS loss.`;
    const dist_icon = <Icon icon="spell_fire_burningspeed" />;

    const timeMoving_value = `≈${formatPercentage(this.timeSpentMoving / (this.owner.fightDuration))}%`;
    const timeMoving_label = "Time spent moving";
    const timeMoving_tooltip = `In ≈${formatThousands(this.timeSpentMoving / 1000)} seconds of movement you moved ≈${formatThousands(this.totalDistanceMoved)} yards. This statistic is not entirely accurate and may be overstated for fights with lots of problems.`;
    const timeMoving_icon = <Icon icon="inv_misc_pocketwatch_02" />;

    debug && console.log(`Time spent moving: ${this.timeSpentMoving / 1000} s, Total distance moved: ${this.totalDistanceMoved} yds`);

    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="panel statistic-box small">
          <div className="panel-body flex wrapable">
            <div className="flex-main">
              {dist_icon} {dist_label}
            </div>
            <div className="flex-sub text-right">
              {dist_tooltip ? <dfn data-tip={dist_tooltip}>{dist_value}</dfn> : dist_value}
            </div>
          </div>
          <div className="panel-body flex wrapable">
            <div className="flex-main">
              {timeMoving_icon} {timeMoving_label}
            </div>
            <div className="flex-sub text-right">
              {timeMoving_tooltip ? <dfn data-tip={timeMoving_tooltip}>{timeMoving_value}</dfn> : timeMoving_value}
            </div>
          </div>
        </div>
      </div>
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT();
}

export default DistanceMoved;
