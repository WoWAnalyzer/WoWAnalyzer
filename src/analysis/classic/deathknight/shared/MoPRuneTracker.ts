import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  ChangeHasteEvent,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';

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
    // ── Frost ───────────────────────────────────────────────────────────
    [SPELLS.HOWLING_BLAST.id]: F1, // 1 Frost
    [SPELLS.PILLAR_OF_FROST.id]: F1, // 1 Frost
    [SPELLS.OBLITERATE.id]: F1U1, // 1 Frost + 1 Unholy
    [SPELLS.SOUL_REAPER_FROST.id]: F1, // 1 Frost
    // ── Unholy ──────────────────────────────────────────────────────────
    [SPELLS.FESTERING_STRIKE.id]: B1F1, // 1 Blood + 1 Frost
    [SPELLS.SCOURGE_STRIKE.id]: F1U1, // 1 Frost + 1 Unholy
    [SPELLS.SOUL_REAPER_UNHOLY.id]: U1, // 1 Unholy
    // ── Blood (included for completeness) ───────────────────────────────
    [SPELLS.SOUL_REAPER_BLOOD.id]: B1, // 1 Blood
  };
}
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
}

function makeRune(type: RuneType, linkedIndex: number): MoPRune {
  return {
    type,
    isDeath: false,
    isBloodTapped: false,
    isPermanentDeath: false,
    regenTime: 0,
    runeCdMs: BASE_RUNE_CD_MS,
    linkedIndex,
  };
}

/**
 * MoP Death Knight rune tracker.
 *
 * Models the 6-rune system (2 Blood, 2 Frost, 2 Unholy) with:
 *  - Linked-pair queue mechanic (second rune of a pair queues behind first)
 *  - Death rune conversion (Festering Strike, Blood of the North, Blood Tap, Plague Leech)
 *  - Haste-adjusted cooldowns (listens to changehaste events)
 *  - Runic Corruption doubling regen speed while active
 *  - Resync from classResources data on each cast event to stay accurate
 *
 * Subclass with static `bloodIsDeath = true` for Frost DK (Blood of the North).
 * Subclass with static `convertOnFesteringStrike = true` for Unholy DK.
 *
 * Exposes:
 *  - `runesAvailable(timestamp)` — number of runes ready right now (0–6)
 *  - `runesByType(timestamp)` — available counts per type (Blood/Frost/Unholy/Death)
 *  - `runesOnCooldown(timestamp)` — 6 - runesAvailable(timestamp)
 *  - `runes` — raw array for advanced consumers
 */
