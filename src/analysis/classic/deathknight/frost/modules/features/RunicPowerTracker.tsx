import { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { VisualizationSpec } from 'react-vega';
import { formatTime } from 'parser/ui/BaseChart';

/**
 * Tracks Frost DK Runic Power. Two sources, since WCL splits gains and spends
 * across different event types:
 *  - resourcechange (energize) events cover RP *gains*.
 *  - cast events carry a classResources snapshot with the post-cast RP
 *    value.
 */
class RunicPowerTracker extends Analyzer {
  private _rp = 20; // MoP Classic: DKs start with 20 RP on pull
  private _overcapTimes = 0;
  private _overcapTotal = 0;
  private _amsGainTimes = 0;
  private _amsGainTotal = 0;

  readonly rpHistory: Array<{ timestamp: number; amount: number }> = [];

  constructor(options: Options) {
    super(options);
    this.rpHistory.push({ timestamp: options.owner.fight.start_time, amount: this._rp });
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /** Gains: read the overcap/waste off the event, then sync to WCL's RP snapshot. */
  private onResourceChange(event: ResourceChangeEvent): void {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) return;

    const gain = event.resourceChange / 10;
    const waste = event.waste / 10;
    if (waste > 0) {
      this._overcapTimes += 1;
      this._overcapTotal += waste;
    }

    // separately track how much of our RP is coming from AMS specifically
    if (event.ability.guid === SPELLS.ANTI_MAGIC_SHELL.id && gain > 0) {
      this._amsGainTimes += 1;
      this._amsGainTotal += gain;
    }

    this._syncFromClassResources(event.classResources, event.timestamp, gain - waste);
  }

  /** Spends only show up here, on the spending cast's own classResources snapshot. */
  private onCast(event: CastEvent): void {
    this._syncFromClassResources(event.classResources, event.timestamp);
  }

  /** Pull the current RP value straight off a classResources snapshot, if one's there. */
  private _syncFromClassResources(
    classResources: { type: number; amount: number }[] | undefined,
    timestamp: number,
    fallbackDelta?: number,
  ): void {
    const rpResource = classResources?.find((r) => r.type === RESOURCE_TYPES.RUNIC_POWER.id);
    if (rpResource) {
      this._rp = rpResource.amount / 10;
    } else if (fallbackDelta !== undefined) {
      this._rp = Math.max(0, this._rp + fallbackDelta);
    } else {
      return; // no resource info on this event at all, nothing to update
    }
    this.rpHistory.push({ timestamp, amount: this._rp });
  }

  private onFightEnd(event: FightEndEvent): void {
    this.rpHistory.push({ timestamp: event.timestamp, amount: this._rp });
  }

  get netWaste(): number {
    return Math.max(0, this._overcapTotal - this._amsGainTotal);
  }

  get suggestionThresholds() {
    return {
      actual: this.netWaste,
      isGreaterThan: {
        minor: 50,
        average: 100,
        major: 150,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  /**
   * Returns a Vega-Lite spec for the RP line chart at the given pixel width.
   * Called by RuneTracker to embed the RP chart in the shared scrollable container.
   */
  rpVegaSpec(width: number): VisualizationSpec {
    return {
      data: { name: 'rpData' },
      width,
      height: 100,
      transform: [
        { filter: 'isValid(datum.timestamp)' },
        { calculate: `datum.timestamp - ${this.owner.fight.start_time}`, as: 'ts' },
        { calculate: formatTime('datum.ts'), as: 'ts_label' },
      ],
      encoding: {
        x: {
          field: 'ts',
          type: 'quantitative' as const,
          axis: { labelExpr: formatTime('datum.value'), tickCount: 25, grid: false },
          scale: { nice: false },
          title: null,
        },
      },
      layer: [
        {
          layer: [
            {
              mark: {
                type: 'line' as const,
                color: 'rgb(0, 199, 255)',
                interpolate: 'step-after' as const,
              },
            },
            {
              transform: [{ filter: { param: 'hover_rp', empty: false } }],
              mark: 'point' as const,
            },
          ],
          encoding: {
            y: {
              field: 'amount',
              title: 'Runic Power',
              type: 'quantitative' as const,
              // Pinning the axis gutter to a fixed width so this chart's 0s lines
              // up with the rune/cast charts stacked below it (they each pin to
              // the same 40px so none of the y-axis label widths throw things off).
              axis: {
                grid: true,
                values: [0, 20, 40, 60, 80, 100],
                minExtent: 40,
                maxExtent: 40,
              },
              scale: { domain: [0, 100] },
            },
          },
        },
        {
          mark: { type: 'rule' as const, color: 'white' },
          encoding: {
            opacity: {
              condition: { value: 0.3, param: 'hover_rp', empty: false },
              value: 0,
            },
            tooltip: [
              { field: 'ts_label', type: 'nominal' as const, title: 'Time' },
              { field: 'amount', type: 'quantitative' as const, title: 'Runic Power' },
            ],
          },
          params: [
            {
              name: 'hover_rp',
              select: {
                type: 'point' as const,
                fields: ['ts'],
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
          ],
        },
      ],
    } as VisualizationSpec;
  }

  statistic(): JSX.Element {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(90)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            <div>
              <strong>Overcap events:</strong> {this._overcapTimes} (
              {formatNumber(this._overcapTotal)} RP)
            </div>
            <div>
              <strong>AMS RP gained:</strong> {this._amsGainTimes} events (
              {formatNumber(this._amsGainTotal)} RP)
            </div>
            <div>
              <strong>Net wasted RP:</strong> {formatNumber(this.netWaste)}
            </div>
          </>
        }
      >
        <div className="pad">
          <label>Runic Power</label>
          <div className="value">
            {formatNumber(this._overcapTotal)} <small>RP overcapped</small>
          </div>
          {this._amsGainTotal > 0 && (
            <div className="value">
              {formatNumber(this._amsGainTotal)} <small>RP from AMS</small>
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

export default RunicPowerTracker;
