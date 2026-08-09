import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import UnholyRuneTracker from './RuneTracker';

// WCL classResources type IDs — typed runes
const BLOOD_RUNE_TYPE = 20;
const FROST_RUNE_TYPE = 21;

/**
 * Tracks suboptimal Festering Strike casts where Blood or Frost runes were
 * not both available, forcing a Death rune substitution.
 *
 * FS should be cast only when both a natural Blood AND a natural Frost rune
 * are ready, so both convert to Death runes after spending. Casting when only
 * a Death rune is available wastes the conversion opportunity and burns a
 * scarce resource.
 *
 * Detection: if classResources does not include an entry for type=20 (Blood)
 * or type=21 (Frost) with cost>0, then a Death rune filled that slot.
 *
 * Note: does NOT flag casts during Bloodlust/Heroism (Python skips those).
 */
class FesteringStrikeWaste extends Analyzer {
  static dependencies = {
    runeTracker: UnholyRuneTracker,
  };

  protected runeTracker!: UnholyRuneTracker;

  private _totalCasts = 0;
  private _wasteCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_STRIKE),
      this.onCast,
    );
  }

  private onCast(event: CastEvent) {
    this._totalCasts += 1;

    if (!event.classResources) {
      return;
    }

    // Check if a natural Blood and natural Frost rune were spent.
    // If either is missing from classResources (cost>0 with typed ID), a Death
    // rune substituted for that slot.
    let hadBlood = false;
    let hadFrost = false;
    for (const res of event.classResources) {
      const cost = (res as { cost?: number }).cost ?? 0;
      if (cost <= 0) {
        continue;
      }
      if (res.type === BLOOD_RUNE_TYPE) {
        hadBlood = true;
      }
      if (res.type === FROST_RUNE_TYPE) {
        hadFrost = true;
      }
    }

    if (!hadBlood || !hadFrost) {
      this._wasteCasts += 1;
    }
  }

  get wasteRate() {
    return this._totalCasts > 0 ? this._wasteCasts / this._totalCasts : 0;
  }

  get suggestionThresholds() {
    return {
      actual: this._wasteCasts,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(35)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._wasteCasts} of ${this._totalCasts} Festering Strike casts used a Death rune substitution.`}
      >
        <div className="pad">
          <label>Festering Strike</label>
          <div className="value">
            {this._wasteCasts} <small>/ {this._totalCasts} suboptimal</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default FesteringStrikeWaste;
