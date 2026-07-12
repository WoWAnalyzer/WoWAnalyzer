import SPELLS from 'common/SPELLS/classic/deathknight';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  ChangeHasteEvent,
  FightEndEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import {
  REFUNDABLE_RUNE_SPELLS,
  runeAbilityOutcome,
} from 'analysis/classic/deathknight/shared/RuneAbilityOutcomeNormalizer';

/** hitType values that mean a refundable rune ability didn't land. */
const REFUND_HIT_TYPES = [HIT_TYPES.MISS, HIT_TYPES.DODGE, HIT_TYPES.PARRY];

// ── WCL classResources rune type IDs for MoP ─────────────────────────────────
// Blood=20, Frost=21, Unholy=22, RP=6, any other with cost = Death rune slot.
const BLOOD_RUNE_TYPE = 20;
const FROST_RUNE_TYPE = 21;
const UNHOLY_RUNE_TYPE = 22;
const RUNIC_POWER_TYPE = 6;

// ── Known ability rune costs ──────────────────────────────────────────────────
// WCL always reports the REQUIRED slot type, even when a Death rune actually
// filled it (e.g. Howling Blast with zero Frost → WCL still says Frost cost=1).
// We cannot trust classResources for type. Instead, use this table of known
// costs and simulate spending ourselves with the correct death-rune priority.
//
// Only abilities that actually consume runes need entries here.
// RP spenders (Frost Strike, Death Coil…) and free abilities are omitted.
interface RuneCost {
  blood: number;
  frost: number;
  unholy: number;
}
const B1: RuneCost = { blood: 1, frost: 0, unholy: 0 };
const F1: RuneCost = { blood: 0, frost: 1, unholy: 0 };
const U1: RuneCost = { blood: 0, frost: 0, unholy: 1 };
const F1U1: RuneCost = { blood: 0, frost: 1, unholy: 1 };
const B1F1: RuneCost = { blood: 1, frost: 1, unholy: 0 };
const B1F1U1: RuneCost = { blood: 1, frost: 1, unholy: 1 };
function _buildCostTable(): Partial<Record<number, RuneCost>> {
  return {
    // ── Shared ──────────────────────────────────────────────────────────
    [SPELLS.ICY_TOUCH.id]: F1, // 1 Frost
    [SPELLS.PLAGUE_STRIKE.id]: U1, // 1 Unholy
    [SPELLS.DEATH_STRIKE.id]: F1U1, // 1 Frost + 1 Unholy
    [SPELLS.BLOOD_STRIKE.id]: B1, // 1 Blood
    [SPELLS.PESTILENCE.id]: B1, // 1 Blood
    [SPELLS.BLOOD_BOIL.id]: B1, // 1 Blood
    [SPELLS.DEATH_AND_DECAY.id]: U1, // 1 Unholy
    [SPELLS.CHAINS_OF_ICE.id]: F1, // 1 Frost
    [SPELLS.NECROTIC_STRIKE.id]: F1, // 1 Frost
    [SPELLS.ARMY_OF_THE_DEAD.id]: B1F1U1, // 1 Blood + 1 Frost + 1 Unholy
    // ── Frost ───────────────────────────────────────────────────────────
    [SPELLS.HOWLING_BLAST.id]: F1, // 1 Frost
    [SPELLS.PILLAR_OF_FROST.id]: F1, // 1 Frost
    [SPELLS.OBLITERATE.id]: F1U1, // 1 Frost + 1 Unholy
    [SPELLS.SOUL_REAPER_FROST.id]: F1, // 1 Frost
    // ── Unholy ──────────────────────────────────────────────────────────
    [SPELLS.FESTERING_STRIKE.id]: B1F1, // 1 Blood + 1 Frost
    // MoP changed Scourge Strike to cost only 1 Unholy rune (it cost 1 Frost +
    // 1 Unholy back in Cata) - confirmed on Wowhead's MoP Classic tooltip:
    // "Cost 1 Unholy Rune / -10 Runic Power". Coding this as F1U1 phantom-spent
    // an extra Frost rune on every cast of Unholy's main filler, starving the
    // whole rotation of Frost (and, transitively, Festering Strike/Blood too).
    [SPELLS.SCOURGE_STRIKE.id]: U1, // 1 Unholy
    [SPELLS.SOUL_REAPER_UNHOLY.id]: U1, // 1 Unholy
    // ── Blood (included for completeness - no BloodRuneTracker subclass
    // exists/is registered yet, but the cost table and Blood Rites
    // conversion below are ready for when one is added) ───────────────────
    [SPELLS.SOUL_REAPER_BLOOD.id]: B1, // 1 Blood
    [SPELLS.HEART_STRIKE.id]: B1, // 1 Blood - Blood spec's signature Blood-rune spender
  };
}
// ── Reaping ────────────────────────────────────────────────────────────────
// Unholy-only passive: spending a Blood or Frost rune on one of these five
// abilities converts the rune spent into a Death rune. Gated per-spec via
// `hasReaping` below - Frost and Blood DK do not have this.
const REAPING_SPELLS: number[] = [
  SPELLS.PESTILENCE.id,
  SPELLS.FESTERING_STRIKE.id,
  SPELLS.ICY_TOUCH.id,
  SPELLS.BLOOD_STRIKE.id,
  SPELLS.BLOOD_BOIL.id,
];

let _ABILITY_RUNE_COSTS: Partial<Record<number, RuneCost>> | null = null;
function getAbilityRuneCosts(): Partial<Record<number, RuneCost>> {
  if (!_ABILITY_RUNE_COSTS) _ABILITY_RUNE_COSTS = _buildCostTable();
  return _ABILITY_RUNE_COSTS;
}

// Base rune cooldown in milliseconds (before haste).
const BASE_RUNE_CD_MS = 10_000;

// ── Rune types ────────────────────────────────────────────────────────────────
export type RuneType = 'Blood' | 'Frost' | 'Unholy';

export interface RuneCounts {
  Blood: number;
  Frost: number;
  Unholy: number;
  Death: number;
}

// Rune slot indices by type
const BLOOD_INDICES = [0, 1] as const;
const FROST_INDICES = [2, 3] as const;
const UNHOLY_INDICES = [4, 5] as const;

interface MoPRune {
  type: RuneType;
  /** Rune is currently a Death rune (Festering Strike conversion, etc.) */
  isDeath: boolean;
  /** Rune was activated by Blood Tap — reverts to original type on spend */
  isBloodTapped: boolean;
  /** Permanently a Death rune (Blood of the North / Frost passive) */
  isPermanentDeath: boolean;
  /** Absolute timestamp when this rune is ready (0 = already available) */
  regenTime: number;
  /** Current CD duration in ms (= BASE_RUNE_CD_MS / hasteMultiplier) */
  runeCdMs: number;
  /** Index of the paired rune (0↔1, 2↔3, 4↔5) */
  linkedIndex: number;
  /**
   * True when this rune was spent while its sibling was ALSO already spent -
   * meaning its cooldown hasn't actually started yet (regenTime is a Infinity
   * sentinel, not a real countdown). Mirrors the real MoP rune engine: a
   * queued rune's CD isn't computed at spend time at all - it's computed fresh, using
   * whatever haste is active, the MOMENT the sibling's own cooldown actually
   * completes (see _resolvePendingRegens). Computing it eagerly at spend
   * time (the old approach) bakes in stale, lower haste from that earlier
   * moment even when Bloodlust/Unholy Frenzy/etc. speed things up later,
   * making every queued rune take longer than it really should - compounding
   * with every subsequent haste buff and resync.
   */
  pendingRegen: boolean;
}

