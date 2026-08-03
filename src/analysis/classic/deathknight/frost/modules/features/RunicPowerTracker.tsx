import { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { VisualizationSpec } from 'react-vega';
import { formatTime } from 'parser/ui/BaseChart';

/**
 * Tracks Frost DK Runic Power via the core ResourceTracker.
 *
 * WCL reports RP `classResources.amount` at a 10x scale (max 1000 = 100 RP),
 * but the `resourcechange` gain/waste fields come through already in real
 * units. `getAdjustedGain` scales those up by 10 so gains stay on the same
 * internal scale as `current`/`max`; everything is divided back down to real
 * RP only when exposed for display (rpHistory, netWaste, statistic()).
 */
class RunicPowerTracker extends ResourceTracker {
  private _overcapTimes = 0;
  private _overcapTotal = 0;
  private _amsGainTimes = 0;
  private _amsGainTotal = 0;

  /**
   * RP decays passively before the pull (out of combat), so there's no fixed
   * "starting" value we can hardcode - it depends entirely on how long the
   * player sat still beforehand. WCL tracks the real value throughout, so
   * instead of guessing we seed `initialResources` from the first event that
   * actually reports a Runic Power classResources snapshot, whatever that
   * value happens to be. See `_seedInitialResources`.
   */
  private _initialResourcesSeeded = false;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
    this.maxResource = 1000; // 100 RP, WCL reports classResources at 10x scale
  }

  /**
   * One-time seed of `initialResources` from the first event that carries a
   * Runic Power classResources snapshot, so `current` (and therefore every
   * later gain/spend delta) starts from what WCL actually saw rather than an
   * assumed flat value. `classResources.amount` is reported *after* whatever
   * change this event is about to apply, so we reverse it: subtract the
   * about-to-happen gain, or add back the about-to-happen cost, to recover
   * the true pre-event value.
   */
  private _seedInitialResources(
    event: CastEvent | ResourceChangeEvent,
    changeAboutToApply: number,
  ) {
    if (this._initialResourcesSeeded) {
      return;
    }
    const resource = this.getResource(event);
    if (resource) {
      this.initialResources = resource.amount - changeAboutToApply;
      this._initialResourcesSeeded = true;
    }
  }

  /**
   * Scales the reported gain/waste up to the tracker's internal 10x scale,
   * and separately tallies overcap and AMS-sourced gains for the statistic
   * and netWaste calculation below.
   */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const base = super.getAdjustedGain(event);
    const gain = base.gain * 10;
    const waste = base.waste * 10;

    this._seedInitialResources(event, gain);

    if (waste > 0) {
      this._overcapTimes += 1;
      this._overcapTotal += waste / 10;
    }

    // separately track how much of our RP is coming from AMS specifically
    // (WCL attributes this energize to a DIFFERENT spell id than the shield
    // cast/buff itself - see ANTI_MAGIC_SHELL_RP_GAINED's own comment)
    if (event.ability.guid === SPELLS.ANTI_MAGIC_SHELL_RP_GAINED.id && gain > 0) {
      this._amsGainTimes += 1;
      this._amsGainTotal += gain / 10;
    }

    return { gain, waste };
  }

  /** Frost Presence passively reduces Frost Strike's RP cost by 15 (real units; 150 at our 10x scale). */
  private static readonly FROST_STRIKE_PRESENCE_DISCOUNT = 150;

  /**
   * WCL reports Frost Strike's *base* RP cost (35 RP / 350 at our scale) - it doesn't
   * account for Frost Presence's passive discount. We detect the presence buff
   * ourselves and apply the discount, since nothing upstream does it for us.
   *
   * Raise Ally is also special-cased: WCL's tooltip data still reports its
   * old 30 RP cost, but that cost was removed from the ability in a later
   * patch - it's free now. Force it to 0 so we don't fabricate a spend that
   * no longer happens.
   */
  getAdjustedCost(event: CastEvent): number | undefined {
    if (event.ability.guid === SPELLS.RAISE_ALLY.id) {
      return undefined;
    }
    const cost = super.getAdjustedCost(event);
    if (
      cost !== undefined &&
      event.ability.guid === SPELLS.FROST_STRIKE.id &&
      this.selectedCombatant.hasBuff(SPELLS.FROST_PRESENCE.id)
    ) {
      return Math.max(0, cost - RunicPowerTracker.FROST_STRIKE_PRESENCE_DISCOUNT);
    }
    return cost;
  }

  /** Army of the Dead generates 10 RP per rune it consumes (3 runes = 30 RP), 10x scale. */
  private static readonly ARMY_OF_THE_DEAD_RP_GAIN = 300;
  /** Frost Presence increases RP generation by 20%. */
  private static readonly FROST_PRESENCE_RP_GAIN_MULT = 1.2;

  /**
   * Unlike retail, WCL's classic combat log reports a cast's `classResources.amount`
   * as the RP value *after* the spend rather than before it. The base class's
   * `_applySpender` assumes "before", so passing that reported amount through would
   * double-subtract the cost (once via the reported snapshot, once via the delta).
   * We sidestep this by not passing a resource snapshot at all, so the update is
   * computed purely from our own gain-tracked running total.
   */
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.ARMY_OF_THE_DEAD.id) {
      // WCL doesn't emit a resourcechange event for this gain, so we fabricate it.
      const gain = this.selectedCombatant.hasBuff(SPELLS.FROST_PRESENCE.id)
        ? RunicPowerTracker.ARMY_OF_THE_DEAD_RP_GAIN * RunicPowerTracker.FROST_PRESENCE_RP_GAIN_MULT
        : RunicPowerTracker.ARMY_OF_THE_DEAD_RP_GAIN;
      this.processInvisibleEnergize(SPELLS.ARMY_OF_THE_DEAD.id, gain, event.timestamp);
    }

    const cost = this.getAdjustedCost(event);
    if (cost) {
      this._seedInitialResources(event, -cost);
      this._applySpender(event, cost, undefined);
    }
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
   * Time ordered {timestamp, amount} history in real RP units, seeded with
   * `initialResources` (whatever WCL reported on the first RP event) so the
   * chart doesn't start blank before that first event.
   */
  get rpHistory(): Array<{ timestamp: number; amount: number }> {
    const history = this.resourceUpdates.map((update) => ({
      timestamp: update.timestamp,
      amount: update.current / 10,
    }));
    const fightStart = this.owner.fight.start_time;
    if (history.length === 0 || history[0].timestamp !== fightStart) {
      history.unshift({ timestamp: fightStart, amount: this.initialResources / 10 });
    }
    return history;
  }

  /**
   * Returns a Vega-Lite spec for the RP line chart.
   * Called by RuneTracker to embed the RP chart in the shared scrollable container.
   * Width/height are set by the BaseChart display component, not the spec itself.
   *
   * `domain` must be the SAME [start, end] (fight-start-relative ms) passed to
   * the rune and cast-timeline specs - otherwise each chart auto-scales to its
   * own data's extent and their gridlines (0s included) land at different
   * pixel offsets despite sharing a declared width.
   */
  rpVegaSpec(domain: [number, number]): VisualizationSpec {
    return {
      data: { name: 'rpData' },
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
          scale: { nice: false, domain },
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
