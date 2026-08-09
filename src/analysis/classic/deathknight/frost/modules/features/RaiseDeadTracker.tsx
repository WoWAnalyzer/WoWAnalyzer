import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EventEmitter from 'parser/core/modules/EventEmitter';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ARMY_GHOUL_ID } from 'analysis/classic/deathknight/shared/ArmyOfTheDead';

const GHOUL_DURATION_MS = 60_000; // Risen Ghoul lasts 60 seconds

/**
 * Tracks Raise Dead (Risen Ghoul) casts for Frost DK.
 *
 * Frost also has Army of the Dead on its bar (see Abilities.ts), which
 * summons several temporary ghouls that are also SELECTED_PLAYER_PET
 * sources. We exclude those (identified via playerPets guid === ARMY_GHOUL_ID)
 * so an Army cast doesn't get misread as a Raise Dead resummon.
 *
 * Raise Dead does not reliably produce cast events in WCL logs (especially
 * when cast before the pull). Instead, we detect each ghoul summon via
 * SELECTED_PLAYER_PET damage events:
 *
 *   - First pet damage with no prior window → pre-pull summon (window at t=0)
 *   - Pet damage after the current window has expired (> 60s since window start)
 *     → new summon; window start = this event's timestamp
 *
 * Each detected window fabricates a real Cast event via EventEmitter (instead
 * of just calling SpellUsable.beginCooldown directly), so that SpellHistory
 * records it and CastEfficiency can count it like any other cast — this lets
 * us delegate possibleCasts/efficiency math to CastEfficiency (which already
 * accounts for the Evil Eye of Galakras cooldown reduction registered on this
 * spell's Abilities.ts entry) instead of recomputing cooldown math here.
 * SpellUsable has its own Cast-event listener that calls beginCooldown
 * automatically, so we don't need to call it ourselves. If a real cast event
 * was already processed (spell is on CD), we skip fabricating to avoid
 * double-counting.
 */
class RaiseDeadTracker extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    spellUsable: SpellUsable,
    eventEmitter: EventEmitter,
    castEfficiency: CastEfficiency,
  };
  protected spellUsable!: SpellUsable;
  protected eventEmitter!: EventEmitter;
  protected castEfficiency!: CastEfficiency;

  /** Timestamp of the start of each detected ghoul window (fight-relative ms). */
  private _windowStarts: number[] = [];

  /** Pet IDs belonging to Army of the Dead ghouls, to exclude from detection. */
  private _armyGhoulIds: Set<number>;

  constructor(options: Options) {
    super(options);
    this._armyGhoulIds = new Set(
      this.owner.playerPets.filter((pet) => pet.guid === ARMY_GHOUL_ID).map((pet) => pet.id),
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  private currentWindowExpiry(): number | null {
    if (this._windowStarts.length === 0) return null;
    return this._windowStarts[this._windowStarts.length - 1] + GHOUL_DURATION_MS;
  }

  private onPetDamage(event: DamageEvent) {
    if (this._armyGhoulIds.has(event.sourceID ?? -1)) {
      // Army of the Dead ghoul — not the permanent Raise Dead ghoul, ignore.
      return;
    }

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

    // Only fabricate a cast if SpellUsable hasn't already seen a real cast
    // event for this use (which would put the spell on cooldown).
    if (!this.spellUsable.isOnCooldown(SPELLS.RAISE_DEAD.id)) {
      const fabricatedCast: CastEvent = {
        type: EventType.Cast,
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
        __fabricated: true,
      };
      // Emits onto the real event stream — SpellHistory records it (so
      // CastEfficiency can count it) and SpellUsable's own Cast listener
      // starts the cooldown automatically.
      this.eventEmitter.fabricateEvent(fabricatedCast, event);
    }
  }

  get totalCasts(): number {
    return this._windowStarts.length;
  }

  private get _info() {
    return this.castEfficiency.getCastEfficiencyForSpell(SPELLS.RAISE_DEAD);
  }

  get possibleCasts(): number {
    const info = this._info;
    return Math.max(this.totalCasts, info ? Math.ceil(info.maxCasts) : this.totalCasts);
  }

  get castEfficiencyPct(): number {
    return (
      this._info?.efficiency ?? (this.possibleCasts > 0 ? this.totalCasts / this.possibleCasts : 1)
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.castEfficiencyPct,
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