// Default "no runes were resynced" set for _spendFromSlots's optional param.
const EMPTY_RUNE_SET: ReadonlySet<MoPRune> = new Set();

function makeRune(type: RuneType, linkedIndex: number): MoPRune {
  return {
    type,
    isDeath: false,
    isBloodTapped: false,
    isPermanentDeath: false,
    // -Infinity, not 0: `_isAvailable` checks `timestamp >= regenTime`, and
    // prepull casts (e.g. Army of the Dead) can have negative timestamps. A
    // regenTime of 0 would make every untouched rune look "on cooldown" the
    // instant any negative-timestamp event was processed, even though
    // nothing had actually spent it yet. -Infinity is available at any real
    // timestamp until the rune is genuinely spent for the first time.
    regenTime: -Infinity,
    runeCdMs: BASE_RUNE_CD_MS,
    linkedIndex,
    pendingRegen: false,
  };
}

/**
 * MoP Death Knight rune tracker.
 *
 * Models the 6-rune system (2 Blood, 2 Frost, 2 Unholy) with:
 *  - Linked-pair queue mechanic (second rune of a pair queues behind first)
 *  - Death rune conversion (Reaping, Blood of the North, Blood Tap, Plague Leech)
 *  - Haste-adjusted cooldowns (reads current haste from the Haste module)
 *  - Runic Corruption doubling regen speed while active
 *  - Resync from classResources data on each cast event to stay accurate
 *
 * If you're subclassing for Frost DK, just set `bloodIsDeath` to true (Blood of the North).
 * Same deal for Unholy DK with `hasReaping` - spending a Blood/Frost rune via
 * Pestilence, Festering Strike, Icy Touch, Blood Strike, or Blood Boil
 * converts it to a Death rune (see `REAPING_SPELLS`). This is Unholy-only.
 *
 * Exposes:
 *  - `runesAvailable(timestamp)` — number of runes ready right now (0–6)
 *  - `runesByType(timestamp)` — available counts per type (Blood/Frost/Unholy/Death)
 *  - `runesOnCooldown(timestamp)` — 6 - runesAvailable(timestamp)
 *  - `runes` — raw array for advanced consumers
 */
