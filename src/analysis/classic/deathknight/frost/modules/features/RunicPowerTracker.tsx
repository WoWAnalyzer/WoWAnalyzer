import { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { VisualizationSpec } from 'react-vega';
import { formatTime } from 'parser/ui/BaseChart';

/**
 * Frost Presence (48266) + Improved Frost Presence (50385):
 *   Always active on Frost DK — no trigger needed.
 *   Each rune spent generates 12 RP (1 rune = 12, 2 runes = 24).
 *   ERW generates 30 RP (not the baseline 25).
 *   Frost Strike costs 20 RP (not the baseline 32).
 *
 * We simulate RP completely ourselves rather than reading WCL's classResources,
 * because WCL's RP amounts and resourcechange events can lag or be imprecise.
 */

/** Total runes consumed per ability — drives Frost Presence RP generation. */
const RUNE_COUNTS: Partial<Record<number, number>> = {
  [SPELLS.ICY_TOUCH.id]: 1,
  [SPELLS.PLAGUE_STRIKE.id]: 1,
  [SPELLS.HOWLING_BLAST.id]: 1,
  [SPELLS.PILLAR_OF_FROST.id]: 1,
  [SPELLS.CHAINS_OF_ICE.id]: 1,
  [SPELLS.NECROTIC_STRIKE.id]: 1,
  [SPELLS.SOUL_REAPER_FROST.id]: 1,
  [SPELLS.BLOOD_STRIKE.id]: 1,
  [SPELLS.BLOOD_BOIL.id]: 1,
  [SPELLS.PESTILENCE.id]: 1,
  [SPELLS.DEATH_AND_DECAY.id]: 1,
  [SPELLS.OBLITERATE.id]: 2,
  [SPELLS.DEATH_STRIKE.id]: 2,
  [SPELLS.FESTERING_STRIKE.id]: 2,
  [SPELLS.SCOURGE_STRIKE.id]: 2,
};

/** RP cost for abilities that spend Runic Power. */
const RP_COSTS: Partial<Record<number, number>> = {
  [SPELLS.FROST_STRIKE.id]: 20, // Frost Presence reduces baseline cost
  [SPELLS.DEATH_COIL_DK.id]: 40,
};

/**
 * Tracks simulated Runic Power for a Frost DK.
 * Frost Presence RP gains are calculated from ability rune costs.
 * AMS RP gain is read from WCL resourcechange events (cannot be simulated).
 */
class RunicPowerTracker extends Analyzer {
  /** RP generated per rune spent via Frost Presence + Improved Frost Presence */
  static readonly RP_PER_RUNE = 12;
  /** ERW RP gain for Frost DK with Frost Presence */
  static readonly ERW_RP_GAIN = 30;
  /** Horn of Winter RP generation */
  static readonly HORN_OF_WINTER_RP = 10;
  /** Frost Strike RP cost with Frost Presence */
  static readonly FROST_STRIKE_RP_COST = 20;

  private _rp = 20; // MoP Classic: DKs start with 20 RP on pull
  private _overcapTimes = 0;
  private _overcapTotal = 0;
  private _amsGainTimes = 0;
  private _amsGainTotal = 0;

  /** Rime (Freezing Fog): while up, Howling Blast costs no rune, so it generates no RP. */
  private _rimeActive = false;

  readonly rpHistory: Array<{ timestamp: number; amount: number }> = [];

  constructor(options: Options) {
    super(options);
    this.rpHistory.push({ timestamp: options.owner.fight.start_time, amount: this._rp });
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRimeRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onRimeApply(_event: ApplyBuffEvent | RefreshBuffEvent) {
    this._rimeActive = true;
  }

  private onRimeRemove(_event: RemoveBuffEvent) {
    this._rimeActive = false;
  }

  /** Gain RP, cap at 100, track overcap. */
  private _gainRP(amount: number, ts: number): void {
    const newRP = this._rp + amount;
    const waste = Math.max(0, newRP - 100);
    if (waste > 0) {
      this._overcapTimes += 1;
      this._overcapTotal += waste;
    }
    this._rp = Math.min(100, newRP);
    this.rpHistory.push({ timestamp: ts, amount: this._rp });
  }

  /** Spend RP: push pre-spend snapshot then post-spend drop. */
  private _spendRP(cost: number, ts: number): void {
    this.rpHistory.push({ timestamp: ts, amount: this._rp });
    this._rp = Math.max(0, this._rp - cost);
    this.rpHistory.push({ timestamp: ts, amount: this._rp });
  }

  /** AMS gain comes from WCL resourcechange since absorbed damage isn't simulatable. */
  private onResourceChange(event: ResourceChangeEvent): void {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) return;
    if (event.ability.guid !== SPELLS.ANTI_MAGIC_SHELL.id) return;
    const gain = event.resourceChange / 10;
    if (gain <= 0) return;
    this._amsGainTimes += 1;
    this._amsGainTotal += gain;
    this._gainRP(gain, event.timestamp);
  }

  private onCast(event: CastEvent): void {
    const spellId = event.ability.guid;

    // ERW: fixed RP gain for Frost DK (Frost Presence bonus)
    if (spellId === SPELLS.EMPOWER_RUNE_WEAPON.id) {
      this._gainRP(RunicPowerTracker.ERW_RP_GAIN, event.timestamp);
      return;
    }

    // Horn of Winter: generates 10 RP
    if (spellId === SPELLS.HORN_OF_WINTER.id) {
      this._gainRP(RunicPowerTracker.HORN_OF_WINTER_RP, event.timestamp);
      return;
    }

    // Howling Blast cast while Rime is active is free — no rune spent, no RP generated.
    if (spellId === SPELLS.HOWLING_BLAST.id && this._rimeActive) {
      this._rimeActive = false;
      return;
    }

    // Rune-spending abilities: Frost Presence generates 12 RP per rune
    const runeCount = RUNE_COUNTS[spellId];
    if (runeCount !== undefined) {
      this._gainRP(runeCount * RunicPowerTracker.RP_PER_RUNE, event.timestamp);
      return;
    }

    // RP spenders
    const rpCost = RP_COSTS[spellId];
    if (rpCost !== undefined) {
      this._spendRP(rpCost, event.timestamp);
    }
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
              axis: { grid: true, values: [0, 20, 40, 60, 80, 100] },
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
