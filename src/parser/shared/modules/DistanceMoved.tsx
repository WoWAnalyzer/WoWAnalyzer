import { Trans } from '@lingui/macro';
import { formatDurationMillisMinSec, formatPercentage, formatThousands } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, ResourceChangeEvent, HealEvent } from 'parser/core/Events';
import FlushLineChart from 'parser/ui/FlushLineChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const debug = false;

type PositionalData = {
  x: number;
  y: number;
  timestamp: number;
};

class DistanceMoved extends Analyzer {
  lastPosition: PositionalData | null = null;
  lastPositionChange: PositionalData | null = null;
  totalDistanceMoved = 0;
  timeSpentMoving = 0;
  bySecond = new Map<number, number>();
  instances: Array<{ start: number; end: number; distance: number }> = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.updatePlayerPosition);
    // These coordinates are for the target, so they are only accurate when done TO player
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updatePlayerPosition);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.updatePlayerPosition);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updatePlayerPosition);
    /* I couldn't find any instances of absorbed events containing location,
     * if it can actually happen we can update the AbsorbedEvent shape and
     * uncomment this binding.
     * this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.updatePlayerPosition);
     */
  }

  timeSinceLastMovement() {
    if (!this.lastPositionChange) {
      return null;
    }
    return this.owner.currentTimestamp - this.lastPositionChange.timestamp;
  }

  // Data parsing
  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  updateDistance(newData: PositionalData) {
    if (!this.lastPosition) {
      return;
    }
    const distance = this.calculateDistance(
      this.lastPosition.x,
      this.lastPosition.y,
      newData.x,
      newData.y,
    );
    if (distance !== 0) {
      this.timeSpentMoving += newData.timestamp - this.lastPosition.timestamp;
      this.totalDistanceMoved += distance;
      const secondsIntoFight = Math.floor((newData.timestamp - this.owner.fight.start_time) / 1000);
      this.bySecond.set(secondsIntoFight, (this.bySecond.get(secondsIntoFight) || 0) + distance);

      const start = this.lastPosition.timestamp;
      const end = newData.timestamp;

      if (start > end) {
        console.warn(
          `[DistanceMoved] ${formatDurationMillisMinSec(start - this.owner.fight.start_time, 2)} End is before start`,
        );
      } else if (end === start) {
        console.warn(
          `[DistanceMoved] ${formatDurationMillisMinSec(start - this.owner.fight.start_time, 2)} There is a distance, but end is  equal to start`,
        );
      }

      this.instances.push({
        start,
        end,
        distance,
      });
    }
  }

  updatePlayerPosition(event: CastEvent | HealEvent | DamageEvent | ResourceChangeEvent) {
    if (!event.x || !event.y) {
      return;
    }
    const updatedPosition: PositionalData = {
      x: event.x,
      y: event.y,
      timestamp: event.timestamp,
    };
    this.updateDistance(updatedPosition);
    if (
      !this.lastPositionChange ||
      this.lastPositionChange.x !== updatedPosition.x ||
      this.lastPositionChange.y !== updatedPosition.y
    ) {
      this.lastPositionChange = updatedPosition;
    }
    this.lastPosition = updatedPosition;
  }

  statistic() {
    debug &&
      console.log(
        `Time spent moving: ${this.timeSpentMoving / 1000}s, Total distance moved: ${
          this.totalDistanceMoved
        } yds`,
      );

    const data = Array.from(this.bySecond, ([sec, val]) => ({ time: sec, val: val }));

    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT()}
        tooltip={
          <Trans id="shared.distanceMoved.statistic.tooltip">
            Consider this when analyzing the fight, as some fights require more movement than
            others. Unnecessary movement can result in a DPS/HPS loss.
            <br />
            <br />
            In ≈{formatThousands(this.timeSpentMoving / 1000)} seconds of movement you moved ≈
            {formatThousands(this.totalDistanceMoved)} yards (≈
            {formatThousands(
              (this.totalDistanceMoved / (this.owner.fightDuration / 1000)) * 60,
            )}{' '}
            yards per minute). This statistic may not be entirely accurate for fights with lots of
            problems.
          </Trans>
        }
      >
        <div className="pad">
          <label>
            <Trans id="shared.distanceMoved.statistic.label">Distance moved</Trans>
          </label>

          <div className="value">
            ≈ {formatThousands(this.totalDistanceMoved)} yards
            <small style={{ marginLeft: 15 }}>
              ≈ {formatPercentage(this.timeSpentMoving / this.owner.fightDuration)}%
            </small>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: '45%',
            }}
          >
            <FlushLineChart data={data} duration={this.owner.fightDuration / 1000} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DistanceMoved;
