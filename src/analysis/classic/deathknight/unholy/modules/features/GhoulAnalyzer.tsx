import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Risen Ghoul uptime and ability usage for Unholy DK.
 *
 * Key metrics:
 *  - Ghoul uptime: how much of the fight the ghoul was alive (should be near 100%)
 *  - Gnaw: crowd-control ability that should be used at least once per fight
 *  - Claw / Sweeping Claws: basic attacks (counted for completeness)
 *
 * Unlike Frost, Unholy's ghoul is permanent — Raise Dead is cast once and
 * the ghoul stays alive. Uptime is tracked from each Raise Dead cast to the
 * next, an overkill event, or fight end. The goal is 100% uptime.
 *
 * Matches Python GhoulAnalyzer (simplified — Python version has full pet-event
 * source-instance tracking; WoWAnalyzer classic uses SELECTED_PLAYER_PET).
 */

interface GhoulWindow {
  start: number;
  end: number | null;
}

class GhoulAnalyzer extends Analyzer {
  private _windows: GhoulWindow[] = [];
  private _numClaws = 0;
  private _numSweepingClaws = 0;
  private _numGnaws = 0;

  constructor(options: Options) {
    super(options);

    // Player cast: Raise Dead opens a new ghoul window
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAISE_DEAD),
      this.onRaiseDead,
    );

    // Pet damage events — count ghoul abilities
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  private onRaiseDead(event: CastEvent) {
    // Close the current window if still open (dismissed/re-raised)
    if (this._windows.length > 0) {
      const last = this._windows[this._windows.length - 1];
      if (last.end === null) {
        last.end = event.timestamp;
      }
    }
    this._windows.push({ start: event.timestamp, end: null });
  }

  private onPetDamage(event: DamageEvent) {
    // Open an implicit window if ghoul was alive before Raise Dead was seen
    // (pre-pull raise)
    if (this._windows.length === 0) {
      this._windows.push({ start: 0, end: null });
    }

    const abilityId = event.ability?.guid;
    if (abilityId === SPELLS.GHOUL_CLAW.id) {
      this._numClaws += 1;
    } else if (abilityId === SPELLS.GHOUL_SWEEPING_CLAWS.id) {
      this._numSweepingClaws += 1;
    } else if (abilityId === SPELLS.GHOUL_GNAW.id) {
      this._numGnaws += 1;
    }

    // Detect ghoul death via overkill on self (targetIsFriendly + overkill)
    if (event.targetIsFriendly && event.overkill && this._windows.length > 0) {
      const last = this._windows[this._windows.length - 1];
      if (last.end === null) {
        last.end = event.timestamp;
      }
    }
  }

  get uptimePct(): number {
    const fightEnd = this.owner.fight.end_time - this.owner.fight.start_time;
    // Close any still-open window at fight end
    let totalUptime = 0;
    for (const w of this._windows) {
      const end = w.end ?? fightEnd;
      totalUptime += Math.max(0, end - w.start);
    }
    return fightEnd > 0 ? totalUptime / fightEnd : 0;
  }

  get usedGnaw(): boolean {
    return this._numGnaws > 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePct,
      isLessThan: { minor: 0.95, average: 0.85, major: 0.7 },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            <strong>Claw:</strong> {this._numClaws} &nbsp;
            <strong>Sweeping Claws:</strong> {this._numSweepingClaws} &nbsp;
            <strong>Gnaw:</strong> {this._numGnaws}
            {!this.usedGnaw && (
              <div style={{ color: 'orange' }}>
                You never used Gnaw — it provides crowd control in a pinch.
              </div>
            )}
          </>
        }
      >
        <div className="pad">
          <label>Risen Ghoul Uptime</label>
          <div className="value">{formatPercentage(this.uptimePct)}%</div>
        </div>
      </Statistic>
    );
  }
}

export default GhoulAnalyzer;