class MoPRuneTracker extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  /**
   * Override and return true for Frost DK — Blood of the North permanently
   * converts Blood runes to Death runes, they never go back.
   *
   * This MUST be a static field, not an instance field: the constructor
   * below reads it synchronously during `super()`, before a subclass's own
   * instance field initializers have run, so a plain instance field override
   * wouldn't be visible yet at that point (it'd still read this base
   * class's default, silently disabling the conversion). Static fields are
   * set on the class itself when its module evaluates, long before any
   * instance is constructed, so reading it via `this.constructor` resolves
   * to the actual runtime subclass's value immediately.
   */
  protected static readonly bloodIsDeath: boolean = false;

  /**
   * Override and return true for Unholy DK — Reaping converts the Blood
   * and/or Frost runes spent on Pestilence, Festering Strike, Icy Touch,
   * Blood Strike, or Blood Boil into Death runes. Frost and Blood DK do not
   * have this passive.
   */
  protected readonly hasReaping: boolean = false;

  /**
   * Override and return true for Blood DK — Blood Rites converts the Frost
   * and Unholy runes spent on Death Strike into Death runes. This is Blood's own analog of Unholy's Reaping -
   * different trigger spell, different slots, and mutually exclusive since
   * only Unholy has Reaping and only Blood has Blood Rites - but the same
   * "keep whatever this spec's signature ability spends as Death" shape.
   * No BloodRuneTracker subclass exists/is registered yet; this flag is
   * groundwork for when one is added.
   */
  protected readonly hasBloodRites: boolean = false;

  /**
   * Which spec this tracker instance belongs to. Drives the Blood
   * Tap / Plague Leech activation priority (`_selectRuneForActivation` /
   * `_activatePlagueLeechRunes`), which differs per spec.
   * Defaults to 'Frost', matching this tracker's
   * original (pre-fix) fixed Unholy->Frost->Blood order, since Frost is the
   * only spec that order happened to already be correct for.
   */
  protected readonly spec: 'Blood' | 'Frost' | 'Unholy' = 'Frost';

  readonly runes: MoPRune[] = [
    makeRune('Blood', 1),
    makeRune('Blood', 0),
    makeRune('Frost', 3),
    makeRune('Frost', 2),
    makeRune('Unholy', 5),
    makeRune('Unholy', 4),
  ];

  /** Current haste speed factor: 1.0 = no haste. >1 = faster regen (shorter CD). */
  private get _hasteMultiplier(): number {
    return 1 + this.haste.current;
  }
  /** Whether Runic Corruption is currently active (doubles regen speed). */
  private get _runicCorruptionActive(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.RUNIC_CORRUPTION.id);
  }

  // ── Time-at-rune-count tracking ───────────────────────────────────────────
  /** Accumulated ms spent at each per-type available count (index 0–2). */
  readonly bloodReadySum: number[] = [0, 0, 0];
  readonly frostReadySum: number[] = [0, 0, 0];
  readonly unholyReadySum: number[] = [0, 0, 0];
  /** Per-slot-pair rune history: natural = runes in their original type, death = converted Death runes. */
  readonly bloodHistory: Array<{ timestamp: number; natural: number; death: number }> = [];
  readonly frostHistory: Array<{ timestamp: number; natural: number; death: number }> = [];
  readonly unholyHistory: Array<{ timestamp: number; natural: number; death: number }> = [];
  /** Timeline of rune-spending and RP-spending casts, for the cast overlay chart. */
  readonly castHistory: Array<{
    timestamp: number;
    ability: string;
    slot: string;
    halfHeight?: boolean;
  }> = [];

  /**
   * Spell IDs that should show up as half-height bars in the cast timeline —
   * basically the RP spenders. Each spec overrides this with its own list.
   */
  protected get rpSpendersToTrack(): number[] {
    return [];
  }
  private _lastTrackTimestamp = 0;
  private _lastTrackedTypeCounts: { Blood: number; Frost: number; Unholy: number } = {
    Blood: 2,
    Frost: 2,
    Unholy: 2,
  };

  constructor(options: Options) {
    super(options);

    this._lastTrackTimestamp = options.owner.fight.start_time;

    // Apply Blood of the North for Frost DK BEFORE the initial snapshot so
    // t=0 never shows natural blood runes.
    if ((this.constructor as typeof MoPRuneTracker).bloodIsDeath) {
      for (const i of BLOOD_INDICES) {
        this.runes[i].isDeath = true;
        this.runes[i].isPermanentDeath = true;
      }
    }

    this._pushTypeSnapshot(options.owner.fight.start_time);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.RUNIC_CORRUPTION),
      this.onRunicCorruptionApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RUNIC_CORRUPTION),
      this.onRunicCorruptionRemove,
    );
    // Any change to general haste (Bloodlust, racials like Berserking, trinket
    // procs, Lifeblood, gear swaps, etc.) needs to rescale in-progress rune
    // regens too - not just Runic Corruption. Short buffs (Berserking is 10s,
    // Bloodlust 40s) commonly expire partway through a rune's cooldown, so a
    // regen time computed once at spend-time and never revisited will be
    // wrong for any rune that was spent under temporary haste that later
    // drops off mid-cooldown.
    this.addEventListener(Events.ChangeHaste, this.onHasteChange);
    this.addEventListener(Events.fightend, this.onFightEnd);
    // Runic Empowerment (talent, 51459/81229): 45% chance on landed Death
    // Coil/Frost Strike/Rune Strike to instantly finish regenerating one
    // on-cooldown rune. WCL surfaces this as a resourcechange event for the
    // rune resource type - see onRunicEmpowerment.
    this.addEventListener(
      Events.resourcechange.to(SELECTED_PLAYER).spell(SPELLS.RUNIC_EMPOWERMENT),
      this.onRunicEmpowerment,
    );
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  runesAvailable(timestamp: number): number {
    return this.runes.filter((r) => this._isAvailable(r, timestamp)).length;
  }

  runesOnCooldown(timestamp: number): number {
    return 6 - this.runesAvailable(timestamp);
  }

  runesByType(timestamp: number): RuneCounts {
    const counts: RuneCounts = { Blood: 0, Frost: 0, Unholy: 0, Death: 0 };
    for (const r of this.runes) {
      if (!this._isAvailable(r, timestamp)) {
        continue;
      }
      if (r.isDeath || r.isBloodTapped) {
        counts.Death += 1;
      } else {
        counts[r.type] += 1;
      }
    }
    return counts;
  }

  // ── Haste helpers ──────────────────────────────────────────────────────────

  private get _effectiveHasteMultiplier(): number {
    // Runic Corruption doubles rune regen speed on top of regular haste.
    return this._hasteMultiplier * (this._runicCorruptionActive ? 2 : 1);
  }

  private get _currentRuneCdMs(): number {
    return BASE_RUNE_CD_MS / this._effectiveHasteMultiplier;
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const ts = event.timestamp;

    // Resolve any rune whose sibling has genuinely finished regenerating
    // since the last event, BEFORE sampling/spending anything at this
    // timestamp - otherwise a rune that's actually available by now would
    // still read as an Infinity-sentinel "pending" rune.
    this._resolvePendingRegens(ts);

    // Sample per-type rune availability BEFORE spending (pre-cast state).
    const preTypeCounts = this._sampleSlotAvailability(ts);
    const dt = ts - this._lastTrackTimestamp;
    this.bloodReadySum[this._lastTrackedTypeCounts.Blood] += dt;
    this.frostReadySum[this._lastTrackedTypeCounts.Frost] += dt;
    this.unholyReadySum[this._lastTrackedTypeCounts.Unholy] += dt;
    this._lastTrackTimestamp = ts;
    this._lastTrackedTypeCounts = preTypeCounts;

    // Record pre-cast rune snapshot for the time-series charts
    this._pushTypeSnapshot(ts);

    this._recordRuneCastTimeline(event, spellId, ts);
    this._recordRPSpendTimeline(event, spellId, ts);

    // Spend runes: uses our known cost table when available, otherwise falls
    // back to classResources. Always called - some known-cost abilities (e.g.
    // Army of the Dead) have no classResources on the event at all.
    this._resyncFromClassResources(event);

    // Special ability handling
    if (spellId === SPELLS.BLOOD_TAP.id) {
      this._activateBloodTapRune(ts);
    } else if (spellId === SPELLS.PLAGUE_LEECH.id) {
      this._activatePlagueLeechRunes(ts);
    } else if (spellId === SPELLS.EMPOWER_RUNE_WEAPON.id) {
      this._empowerRuneWeapon(ts);
    }

    // Record post-cast rune snapshot (after all spending / activations)
    this._pushTypeSnapshot(ts);
  }

  private onFightEnd(event: FightEndEvent) {
    this._resolvePendingRegens(event.timestamp);
    const dt = event.timestamp - this._lastTrackTimestamp;
    this.bloodReadySum[this._lastTrackedTypeCounts.Blood] += dt;
    this.frostReadySum[this._lastTrackedTypeCounts.Frost] += dt;
    this.unholyReadySum[this._lastTrackedTypeCounts.Unholy] += dt;
    this._pushTypeSnapshot(event.timestamp);
  }

  /** Record cast in timeline if it costs runes. */
  private _recordRuneCastTimeline(event: CastEvent, spellId: number, ts: number) {
    const cost = getAbilityRuneCosts()[spellId];
    if (!cost || cost.blood + cost.frost + cost.unholy === 0) {
      return;
    }
    const b = cost.blood,
      f = cost.frost,
      u = cost.unholy;
    const slot =
      b > 0 && f === 0 && u === 0
        ? 'Blood'
        : f > 0 && b === 0 && u === 0
          ? 'Frost'
          : u > 0 && b === 0 && f === 0
            ? 'Unholy'
            : spellId === SPELLS.OBLITERATE.id
              ? 'Obliterate'
              : 'Mixed';
    this.castHistory.push({ timestamp: ts, ability: event.ability.name, slot });
  }

  /** Record RP-spending abilities as half-height bars in the cast timeline. */
  private _recordRPSpendTimeline(event: CastEvent, spellId: number, ts: number) {
    if (!this.rpSpendersToTrack.includes(spellId)) {
      return;
    }
    this.castHistory.push({
      timestamp: ts,
      ability: event.ability.name,
      slot: 'RPSpend',
      halfHeight: true,
    });
  }

  /** Available-rune count per type at `timestamp`, same source the Overview graphs read. */
  private _sampleSlotAvailability(timestamp: number): {
    Blood: number;
    Frost: number;
    Unholy: number;
  } {
    return {
      Blood: BLOOD_INDICES.filter((i) => this._isAvailable(this.runes[i], timestamp)).length,
      Frost: FROST_INDICES.filter((i) => this._isAvailable(this.runes[i], timestamp)).length,
      Unholy: UNHOLY_INDICES.filter((i) => this._isAvailable(this.runes[i], timestamp)).length,
    };
  }

  private onRunicCorruptionApply(_event: ApplyBuffEvent) {
    const ts = _event.timestamp;
    // _runicCorruptionActive is a hasBuff()-backed getter, so by the time this
    // handler runs the buff is already applied — we can't sample it for
    // "before" and "after". Compute both sides directly instead.
    const oldMult = this._hasteMultiplier; // corruption not yet active
    const newMult = this._hasteMultiplier * 2; // corruption now active
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
    // Resolve pending runes AFTER rescaling, using the just-applied new
    // multiplier - both so a rune that's freshly resolved here never gets
    // reinterpreted by the same rescale pass (pending runes are skipped by
    // it - see _adjustRuneRegenTimes), and because "now" is the first moment
    // the new multiplier is genuinely in effect.
    this._resolvePendingRegens(ts);
  }

  private onRunicCorruptionRemove(_event: RemoveBuffEvent) {
    const ts = _event.timestamp;
    // Same reasoning as onRunicCorruptionApply — compute old/new directly
    // rather than sampling the live getter.
    const oldMult = this._hasteMultiplier * 2; // corruption was active
    const newMult = this._hasteMultiplier; // corruption now inactive
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
    this._resolvePendingRegens(ts);
  }

  /**
   * Fires on ANY haste percentage change (Bloodlust, racials, trinket procs,
   * Lifeblood, gear, etc.) - the Haste module fabricates this for every
   * source, not just Runic Corruption. Rescales in-progress rune regens the
   * same way onRunicCorruptionApply/Remove do, using the event's own
   * before/after haste values rather than re-deriving them, since `haste.current`
   * has already moved on to the new value by the time this handler runs.
   */
  private onHasteChange(event: ChangeHasteEvent) {
    // The very first ChangeHaste event (fired from the Haste module's own
    // constructor) has no real "old" value - it's the initial baseline, not
    // an actual change, so there's nothing to rescale yet.
    if (event.oldHaste === null || event.oldHaste === undefined) {
      return;
    }
    const ts = event.timestamp;
    const rcMult = this._runicCorruptionActive ? 2 : 1;
    const oldMult = (1 + event.oldHaste) * rcMult;
    const newMult = (1 + event.newHaste) * rcMult;
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
    // See onRunicCorruptionApply - resolve pending runes after rescaling, at
    // the new live multiplier.
    this._resolvePendingRegens(ts);
  }

  /**
   * Runic Empowerment: instantly finishes regenerating one currently
   * on-cooldown rune, without touching its type/Death status (unlike Blood
   * Tap/Plague Leech, which explicitly convert their target to Death - see
   * `_bloodTapActivate`). The real game picks a uniformly random spent rune;
   * WCL's log doesn't unambiguously tell us which slot
   * the game actually picked, so this mirrors that randomness as closely as
   * we can: prefer a rune whose type matches the event's own
   * `resourceChangeType` (when WCL does report which rune type got the
   * empowerment), otherwise fall back to a deterministic pseudo-random pick
   * (seeded from the timestamp, so re-analyzing the same log is
   * reproducible) among every rune currently on cooldown.
   */
  private onRunicEmpowerment(event: ResourceChangeEvent) {
    const ts = event.timestamp;
    this._resolvePendingRegens(ts);

    const onCooldown = this.runes.filter((r) => !this._isAvailable(r, ts));
    if (onCooldown.length === 0) {
      return;
    }

    const typeByResourceType: Partial<Record<number, RuneType>> = {
      [BLOOD_RUNE_TYPE]: 'Blood',
      [FROST_RUNE_TYPE]: 'Frost',
      [UNHOLY_RUNE_TYPE]: 'Unholy',
    };
    const wantedType = typeByResourceType[event.resourceChangeType];
    const candidates = wantedType
      ? onCooldown.filter((r) => r.type === wantedType && !this._isDeathRune(r))
      : [];
    const pool = candidates.length > 0 ? candidates : onCooldown;

    // Simple deterministic LCG seeded by the timestamp - avoids Math.random()
    // so the same log always resolves the same way. Double-mod to normalize
    // away JS's sign-preserving `%` (prepull events, e.g. from Army of the
    // Dead, can have a negative timestamp, which would otherwise yield a
    // negative array index below).
    const rawMod = (((ts * 9301 + 49297) % 233280) + 233280) % 233280;
    const pseudoRandom = rawMod / 233280;
    const target = pool[Math.floor(pseudoRandom * pool.length) % pool.length];

    target.regenTime = ts;
    target.pendingRegen = false;
  }

  // ── Rune state helpers ─────────────────────────────────────────────────────

  private _isAvailable(rune: MoPRune, timestamp: number): boolean {
    return timestamp >= rune.regenTime;
  }

  /**
   * Activate any rune whose sibling has now genuinely finished regenerating,
   * computing its cooldown FRESH from the CURRENT live haste - mirroring the
   * real MoP rune engine, which doesn't
   * decide a queued rune's completion time until the moment it actually
   * starts counting down, using whatever haste is active right then. Must be
   * called at the top of every timestamp-advancing entry point (a cast, a
   * haste change, fight end) BEFORE any availability check, so a rune that
   * was "pending" doesn't keep using a stale, pre-computed completion time
   * once its sibling has freed up.
   */
  private _resolvePendingRegens(timestamp: number) {
    for (const rune of this.runes) {
      if (!rune.pendingRegen) {
        continue;
      }
      const linked = this.runes[rune.linkedIndex];
      if (this._isAvailable(linked, timestamp)) {
        const cdMs = this._currentRuneCdMs;
        rune.regenTime = linked.regenTime + cdMs;
        rune.runeCdMs = cdMs;
        rune.pendingRegen = false;
      }
    }
  }

  private _isDeathRune(rune: MoPRune): boolean {
    return rune.isDeath || rune.isBloodTapped;
  }

  /**
   * Spend `count` runes from the given slot indices, preferring natural runes
   * over Death runes. Returns the runes actually spent.
   *
   * Festering Strike edge case (Unholy only, convert=true): if a Blood-Tapped
   * rune is spent, the game converts the first natural rune in the same slot to
   * Death instead — because the BT rune reverts to its natural type on spend
   * and wouldn't count as a "converted" rune.
   */
  private _spendFromSlots(
    count: number,
    indices: readonly number[],
    timestamp: number,
    convert: boolean,
    resynced: ReadonlySet<MoPRune> = EMPTY_RUNE_SET,
  ): MoPRune[] {
    if (count === 0) {
      return [];
    }

    // Available runes in this slot group, natural first then Death
    const available = indices
      .map((i) => this.runes[i])
      .filter((r) => this._isAvailable(r, timestamp));

    const natural = available.filter((r) => !this._isDeathRune(r));
    const deaths = available.filter((r) => this._isDeathRune(r));
    const toSpend = [...natural, ...deaths].slice(0, count);

    const slotRunes = indices.map((i) => this.runes[i]);
    for (const rune of toSpend) {
      const wasBloodTapped = rune.isBloodTapped;
      this._spend(rune, timestamp, convert, resynced.has(rune));

      // Python RuneTracker ~line 610: spending a Blood-Tapped rune via
      // Festering Strike — find the first un-converted natural rune in this
      // slot and convert it to Death instead.
      if (convert && wasBloodTapped) {
        const naturalTarget = slotRunes.find((r) => !r.isDeath && !r.isBloodTapped);
        if (naturalTarget) {
          naturalTarget.isDeath = true;
        }
      }
    }

    return toSpend;
  }

  private _spend(rune: MoPRune, timestamp: number, convert: boolean, skipLinkedQueue = false) {
    // Resync this rune's stored CD to the LIVE haste multiplier before using
    // it. `rune.runeCdMs` is normally kept current by onHasteChange's
    // rescale whenever a real haste change fires mid-fight, but it starts at
    // makeRune()'s flat, unhasted BASE_RUNE_CD_MS, and the very first
    // ChangeHaste event (the initial baseline, oldHaste === null) is
    // deliberately ignored by onHasteChange - it also fires from inside
    // Haste's own constructor, before this tracker (built after its Haste
    // dependency) has even registered a listener for it. So without this,
    // any rune spent before the first REAL haste change in the fight - most
    // commonly Army of the Dead's prepull cast - would use the wrong,
    // too-slow unhasted CD, and every later rescale would compound from that
    // wrong starting point. Reading the live getter here (rather than
    // seeding it once in the constructor) sidesteps needing `haste` to be
    // wired up at construction time at all - by the time a real cast is
    // being spent, we're inside an event handler and `this.haste` is valid.
    rune.runeCdMs = this._currentRuneCdMs;

    const linked = this.runes[rune.linkedIndex];
    const linkedReady = skipLinkedQueue || this._isAvailable(linked, timestamp);

    // skipLinkedQueue is set for runes _resyncSlot just forced available: resync
    // already shifted this rune's linked sibling backward to preserve the pair's
    // stagger (see _resyncSlot), so re-deriving "queue behind linked" here from the
    // sibling's post-shift regenTime would apply that same penalty a second time -
    // pushing the just-resynced rune out to a full 2x rune CD instead of 1x, which
    // compounds every time a cast needs to borrow a rune and is why the tracker
    // could show 0 runes available for extended stretches even with light rune use.
    if (linkedReady) {
      // Sibling is free (or resync already paid the queue cost) - this rune
      // starts a real, immediate countdown at the CURRENT live haste.
      rune.regenTime = Math.max(timestamp, rune.regenTime) + rune.runeCdMs;
      rune.pendingRegen = false;
    } else {
      // Sibling is still on cooldown - only one rune per pair can regen at a
      // time, so this one can't start counting down yet. The real game
      // does NOT compute this rune's completion time now - it
      // defers it (see _resolvePendingRegens) until the sibling's own
      // cooldown actually elapses, using whatever haste is live AT THAT
      // MOMENT. Computing it eagerly here (the old approach) baked in
      // whatever haste happened to be active at THIS spend, systematically
      // overestimating the wait once later haste buffs (Bloodlust, Unholy
      // Frenzy, trinkets, etc.) sped things up - and the error compounded
      // with every subsequent haste change and resync.
      rune.pendingRegen = true;
      rune.regenTime = Infinity;
    }

    // Handle Death rune state changes on spend
    if (rune.isBloodTapped) {
      // Blood Tap runes revert to natural type on spend
      rune.isBloodTapped = false;
      rune.isDeath = false;
    } else if (rune.isDeath && !rune.isPermanentDeath) {
      // Normally-converted Death runes revert unless convert is requested
      if (!convert) {
        rune.isDeath = false;
      }
    } else if (!rune.isDeath && convert && !rune.isPermanentDeath) {
      // Convert natural rune to Death on spend (e.g. Festering Strike)
      rune.isDeath = true;
    }
  }

  /**
   * Spend runes for a cast, using our known cost table when we have one, or
   * falling back to parsing classResources for abilities we don't recognize.
   * Resyncs any runes that are off-schedule.
   */
  private _resyncFromClassResources(event: CastEvent) {
    const spellId = event.ability.guid;

    // spellId 1 (and negative guids) are WCL's synthetic IDs for plain melee
    // swings/extra attacks, not real abilities - they never cost runes. WCL
    // still attaches a (non-empty but cost=0-in-practice) classResources
    // array to these events though, which would otherwise slip past the
    // guard below (knownCost is undefined, but classResources is truthy) and
    // get parsed by the "unknown real ability" fallback path meant for
    // actual spells we haven't cost-tabled yet. Any stray/misreported
    // classResources entry on a melee event would silently spend a rune a
    // basic attack never should have touched, so bail out unconditionally
    // before that path ever runs.
    if (spellId === 1 || spellId < 0) {
      return;
    }

    const knownCost = getAbilityRuneCosts()[spellId];

    // Abilities in our known-cost table (e.g. Army of the Dead) don't need
    // classResources at all - WCL doesn't even report classResources on some
    // of them (it's not an RP spend, so there's nothing for WCL to attach).
    // Only the fallback path below actually needs event.classResources.
    if (!knownCost && !event.classResources) {
      return;
    }

    // Refundable abilities (Icy Touch, Plague Strike, Obliterate, Festering
    // Strike, etc. - see RuneAbilityOutcomeNormalizer) that miss, get dodged,
    // or get parried never actually spend their rune(s) at all in the
    // real game - only ~10% Runic Power is affected, which this tracker
    // doesn't model. RuneAbilityOutcomeNormalizer links each cast to the
    // damage event it produced (if any) BEFORE analyzers run, so we can read
    // that outcome synchronously here instead of buffering the spend
    // decision.
    if (REFUNDABLE_RUNE_SPELLS.includes(spellId)) {
      const outcome = runeAbilityOutcome.first(event);
      if (outcome && REFUND_HIT_TYPES.includes(outcome.hitType)) {
        return;
      }
    }

    const ts = event.timestamp;
    const isReapingSpell = this.hasReaping && REAPING_SPELLS.includes(spellId);

    let bloodCost = 0;
    let frostCost = 0;
    let unholyCost = 0;
    let deathCost = 0;

    if (knownCost) {
      // Use our known cost table. WCL always reports the REQUIRED slot type even
      // when a Death rune actually filled it (e.g. Howling Blast with no Frost
      // available → WCL says "Frost cost=1" but a Blood-death rune was really
      // consumed). Trusting classResources type causes Blood runes to never appear
      // spent. Our own table gives accurate typed costs; the death-sub priority
      // chain below then picks the correct rune to actually consume.
      bloodCost = knownCost.blood;
      frostCost = knownCost.frost;
      unholyCost = knownCost.unholy;
    } else if (event.classResources) {
      // Unknown ability — fall back to classResources type parsing.
      for (const resource of event.classResources) {
        const cost = (resource as { cost?: number }).cost ?? 0;
        if (cost <= 0 || resource.type === RUNIC_POWER_TYPE) {
          continue;
        }
        switch (resource.type) {
          case BLOOD_RUNE_TYPE:
            bloodCost += cost;
            break;
          case FROST_RUNE_TYPE:
            frostCost += cost;
            break;
          case UNHOLY_RUNE_TYPE:
            unholyCost += cost;
            break;
          default:
            deathCost += cost;
            break;
        }
      }
    }

    const totalCost = bloodCost + frostCost + unholyCost + deathCost;
    if (totalCost === 0) {
      return;
    }

    // Reaping conversion differs by spell:
    //  - Blood-cost spells (Pestilence, Blood Strike, Blood Boil) + Festering
    //    Strike convert whatever's spent in the Blood OR Frost pairs to Death.
    //  - Icy Touch (Unholy spec only) converts whatever's spent in the Frost
    //    OR Unholy pairs to Death instead.
    // This must apply to BOTH the primary typed spend (_spendFromSlots below)
    // AND any external death-rune substitute that lands in that slot
    // (spendDeathSubs) - previously only the primary spend converted, so e.g.
    // a Frost-slot Death rune borrowed to cover Festering Strike's Blood
    // deficit got reverted to natural Frost instead of staying Death.
    const isIcyTouch = spellId === SPELLS.ICY_TOUCH.id;
    // Blood Rites (Blood spec only, see `hasBloodRites`): Death Strike's
    // Frost + Unholy cost converts whatever's spent in those pairs to Death,
    // the same "convert on spend" shape as Reaping but a different trigger
    // spell and slot pair.
    const isBloodRitesDeathStrike = this.hasBloodRites && spellId === SPELLS.DEATH_STRIKE.id;
    const convertBloodSlot = isReapingSpell && !isIcyTouch;
    const convertFrostSlot = isReapingSpell || isBloodRitesDeathStrike;
    const convertUnholySlot = (isReapingSpell && isIcyTouch) || isBloodRitesDeathStrike;
    const convertForSlot = (slotIndices: readonly [number, number]): boolean => {
      if (slotIndices === BLOOD_INDICES) {
        return convertBloodSlot;
      }
      if (slotIndices === FROST_INDICES) {
        return convertFrostSlot;
      }
      return convertUnholySlot;
    };

    // Before resyncing typed slots, check for deficits and fill them with death
    // rune substitutes first. This matches the game mechanic: when natural runes
    // of a required type are depleted, the game consumes a death rune from another
    // slot (priority: Blood → Frost → Unholy, same-slot deaths already counted in
    // `avail`). WCL reports the REQUIRED slot type even when a death rune filled
    // in, so without this step blood-death runes (e.g. Blood of the North) would
    // never show as consumed in the simulation.
    const bloodAvail = BLOOD_INDICES.filter((i) => this._isAvailable(this.runes[i], ts)).length;
    const frostAvail = FROST_INDICES.filter((i) => this._isAvailable(this.runes[i], ts)).length;
    const unholyAvail = UNHOLY_INDICES.filter((i) => this._isAvailable(this.runes[i], ts)).length;

    const bloodDeficit = Math.max(0, bloodCost - bloodAvail);
    const frostDeficit = Math.max(0, frostCost - frostAvail);
    const unholyDeficit = Math.max(0, unholyCost - unholyAvail);

    // Spend up to `needed` external death rune subs, skipping the primary slot.
    const spendDeathSubs = (needed: number, skipStart: number): number => {
      if (needed <= 0) {
        return 0;
      }
      let spent = 0;
      for (const slotIndices of [BLOOD_INDICES, FROST_INDICES, UNHOLY_INDICES] as const) {
        if (spent >= needed) {
          break;
        }
        if (slotIndices[0] === skipStart) {
          continue; // skip same-slot (already in avail)
        }
        const deaths = slotIndices
          .map((i) => this.runes[i])
          .filter((r) => this._isAvailable(r, ts) && this._isDeathRune(r));
        for (const rune of deaths) {
          if (spent >= needed) {
            break;
          }
          this._spend(rune, ts, convertForSlot(slotIndices));
          spent++;
        }
      }
      return spent;
    };

    const bloodDeathSubs = spendDeathSubs(bloodDeficit, BLOOD_INDICES[0]);
    const frostDeathSubs = spendDeathSubs(frostDeficit, FROST_INDICES[0]);
    const unholyDeathSubs = spendDeathSubs(unholyDeficit, UNHOLY_INDICES[0]);

    // Resync and spend only what death subs couldn't cover. _resyncSlot returns
    // exactly which runes it forced available, so _spendFromSlots can skip
    // re-applying the linked-queue penalty to them (see _spend's skipLinkedQueue).
    const bloodResynced = this._resyncSlot(BLOOD_INDICES, bloodCost - bloodDeathSubs, ts);
    const frostResynced = this._resyncSlot(FROST_INDICES, frostCost - frostDeathSubs, ts);
    const unholyResynced = this._resyncSlot(UNHOLY_INDICES, unholyCost - unholyDeathSubs, ts);

    this._spendFromSlots(
      bloodCost - bloodDeathSubs,
      BLOOD_INDICES,
      ts,
      convertBloodSlot,
      bloodResynced,
    );
    this._spendFromSlots(
      frostCost - frostDeathSubs,
      FROST_INDICES,
      ts,
      convertFrostSlot,
      frostResynced,
    );
    this._spendFromSlots(
      unholyCost - unholyDeathSubs,
      UNHOLY_INDICES,
      ts,
      convertUnholySlot,
      unholyResynced,
    );

    // Death rune substitutions (classResources type unrecognized = Death rune
    // filling a typed slot, e.g. a Blood(=Death) rune via Blood of the North
    // filling the Frost slot of Obliterate for Frost DK).
    if (deathCost > 0) {
      // Resync: ensure enough Death runes are available, picking soonest-ready first.
      // Mirrors Python's _resync_runes(self.current_death_runes, runes_used["Death"]).
      const allDeathOnCD = this.runes
        .filter((r) => this._isDeathRune(r) && !this._isAvailable(r, ts))
        .sort((a, b) => a.regenTime - b.regenTime); // ascending = soonest first
      const availableDeaths = this.runes.filter(
        (r) => this._isDeathRune(r) && this._isAvailable(r, ts),
      ).length;
      const deathDeficit = deathCost - availableDeaths;
      const deathResynced = new Set<MoPRune>();
      for (let i = 0; i < Math.min(deathDeficit, allDeathOnCD.length); i++) {
        const r = allDeathOnCD[i];
        if (r.pendingRegen) {
          // Same reasoning as _resyncSlot: no real countdown exists yet to
          // shift onto the sibling - just force it available and clear the sentinel.
          r.pendingRegen = false;
          r.regenTime = ts;
          deathResynced.add(r);
          continue;
        }
        const diff = r.regenTime - ts;
        // Same sibling-shift as _resyncSlot: preserve the pair's relative stagger
        // instead of leaving the sibling's original (now-stale) CD in place, which
        // would make _spend's linked-queue check push this rune out even further.
        const linked = this.runes[r.linkedIndex];
        if (!this._isAvailable(linked, ts)) {
          linked.regenTime = Math.max(ts, linked.regenTime - diff);
        }
        r.regenTime = ts;
        deathResynced.add(r);
      }

      // Spend: priority Blood slots → Frost slots → Unholy slots
      let deathToSpend = deathCost;
      for (const indices of [BLOOD_INDICES, FROST_INDICES, UNHOLY_INDICES]) {
        if (deathToSpend <= 0) {
          break;
        }
        const deathsHere = indices
          .map((i) => this.runes[i])
          .filter((r) => this._isAvailable(r, ts) && this._isDeathRune(r));
        for (const rune of deathsHere) {
          if (deathToSpend <= 0) {
            break;
          }
          this._spend(rune, ts, false, deathResynced.has(rune));
          deathToSpend -= 1;
        }
      }
    }
  }

  /**
   * Ensure `needed` runes at `indices` are available at `timestamp`, resyncing
   * the deficit. Picks runes with the SHORTEST remaining cooldown first — those
   * are the ones closest to ticking over naturally.
   * Mirrors Python RuneTracker._resync_runes (sorted ascending by regen_time).
   */
  private _resyncSlot(
    indices: readonly number[],
    needed: number,
    timestamp: number,
  ): ReadonlySet<MoPRune> {
    const resynced = new Set<MoPRune>();
    const available = indices.filter((i) => this._isAvailable(this.runes[i], timestamp)).length;
    const deficit = needed - available;
    if (deficit <= 0) {
      return resynced;
    }
    // Ascending = soonest-ready first (shortest remaining CD = closest to natural tick)
    const onCD = indices
      .map((i) => this.runes[i])
      .filter((r) => !this._isAvailable(r, timestamp))
      .sort((a, b) => a.regenTime - b.regenTime);
    for (let i = 0; i < Math.min(deficit, onCD.length); i++) {
      const r = onCD[i];
      if (r.pendingRegen) {
        // This rune never had a real countdown to begin with - its sibling
        // was still on cooldown when it was spent, so it's just been sitting
        // as an Infinity sentinel (see MoPRune.pendingRegen). There's no real
        // "remaining CD" to shift onto the sibling; just force it available
        // now and clear the sentinel so _resolvePendingRegens doesn't later
        // try to recompute a regenTime we just overwrote.
        r.pendingRegen = false;
        r.regenTime = timestamp;
        resynced.add(r);
        continue;
      }
      const diff = r.regenTime - timestamp;
      // Mirrors Python refresh(): when a rune is made available early,
      // reduce the linked rune's remaining CD by the same amount so the
      // pair stays correctly staggered (linked rune was queued behind this one).
      const linked = this.runes[r.linkedIndex];
      if (!this._isAvailable(linked, timestamp)) {
        linked.regenTime = Math.max(timestamp, linked.regenTime - diff);
      }
      r.regenTime = timestamp;
      // Caller must spend this rune with skipLinkedQueue=true - we've already
      // paid the "queue behind linked" cost above by shifting the sibling.
      // Re-deriving it again from _spend()'s own linked-check would double it.
      resynced.add(r);
    }
    return resynced;
  }

  // ── Rune-pair group helpers (Blood Tap / Plague Leech priority) ───────────

  /**
   * Is every rune in `indices` currently unavailable (i.e. this whole pair is
   * "depleted"), and not already claimed by an earlier pick this cast
   * (`excluded`)?
   */
  private _pairDepleted(
    indices: readonly [number, number],
    timestamp: number,
    excluded: number[],
  ): boolean {
    if (excluded.includes(indices[0]) || excluded.includes(indices[1])) {
      return false;
    }
    return indices.every((i) => !this._isAvailable(this.runes[i], timestamp));
  }

  /**
   * Within a depleted pair, the rune furthest from actually coming back -
   * the one with the higher `regenTime` (a still-`pendingRegen`/Infinity
   * sibling always wins, since it hasn't even started its countdown yet).
   */
  private _laterRuneInPair(indices: readonly [number, number]): MoPRune {
    const [a, b] = [this.runes[indices[0]], this.runes[indices[1]]];
    return a.regenTime >= b.regenTime ? a : b;
  }

  /**
   * Among the given pair-groups, find every one that's fully depleted and
   * return the target rune from whichever pair's `_laterRuneInPair` regenTime
   * is highest (i.e. the pair that would otherwise take longest to recover
   * naturally), rather than draining one candidate pair before ever considering the
   * other.
   */
  private _bestDepletedPair(
    groups: ReadonlyArray<readonly [number, number]>,
    timestamp: number,
    excluded: number[],
  ): MoPRune | null {
    let best: MoPRune | null = null;
    for (const group of groups) {
      if (!this._pairDepleted(group, timestamp, excluded)) {
        continue;
      }
      const candidate = this._laterRuneInPair(group);
      if (best === null || candidate.regenTime > best.regenTime) {
        best = candidate;
      }
    }
    return best;
  }

  // ── Blood Tap ──────────────────────────────────────────────────────────────

  /**
   * Blood Tap (MoP talent): spend 5 Blood Charges to activate one depleted
   * rune as a Death rune.
   *
   * Priority differs by spec:
   *  - Blood: depleted Blood pair first; else whichever of Frost/Unholy is
   *    depleted with the higher remaining CD.
   *  - Frost: depleted Unholy pair first; else whichever of Blood/Frost is
   *    depleted with the higher remaining CD.
   *  - Unholy: whichever of Blood/Frost is depleted with the higher remaining
   *    CD; Unholy pair only as a fallback.
   */
  private _activateBloodTapRune(timestamp: number) {
    const target = this._selectRuneForActivation(timestamp, []);
    if (target !== null) {
      this._bloodTapActivate(target, timestamp);
    }
  }

  /**
   * Select one depleted rune for Blood Tap-style activation, per spec
   * priority (see `_activateBloodTapRune`). Blood and Frost each have one
   * guaranteed-first group, checked before ever comparing the other two;
   * Unholy has no guaranteed-first group; it compares Blood/Frost up front
   * and only falls back to Unholy itself if neither is depleted.
   */
  private _selectRuneForActivation(timestamp: number, excluded: number[]): MoPRune | null {
    if (this.spec === 'Blood' && this._pairDepleted(BLOOD_INDICES, timestamp, excluded)) {
      return this._laterRuneInPair(BLOOD_INDICES);
    }
    if (this.spec === 'Frost' && this._pairDepleted(UNHOLY_INDICES, timestamp, excluded)) {
      return this._laterRuneInPair(UNHOLY_INDICES);
    }

    const compareGroups: ReadonlyArray<readonly [number, number]> =
      this.spec === 'Blood' ? [FROST_INDICES, UNHOLY_INDICES] : [BLOOD_INDICES, FROST_INDICES];
    const compareCandidate = this._bestDepletedPair(compareGroups, timestamp, excluded);
    if (compareCandidate) {
      return compareCandidate;
    }

    // Unholy's guaranteed fallback group (Blood/Frost already ruled out above
    // by the compare step finding nothing).
    if (this.spec === 'Unholy' && this._pairDepleted(UNHOLY_INDICES, timestamp, excluded)) {
      return this._laterRuneInPair(UNHOLY_INDICES);
    }
    return null;
  }

  // ── Plague Leech ───────────────────────────────────────────────────────────

  /**
   * Plague Leech: consume diseases to activate up to 2 depleted runes as
   * Death runes. Two picks, each from a different rune pair, walked in a
   * fixed spec-dependent order - unlike Blood Tap, this does NOT compare
   * remaining CD across pairs here, it just tries each group in sequence:
   *  - Unholy: Blood, then Frost; Unholy only if fewer than 2 found.
   *  - Blood/Frost: Frost, then Unholy; Blood only if fewer than 2 found.
   */
  private _activatePlagueLeechRunes(timestamp: number) {
    const order: ReadonlyArray<readonly [number, number]> =
      this.spec === 'Unholy'
        ? [BLOOD_INDICES, FROST_INDICES, UNHOLY_INDICES]
        : [FROST_INDICES, UNHOLY_INDICES, BLOOD_INDICES];

    const excluded: number[] = [];
    for (let pick = 0; pick < 2; pick++) {
      let target: MoPRune | null = null;
      for (const group of order) {
        if (this._pairDepleted(group, timestamp, excluded)) {
          target = this._laterRuneInPair(group);
          excluded.push(...group);
          break;
        }
      }
      if (!target) {
        break;
      }
      this._bloodTapActivate(target, timestamp);
    }
  }

  private _bloodTapActivate(rune: MoPRune, timestamp: number) {
    if (!rune.isDeath) {
      rune.isBloodTapped = true;
    }
    rune.regenTime = timestamp;
    // Clear the sentinel - this rune now has a real, resolved regenTime, so
    // _resolvePendingRegens must never later overwrite it.
    rune.pendingRegen = false;
  }

  // ── Empower Rune Weapon ────────────────────────────────────────────────────

  /**
   * ERW instantly refreshes all 6 runes that are on cooldown.
   * Maintains the queue relationship between paired runes.
   */
  private _empowerRuneWeapon(timestamp: number) {
    for (let i = 0; i < 6; i += 2) {
      const a = this.runes[i];
      const b = this.runes[i + 1];
      // Refresh first rune
      if (!this._isAvailable(a, timestamp)) {
        a.regenTime = timestamp;
        a.pendingRegen = false;
      }
      // Refresh second rune (may have queued behind first, or been sitting
      // as a still-pending sentinel - either way it's real and available now)
      if (!this._isAvailable(b, timestamp)) {
        b.regenTime = timestamp;
        b.pendingRegen = false;
      }
    }
  }

  // ── Haste adjustment ───────────────────────────────────────────────────────

  /**
   * When the effective haste multiplier changes, rescale all in-progress rune
   * cooldown remainders proportionally.
   *
   * Previously this tried to detect a "queued" pair (second rune's regenTime
   * ≈ first's + oldCd) and strip/re-add that offset around the rescale so
   * the gap between them would land on the new CD instead of the old one.
   * That's both unnecessary and risky: rescaling is linear, so scaling each
   * rune's remaining time independently already reproduces exactly
   * `first.new + newCd` for a genuinely queued second rune (the strip/re-add
   * was a no-op on the path where it fired correctly) - and under the
   * `pendingRegen` model a truly-queued rune's regenTime is the `Infinity`
   * sentinel anyway, never a real `first + oldCd` value, so the detection
   * could only ever fire on two independently-real regenTimes that happened
   * to land `oldCd` apart by coincidence, corrupting them with an offset
   * that was never actually there.
   */
  private _adjustRuneRegenTimes(timestamp: number, oldMult: number, newMult: number) {
    if (oldMult === newMult) {
      return;
    }

    const oldCd = BASE_RUNE_CD_MS / oldMult;
    const newCd = BASE_RUNE_CD_MS / newMult;

    for (const rune of this.runes) {
      // Pending runes have no real countdown to rescale (regenTime is an
      // Infinity sentinel - see MoPRune.pendingRegen). They'll get a
      // correctly fresh, live-haste completion time whenever they actually
      // start regenerating, via _resolvePendingRegens.
      if (rune.pendingRegen) {
        continue;
      }
      if (rune.regenTime > timestamp) {
        const remaining = rune.regenTime - timestamp;
        rune.regenTime = timestamp + remaining * (newCd / oldCd);
      }
      rune.runeCdMs = newCd;
    }
  }

  private _updateRuneCds(mult: number) {
    const newCd = BASE_RUNE_CD_MS / mult;
    for (const rune of this.runes) {
      rune.runeCdMs = newCd;
    }
  }

  // ── Per-type rune snapshot (used for charts) ─────────────────────────────

  private _typeSnapshot(timestamp: number): {
    blood: { natural: number; death: number };
    frost: { natural: number; death: number };
    unholy: { natural: number; death: number };
  } {
    const snap = {
      blood: { natural: 0, death: 0 },
      frost: { natural: 0, death: 0 },
      unholy: { natural: 0, death: 0 },
    };
    for (let i = 0; i < 6; i++) {
      const rune = this.runes[i];
      if (!this._isAvailable(rune, timestamp)) {
        continue;
      }
      // All death runes (permanent or temporary) count as "death" for the chart.
      const isDeath = rune.isDeath || rune.isBloodTapped;
      if (i < 2) {
        isDeath ? snap.blood.death++ : snap.blood.natural++;
      } else if (i < 4) {
        isDeath ? snap.frost.death++ : snap.frost.natural++;
      } else {
        isDeath ? snap.unholy.death++ : snap.unholy.natural++;
      }
    }
    return snap;
  }

  protected _pushTypeSnapshot(timestamp: number) {
    const s = this._typeSnapshot(timestamp);
    this.bloodHistory.push({ timestamp, ...s.blood });
    this.frostHistory.push({ timestamp, ...s.frost });
    this.unholyHistory.push({ timestamp, ...s.unholy });
  }

  /**
   * A rune becoming available for a single GCD before being spent again is
   * real and worth seeing, but on a chart spanning a multi-minute fight that
   * segment can be sub-pixel wide and effectively invisible. This nudges any
   * segment shorter than the chart's own minimum-visible-duration out just
   * enough to render at `minVisiblePx`, by delaying the timestamp of
   * whichever point would otherwise end it too soon.
   *
   * Only affects the copy handed to the chart - `bloodHistory` /
   * `frostHistory` / `unholyHistory` themselves (and their real timestamps)
   * are untouched, since nothing else reads these arrays.
   *
   * The array isn't naturally in chronological order: the constructor seeds
   * an initial snapshot at fight-start before any events are processed, so a
   * prepull cast (e.g. Army of the Dead's ghoul-derived negative timestamp)
   * gets pushed later, appearing AFTER the fight-start entry despite having
   * an earlier timestamp. Sort by timestamp first so the widening pass (which
   * only ever pushes points forward) doesn't mistake that earlier prepull
   * point for a too-short segment and shove it forward past 0s.
   *
   * Each cast pushes a pre-cast AND a post-cast snapshot at the exact same
   * timestamp (a genuine instantaneous transition, not a short-but-real
   * segment). Padding is only applied when the gap to the ORIGINAL previous
   * timestamp is nonzero but under the visible minimum - same-instant pairs
   * are left untouched. Padding relative to the original timestamps (rather
   * than the running, possibly-already-padded `lastRenderTs`) keeps drift
   * from one padded segment compounding into the next: earlier versions of
   * this padded every same-instant pre/post pair by the full minimum gap,
   * and with hundreds of casts that compounded into drift of several minutes
   * by the end of the fight.
   */
  protected _widenHistoryForDisplay<T extends { timestamp: number }>(
    history: T[],
    chartWidthPx: number,
    fightDurationMs: number,
    minVisiblePx = 6,
  ): T[] {
    if (history.length === 0 || chartWidthPx <= 0 || fightDurationMs <= 0) {
      return history;
    }
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const minVisibleMs = (minVisiblePx / chartWidthPx) * fightDurationMs;
    const widened: T[] = [{ ...sorted[0] }];
    let lastRenderTs = sorted[0].timestamp;
    for (let i = 1; i < sorted.length; i++) {
      const point = sorted[i];
      const prevOriginalTs = sorted[i - 1].timestamp;
      const originalGap = point.timestamp - prevOriginalTs;
      const desiredTs =
        originalGap > 0 && originalGap < minVisibleMs
          ? prevOriginalTs + minVisibleMs
          : point.timestamp;
      const renderTs = Math.max(desiredTs, lastRenderTs);
      widened.push({ ...point, timestamp: renderTs });
      lastRenderTs = renderTs;
    }
    return widened;
  }

  // ── Statistic helpers (used by concrete subclasses) ───────────────────────

  /** Fraction of the fight spent at each Blood-rune available count (index 0–2). */
  get timeSpentAtBloodCount(): number[] {
    const total = this.owner.fightDuration;
    return this.bloodReadySum.map((ms) => ms / total);
  }

  /** Fraction of the fight spent at each Frost-rune available count (index 0–2). */
  get timeSpentAtFrostCount(): number[] {
    const total = this.owner.fightDuration;
    return this.frostReadySum.map((ms) => ms / total);
  }

  /** Fraction of the fight spent at each Unholy-rune available count (index 0–2). */
  get timeSpentAtUnholyCount(): number[] {
    const total = this.owner.fightDuration;
    return this.unholyReadySum.map((ms) => ms / total);
  }

  /**
   * Just averaging the three per-type capped fractions here (Blood/Frost/Unholy).
   * Felt more honest than the old all-6-at-once number since each rune type
   * actually caps on its own.
   */
  get runeCapPercent(): number {
    const blood = this.timeSpentAtBloodCount[2];
    const frost = this.timeSpentAtFrostCount[2];
    const unholy = this.timeSpentAtUnholyCount[2];
    return (blood + frost + unholy) / 3;
  }
}

export default MoPRuneTracker;
