import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import FrostRuneTracker from './RuneTracker';

const ERW_CD_MS = 300_000; // 5-minute CD
const RP_CAP = 100; // display RP units
const ERW_RP_GAIN = 30;
const ONSET_MS = 10_000;

interface ERWCast {
  timestamp: number;
  runesOnCd: number;
  rpBefore: number;
  perfectRunes: boolean;
  perfectRp: boolean;
}

/**
 * Tracks Empower Rune Weapon usage quality.
 *
 * An optimal ERW cast refreshes all 6 runes (all were on CD) AND generates
 * the full 30 RP (pre-cast RP ≤ 70). Missing either wastes part of the
 * cooldown's value. ERW should be held until both conditions are met.
 */
class ERWEfficiency extends Analyzer {
  static dependencies = {
    runeTracker: FrostRuneTracker,
  };

  protected runeTracker!: FrostRuneTracker;

  private _casts: ERWCast[] = [];
  private _lastKnownRp = 20; // DKs start at 20 RP

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMPOWER_RUNE_WEAPON),
      this.onERW,
    );
  }

  private onAnyCast(event: CastEvent) {
    // Track RP from classResources on every cast to know pre-ERW RP
    if (event.classResources) {
      for (const res of event.classResources) {
        if (res.type === RESOURCE_TYPES.RUNIC_POWER.id) {
          this._lastKnownRp = res.amount / 10;
          break;
        }
      }
    }
  }

  private onERW(event: CastEvent) {
    // Rune state is read BEFORE the RuneTracker processes this cast's spend
    // (ERW refreshes runes, so we want the pre-ERW on-CD count)
    const runesOnCd = this.runeTracker.runesOnCooldown(event.timestamp);
    const rpBefore = this._lastKnownRp;
    const perfectRunes = runesOnCd === 6;
    const perfectRp = rpBefore + ERW_RP_GAIN <= RP_CAP;

    this._casts.push({
      timestamp: event.timestamp,
      runesOnCd,
      rpBefore,
      perfectRunes,
      perfectRp,
    });
  }

  get possibleCasts() {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    return Math.max(this._casts.length, Math.floor((fightMs - ONSET_MS) / ERW_CD_MS) + 1);
  }

  get perfectCasts() {
    return this._casts.filter((c) => c.perfectRunes && c.perfectRp).length;
  }

  get perfectRate() {
    return this._casts.length > 0 ? this.perfectCasts / this._casts.length : 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.perfectRate,
      isLessThan: {
        minor: 1.0,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            {this._casts.map((c, i) => (
              <div key={i}>
                Cast {i + 1}: {c.runesOnCd}/6 runes on CD, {formatNumber(c.rpBefore)} RP before
                {c.perfectRunes && c.perfectRp ? ' ✓' : ' ✗'}
              </div>
            ))}
            <div>
              <strong>Possible casts:</strong> {this.possibleCasts}
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.EMPOWER_RUNE_WEAPON}>
          {this.perfectCasts}/{this._casts.length} <small>optimal casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ERWEfficiency;
