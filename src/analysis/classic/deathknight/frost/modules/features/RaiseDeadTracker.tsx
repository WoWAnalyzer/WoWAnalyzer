import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const RAISE_DEAD_CD_MS = 120_000; // 2-minute cooldown in MoP
const GHOUL_DURATION_MS = 60_000; // Risen Ghoul lasts 60 seconds

/**
 * Tracks Raise Dead (Risen Ghoul) casts for Frost DK.
 *
 * Raise Dead does not reliably produce cast events in WCL logs (especially
 * when cast before the pull). Instead, we detect each ghoul summon via
 * SELECTED_PLAYER_PET damage events:
 *
 *   - First pet damage with no prior window → pre-pull summon (window at t=0)
 *   - Pet damage after the current window has expired (> 60s since window start)
 *     → new summon; window start = this event's timestamp
 *
 * Each detected window calls SpellUsable.beginCooldown() so the
 * FoundationGuide CooldownBar renders the timeline correctly. If a real
 * cast event was already processed by SpellUsable (spell is on CD), we
 * skip the synthetic call to avoid double-counting.
 */
class RaiseDeadTracker extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  /** Timestamp of the start of each detected ghoul window (fight-relative ms). */
  private _windowStarts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  private currentWindowExpiry(): number | null {
    if (this._windowStarts.length === 0) return null;
    return this._windowStarts[this._windowStarts.length - 1] + GHOUL_DURATION_MS;
  }

  private onPetDamage(event: DamageEvent) {
    const ts = event.timestamp;
    const expiry = this.currentWindowExpiry();

    // Still within the current ghoul's lifetime — nothing to do.
    if (expiry !== null && ts <= expiry) {
      return;
    }

    // New ghoul window. For the pre-pull case use fight start; otherwise use
    // the current timestamp (closest we can get to the actual recast time).
    const windowStart = this._windowStarts.length === 0 ? this.owner.fight.start_time : ts;
    this._windowStarts.push(windowStart);

    // Only fabricate a cooldown start if SpellUsable hasn't already seen a
    // real cast event for this use (which would put the spell on cooldown).
    if (!this.spellUsable.isOnCooldown(SPELLS.RAISE_DEAD.id)) {
      const syntheticCast = {
        type: EventType.Cast as const,
        timestamp: windowStart,
        ability: {
          guid: SPELLS.RAISE_DEAD.id,
          name: SPELLS.RAISE_DEAD.name,
          type: 0,
          abilityIcon: SPELLS.RAISE_DEAD.icon,
        },
        sourceID: this.owner.playerId,
        sourceIsFriendly: true,
        targetIsFriendly: true,
        __fabricated: true as const,
      };
      this.spellUsable.beginCooldown(syntheticCast as unknown as DamageEvent, SPELLS.RAISE_DEAD.id);
    }
  }

  get totalCasts(): number {
    return this._windowStarts.length;
  }

  get possibleCasts(): number {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    // If the first window starts at fight start (pre-pull), onset = 0.
    // Otherwise onset = time of first cast.
    const onset =
      this._windowStarts.length > 0 ? this._windowStarts[0] - this.owner.fight.start_time : 0;
    return Math.max(this.totalCasts, Math.floor((fightMs - onset) / RAISE_DEAD_CD_MS) + 1);
  }

  get castEfficiency(): number {
    return this.possibleCasts > 0 ? this.totalCasts / this.possibleCasts : 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.castEfficiency,
      isLessThan: { minor: 1.0, average: 0.85, major: 0.7 },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const prepull = this._windowStarts[0] === this.owner.fight.start_time;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(60)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this.totalCasts} / ${this.possibleCasts} possible Raise Dead casts${prepull ? ' (pre-pull summon detected)' : ''}`}
      >
        <BoringSpellValueText spell={SPELLS.RAISE_DEAD}>
          {this.totalCasts} <small>/ {this.possibleCasts} possible</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RaiseDeadTracker;
