import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Obliterate casts in AoE situations where Howling Blast should
 * be used instead. In DW Frost, HB is the correct ability on 3+ targets.
 *
 * Detection: for each Obliterate cast, count distinct targets hit by HB
 * damage events within ±2s. If 3+ distinct targets → the player should
 * have cast HB instead.
 *
 * Matches Python HowlingBlastAnalyzer.
 */

const HB_TARGET_WINDOW_MS = 2_000;
const AOE_TARGET_THRESHOLD = 3;

class HowlingBlastAoE extends Analyzer {
  /** (timestamp, targetID) pairs for all HB hits */
  private _hbHits: Array<{ ts: number; targetID: number }> = [];
  private _obliterateTimes: number[] = [];
  private _badAoe: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HOWLING_BLAST),
      this.onHBDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OBLITERATE),
      this.onObliterate,
    );
  }

  private onHBDamage(event: DamageEvent) {
    if (event.targetID !== undefined) {
      this._hbHits.push({ ts: event.timestamp, targetID: event.targetID });
    }
  }

  private onObliterate(event: CastEvent) {
    this._obliterateTimes.push(event.timestamp);
  }

  private _computeBadAoe(): number {
    // _hbHits is sorted by timestamp as it's appended in event order, so for each Obliterate cast
    // we can binary-search the window bounds instead of scanning every HB hit (O(n log n) overall
    // instead of O(n^2)).
    const timestamps = this._hbHits.map((h) => h.ts);
    let count = 0;
    for (const ts of this._obliterateTimes) {
      const lo = this._lowerBound(timestamps, ts - HB_TARGET_WINDOW_MS);
      const hi = this._upperBound(timestamps, ts + HB_TARGET_WINDOW_MS);
      const uniqueTargets = new Set(this._hbHits.slice(lo, hi).map((h) => h.targetID)).size;
      if (uniqueTargets >= AOE_TARGET_THRESHOLD) {
        count += 1;
      }
    }
    return count;
  }

  /** Index of the first element >= value. */
  private _lowerBound(sorted: number[], value: number): number {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (sorted[mid] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  /** Index of the first element > value. */
  private _upperBound(sorted: number[], value: number): number {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (sorted[mid] <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  get badAoeCasts(): number {
    if (this._badAoe === null) {
      this._badAoe = this._computeBadAoe();
    }
    return this._badAoe;
  }

  get suggestionThresholds() {
    return {
      actual: this.badAoeCasts,
      isGreaterThan: { minor: 0, average: 2, major: 5 },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.badAoeCasts === 0) {
      return null;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(48)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this.badAoeCasts} Obliterate cast${this.badAoeCasts !== 1 ? 's' : ''} detected when 3+ targets were present (based on HB hit count within ±2s).`}
      >
        <div className="pad">
          <label>Obliterate in AoE</label>
          <div className="value">
            {this.badAoeCasts} <small>should be HB</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default HowlingBlastAoE;
