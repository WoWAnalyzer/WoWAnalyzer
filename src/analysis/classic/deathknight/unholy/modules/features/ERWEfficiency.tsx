import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import UnholyRuneTracker from './RuneTracker';

const RP_CAP = 100;
const ERW_RP_GAIN = 30;

interface ERWCast {
  timestamp: number;
  runesOnCd: number;
  rpBefore: number;
  perfectRunes: boolean;
  perfectRp: boolean;
}

/**
 * Tracks Empower Rune Weapon usage quality for Unholy DK.
 * Optimal: all 6 runes on CD AND RP ≤ 70 before the cast.
 */
class ERWEfficiency extends Analyzer {
  static dependencies = {
    runeTracker: UnholyRuneTracker,
    castEfficiency: CastEfficiency,
  };

  protected runeTracker!: UnholyRuneTracker;
  protected castEfficiency!: CastEfficiency;

  private _casts: ERWCast[] = [];
  private _lastKnownRp = 20;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMPOWER_RUNE_WEAPON),
      this.onERW,
    );
  }

  private onAnyCast(event: CastEvent) {
    // Skip ERW's own cast: this listener and onERW both fire on the same
    // event, and this one runs first, so updating here would clobber
    // _lastKnownRp with ERW's post-cast RP before onERW reads it as "before."
    if (event.ability.guid === SPELLS.EMPOWER_RUNE_WEAPON.id) return;

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
    const runesOnCd = this.runeTracker.runesOnCooldown(event.timestamp);
    const rpBefore = this._lastKnownRp;
    const perfectRunes = runesOnCd === 6;
    const perfectRp = rpBefore + ERW_RP_GAIN <= RP_CAP;
    this._casts.push({ timestamp: event.timestamp, runesOnCd, rpBefore, perfectRunes, perfectRp });
  }

  get possibleCasts() {
    // Delegate to CastEfficiency so the eyeMult cooldown reduction from Evil
    // Eye of Galakras (registered on the spell's Abilities.ts entry) is
    // accounted for, instead of assuming a flat 300s cooldown here.
    const info = this.castEfficiency.getCastEfficiencyForSpell(SPELLS.EMPOWER_RUNE_WEAPON);
    return Math.max(this._casts.length, info ? Math.ceil(info.maxCasts) : this._casts.length);
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
      isLessThan: { minor: 1.0, average: 0.75, major: 0.5 },
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
