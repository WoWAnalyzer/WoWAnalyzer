import React from 'react';

import Icon from 'common/Icon';
import { formatPercentage, formatThousands } from 'common/format';
import Tooltip from 'common/Tooltip';

import Analyzer from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/SmallStatisticBox';
import StatisticWrapper from 'interface/others/StatisticWrapper';

const debug = false;

class DistanceMoved extends Analyzer {
  lastPositionUpdate = null;
  lastPositionChange = null;
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

  timeSinceLastMovement() {
    return this.owner.currentTimestamp - this.lastPositionChange.timestamp;
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
    if (!this.lastPositionChange || event.x !== this.lastPositionChange.x || event.y !== this.lastPositionChange.y) {
      this.lastPositionChange = event;
    }
    this.lastPositionUpdate = event;
  }

  statistic() {
    debug && console.log(`Time spent moving: ${this.timeSpentMoving / 1000} s, Total distance moved: ${this.totalDistanceMoved} yds`);

    return (
      <StatisticWrapper position={STATISTIC_ORDER.UNIMPORTANT()}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <div className="panel statistic-box small">
            <div className="panel-body flex wrapable">
              <div className="flex-main">
                <Icon icon="spell_fire_burningspeed" /> Distance moved
              </div>
              <div className="flex-sub text-right">
                <Tooltip content={`≈${formatThousands(this.totalDistanceMoved / (this.owner.fightDuration / 1000) * 60)} yards per minute. Consider this when analyzing the fight, as some fights require more movement than others. Unnecessary movement can result in a DPS/HPS loss.`}>
                  ≈ {formatThousands(this.totalDistanceMoved)} yards
                </Tooltip>
              </div>
            </div>
            <div className="panel-body flex wrapable">
              <div className="flex-main">
                <Icon icon="inv_misc_pocketwatch_02" /> Time spent moving
              </div>
              <div className="flex-sub text-right">
                <Tooltip content={`In ≈${formatThousands(this.timeSpentMoving / 1000)} seconds of movement you moved ≈${formatThousands(this.totalDistanceMoved)} yards. This statistic is not entirely accurate and may be overstated for fights with lots of problems.`}>
                  ≈ {formatPercentage(this.timeSpentMoving / (this.owner.fightDuration))} %
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </StatisticWrapper>
    );
  }
}

export default DistanceMoved;