abstract class MoPRuneTracker extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  /**
   * Set true for Frost DK: Blood of the North permanently converts Blood runes
   * to Death runes (they never revert).
   */
  protected static bloodIsDeath = false;

  /**
   * Set true for Unholy DK: Festering Strike converts the spent Blood and Frost
   * runes to Death runes.
   */
  protected static convertOnFesteringStrike = false;

  readonly runes: MoPRune[] = [
    makeRune('Blood', 1),
    makeRune('Blood', 0),
    makeRune('Frost', 3),
    makeRune('Frost', 2),
    makeRune('Unholy', 5),
    makeRune('Unholy', 4),
  ];

  /** Current haste speed factor: 1.0 = no haste. >1 = faster regen (shorter CD). */
  private _hasteMultiplier = 1.0;
  /** Whether Runic Corruption is currently active (doubles regen speed). */
  private _runicCorruptionActive = false;

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
   * Spell IDs of RP-spending abilities that should appear as half-height bars
   * in the cast timeline. Subclasses override this to specify spec-specific spenders.
   */
  protected static rpSpendersToTrack: number[] = [];
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
    const ctor = this.constructor as typeof MoPRuneTracker;
    if (ctor.bloodIsDeath) {
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
    this.addEventListener(Events.ChangeHaste, this.onChangeHaste);
    this.addEventListener(Events.fightend, this.onFightEnd);
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

    // Record cast in timeline if it costs runes
    {
      const cost = getAbilityRuneCosts()[spellId];
      if (cost && cost.blood + cost.frost + cost.unholy > 0) {
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
    }

    // Record RP-spending abilities as half-height bars in the cast timeline
    {
      const ctor = this.constructor as typeof MoPRuneTracker;
      if (ctor.rpSpendersToTrack.includes(spellId)) {
        this.castHistory.push({
          timestamp: ts,
          ability: event.ability.name,
          slot: 'RPSpend',
          halfHeight: true,
        });
      }
    }

    // Read rune costs from classResources and resync simulation
    if (event.classResources) {
      this._resyncFromClassResources(event);
    }

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
    const dt = event.timestamp - this._lastTrackTimestamp;
    this.bloodReadySum[this._lastTrackedTypeCounts.Blood] += dt;
    this.frostReadySum[this._lastTrackedTypeCounts.Frost] += dt;
    this.unholyReadySum[this._lastTrackedTypeCounts.Unholy] += dt;
    this._pushTypeSnapshot(event.timestamp);
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
    const oldMult = this._effectiveHasteMultiplier;
    this._runicCorruptionActive = true;
    const newMult = this._effectiveHasteMultiplier;
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
  }

  private onRunicCorruptionRemove(_event: RemoveBuffEvent) {
    const ts = _event.timestamp;
    const oldMult = this._effectiveHasteMultiplier;
    this._runicCorruptionActive = false;
    const newMult = this._effectiveHasteMultiplier;
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
  }

  private onChangeHaste(event: ChangeHasteEvent) {
    const ts = event.timestamp;
    const oldMult = this._effectiveHasteMultiplier;
    // WoWAnalyzer haste.current is the additive percentage (0.15 = 15% haste)
    this._hasteMultiplier = 1 + event.newHaste;
    const newMult = this._effectiveHasteMultiplier;
    this._adjustRuneRegenTimes(ts, oldMult, newMult);
    this._updateRuneCds(newMult);
  }

  // ── Rune state helpers ─────────────────────────────────────────────────────

  private _isAvailable(rune: MoPRune, timestamp: number): boolean {
    return timestamp >= rune.regenTime;
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
      this._spend(rune, timestamp, convert);

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

  private _spend(rune: MoPRune, timestamp: number, convert: boolean) {
    const linked = this.runes[rune.linkedIndex];
    const linkedReady = this._isAvailable(linked, timestamp);

    // Base CD starts from now (or rune's current regenTime if it's somehow
    // in the future — shouldn't happen for an available rune, but guards edge cases)
    rune.regenTime = Math.max(timestamp, rune.regenTime) + rune.runeCdMs;

    // Queue behind the linked rune if it's still on cooldown.
    // The second rune of a pair can't start regenerating until the first finishes,
    // so its regenTime is always linked.regenTime + cdMs.
    // Mirrors Python: if not linked.can_spend(ts): regen_time += linked.regen_time - ts
    if (!linkedReady) {
      rune.regenTime = linked.regenTime + rune.runeCdMs;
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
   * Parse classResources from a cast event and spend the corresponding runes
   * in our simulation. Resyncs any runes that are off-schedule.
   */
  private _resyncFromClassResources(event: CastEvent) {
    if (!event.classResources) {
      return;
    }

    const ts = event.timestamp;
    const ctor = this.constructor as typeof MoPRuneTracker;
    const isFestering = event.ability.guid === SPELLS.FESTERING_STRIKE.id;

    let bloodCost = 0;
    let frostCost = 0;
    let unholyCost = 0;
    let deathCost = 0;

    const spellId = event.ability.guid;
    const knownCost = getAbilityRuneCosts()[spellId];

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
    } else {
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

    const convertBlood = ctor.convertOnFesteringStrike && isFestering;
    const convertFrost = ctor.convertOnFesteringStrike && isFestering;

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
      if (needed <= 0) return 0;
      let spent = 0;
      for (const slotIndices of [BLOOD_INDICES, FROST_INDICES, UNHOLY_INDICES] as const) {
        if (spent >= needed) break;
        if (slotIndices[0] === skipStart) continue; // skip same-slot (already in avail)
        const deaths = slotIndices
          .map((i) => this.runes[i])
          .filter((r) => this._isAvailable(r, ts) && this._isDeathRune(r));
        for (const rune of deaths) {
          if (spent >= needed) break;
          this._spend(rune, ts, false);
          spent++;
        }
      }
      return spent;
    };

    const bloodDeathSubs = spendDeathSubs(bloodDeficit, BLOOD_INDICES[0]);
    const frostDeathSubs = spendDeathSubs(frostDeficit, FROST_INDICES[0]);
    const unholyDeathSubs = spendDeathSubs(unholyDeficit, UNHOLY_INDICES[0]);

    // Resync and spend only what death subs couldn't cover.
    this._resyncSlot(BLOOD_INDICES, bloodCost - bloodDeathSubs, ts);
    this._resyncSlot(FROST_INDICES, frostCost - frostDeathSubs, ts);
    this._resyncSlot(UNHOLY_INDICES, unholyCost - unholyDeathSubs, ts);

    this._spendFromSlots(bloodCost - bloodDeathSubs, BLOOD_INDICES, ts, convertBlood);
    this._spendFromSlots(frostCost - frostDeathSubs, FROST_INDICES, ts, convertFrost);
    this._spendFromSlots(unholyCost - unholyDeathSubs, UNHOLY_INDICES, ts, false);

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
      for (let i = 0; i < Math.min(deathDeficit, allDeathOnCD.length); i++) {
        allDeathOnCD[i].regenTime = ts;
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
          this._spend(rune, ts, false);
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
  private _resyncSlot(indices: readonly number[], needed: number, timestamp: number) {
    const available = indices.filter((i) => this._isAvailable(this.runes[i], timestamp)).length;
    const deficit = needed - available;
    if (deficit <= 0) {
      return;
    }
    // Ascending = soonest-ready first (shortest remaining CD = closest to natural tick)
    const onCD = indices
      .map((i) => this.runes[i])
      .filter((r) => !this._isAvailable(r, timestamp))
      .sort((a, b) => a.regenTime - b.regenTime);
    for (let i = 0; i < Math.min(deficit, onCD.length); i++) {
      const r = onCD[i];
      const diff = r.regenTime - timestamp;
      // Mirrors Python refresh(): when a rune is made available early,
      // reduce the linked rune's remaining CD by the same amount so the
      // pair stays correctly staggered (linked rune was queued behind this one).
      const linked = this.runes[r.linkedIndex];
      if (!this._isAvailable(linked, timestamp)) {
        linked.regenTime = Math.max(timestamp, linked.regenTime - diff);
      }
      r.regenTime = timestamp;
    }
  }

  // ── Blood Tap ──────────────────────────────────────────────────────────────

  /**
   * Blood Tap (MoP talent): spend 5 Blood Charges to activate one depleted
   * rune as a Death rune. Selects the rune with the longest remaining CD from
   * the pair with BOTH runes depleted (priority: Unholy → Frost → Blood).
   */
  private _activateBloodTapRune(timestamp: number) {
    const target = this._selectRuneForActivation(timestamp, []);
    if (target !== null) {
      this._bloodTapActivate(this.runes[target], timestamp);
    }
  }

  // ── Plague Leech ───────────────────────────────────────────────────────────

  /**
   * Plague Leech: consume diseases to activate up to 2 depleted runes as Death
   * runes. Two picks, each from a different rune pair.
   */
  private _activatePlagueLeechRunes(timestamp: number) {
    const excluded: number[] = [];
    for (let pick = 0; pick < 2; pick++) {
      const target = this._selectRuneForActivation(timestamp, excluded);
      if (target === null) {
        break;
      }
      this._bloodTapActivate(this.runes[target], timestamp);
      // Exclude the entire pair so second pick must be a different type
      if (UNHOLY_INDICES.includes(target as 4 | 5)) {
        excluded.push(...UNHOLY_INDICES);
      } else if (FROST_INDICES.includes(target as 2 | 3)) {
        excluded.push(...FROST_INDICES);
      } else {
        excluded.push(...BLOOD_INDICES);
      }
    }
  }

  /**
   * Select one depleted rune to activate: both runes in its pair must be
   * unavailable (or already in `excluded`). Priority: Unholy → Frost → Blood.
   * Within a pair, picks the rune with the longest remaining CD.
   */
  private _selectRuneForActivation(timestamp: number, excluded: number[]): number | null {
    const pairGroups = [UNHOLY_INDICES, FROST_INDICES, BLOOD_INDICES] as const;

    for (const [a, b] of pairGroups) {
      if (excluded.includes(a) || excluded.includes(b)) {
        continue;
      }
      const aUnavail = !this._isAvailable(this.runes[a], timestamp);
      const bUnavail = !this._isAvailable(this.runes[b], timestamp);
      if (!(aUnavail && bUnavail)) {
        continue;
      }
      // Pick the one with the longer remaining CD
      return this.runes[a].regenTime >= this.runes[b].regenTime ? a : b;
    }
    return null;
  }

  private _bloodTapActivate(rune: MoPRune, timestamp: number) {
    if (!rune.isDeath) {
      rune.isBloodTapped = true;
    }
    rune.regenTime = timestamp;
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
      }
      // Refresh second rune (may have queued behind first)
      if (!this._isAvailable(b, timestamp)) {
        b.regenTime = timestamp;
      }
    }
  }

  // ── Haste adjustment ───────────────────────────────────────────────────────

  /**
   * When the effective haste multiplier changes, rescale all in-progress rune
   * cooldown remainders (and queue delays) proportionally.
   */
  private _adjustRuneRegenTimes(timestamp: number, oldMult: number, newMult: number) {
    if (oldMult === newMult) {
      return;
    }

    const oldCd = BASE_RUNE_CD_MS / oldMult;
    const newCd = BASE_RUNE_CD_MS / newMult;

    for (let i = 0; i < 6; i += 2) {
      const a = this.runes[i];
      const b = this.runes[i + 1];

      // Determine which rune comes off CD first
      const [first, second] = a.regenTime <= b.regenTime ? [a, b] : [b, a];

      // Detect queue relationship: second ≈ first + oldCd (within 1ms tolerance)
      const inQueue =
        first.regenTime > timestamp && Math.abs(second.regenTime - (first.regenTime + oldCd)) < 1;

      // Strip queue delay before rescaling
      if (inQueue) {
        second.regenTime -= oldCd;
      }

      // Rescale remaining times
      for (const rune of [first, second]) {
        if (rune.regenTime > timestamp) {
          const remaining = rune.regenTime - timestamp;
          rune.regenTime = timestamp + remaining * (newCd / oldCd);
        }
        rune.runeCdMs = newCd;
      }

      // Re-add queue delay with new CD
      if (inQueue) {
        second.regenTime += newCd;
      }
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
   * Average, across Blood/Frost/Unholy, of the fraction of the fight spent
   * capped (2/2) for that type. This better reflects per-type rune cap waste
   * than the all-6-simultaneously metric, since each type caps independently.
   */
  get runeCapPercent(): number {
    const blood = this.timeSpentAtBloodCount[2];
    const frost = this.timeSpentAtFrostCount[2];
    const unholy = this.timeSpentAtUnholyCount[2];
    return (blood + frost + unholy) / 3;
  }
}

export default MoPRuneTracker;
