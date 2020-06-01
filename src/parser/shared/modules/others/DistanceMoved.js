import React from 'react';
import { XYPlot, AreaSeries } from 'react-vis';
import { AutoSizer } from 'react-virtualized';
import 'react-vis/dist/style.css';

import { formatPercentage, formatThousands } from 'common/format';
import groupDataForChart from 'common/groupDataForChart';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

const debug = false;

class DistanceMoved extends Analyzer {
  lastPosition = null;
  lastPositionChange = null;
  totalDistanceMoved = 0;
  timeSpentMoving = 0;
  bySecond = {};

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.updatePlayerPosition);
    // These coordinates are for the target, so they are only accurate when done TO player
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updatePlayerPosition);
    this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.updatePlayerPosition);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updatePlayerPosition);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.updatePlayerPosition);
  }

  timeSinceLastMovement() {
    if (!this.lastPositionChange) {
      return null;
    }
    return this.owner.currentTimestamp - this.lastPositionChange.timestamp;
  }

  // Data parsing
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  updateTotalDistance(event) {
    if (!this.lastPosition) {
      return;
    }
    const distanceMoved = this.calculateDistance(this.lastPosition.x, this.lastPosition.y, event.x, event.y);
    if (distanceMoved !== 0) {
      this.timeSpentMoving += event.timestamp - this.lastPosition.timestamp;
      this.totalDistanceMoved += distanceMoved;
      const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
      this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || 0) + distanceMoved;
    }
  }

  updatePlayerPosition(event) {
    if (!event.x || !event.y) {
      return;
    }
    this.updateTotalDistance(event);
    if (!this.lastPositionChange || this.lastPositionChange.x !== event.x || this.lastPositionChange.y !== event.y) {
      this.lastPositionChange = event;
    }
    this.lastPosition = event;
  }

  statistic() {
    debug && console.log(`Time spent moving: ${this.timeSpentMoving / 1000}s, Total distance moved: ${this.totalDistanceMoved} yds`);

    const groupedData = groupDataForChart(this.bySecond, this.owner.fightDuration);

    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT()}
        tooltip={(
          <>
            Consider this when analyzing the fight, as some fights require more movement than others. Unnecessary movement can result in a DPS/HPS loss.<br /><br />

            In ≈{formatThousands(this.timeSpentMoving / 1000)} seconds of movement you moved ≈{formatThousands(this.totalDistanceMoved)} yards (≈{formatThousands(this.totalDistanceMoved / (this.owner.fightDuration / 1000) * 60)} yards per minute). This statistic may not be entirely accurate for fights with lots of problems.
          </>
        )}
      >
        <div className="pad">
          <label>Distance moved</label>

          <div className="value">
            ≈ {formatThousands(this.totalDistanceMoved)} yards
            <small style={{ marginLeft: 15 }}>
              ≈ {formatPercentage(this.timeSpentMoving / (this.owner.fightDuration))}%
            </small>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '45%' }}>
            <AutoSizer>
              {({ width, height }) => (
                <XYPlot
                  margin={0}
                  width={width}
                  height={height}
                >
                  <AreaSeries
                    data={Object.keys(groupedData).map(x => ({
                      x: x / width,
                      y: groupedData[x],
                    }))}
                    className="primary"
                  />
                </XYPlot>
              )}
            </AutoSizer>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DistanceMoved;
