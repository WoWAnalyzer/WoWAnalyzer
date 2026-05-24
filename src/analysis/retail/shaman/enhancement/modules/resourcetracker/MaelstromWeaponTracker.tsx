import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ClassResources,
  EventType,
  FreeCastEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import ResourceTracker, {
  SegmentData,
} from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export const PERFECT_WASTED_PERCENT = 0.1;
export const GOOD_WASTED_PERCENT = 0.2;
export const OK_WASTED_PERCENT = 0.3;

export type WasteClassification = 'avoidable' | 'unavoidable';

export interface WasteEvent {
  timestamp: number;
  spellId: number;
  waste: number;
  classification: WasteClassification;
}

/**
 * Deterministic gains from player-initiated casts — waste is always avoidable.
 */
const ALWAYS_AVOIDABLE_SPELL_IDS = new Set([
  TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
  TALENTS.LIGHTNING_STRIKES_TALENT.id,
  TALENTS.SURGING_ELEMENTS_TALENT.id,
  TALENTS.STATIC_ACCUMULATION_TALENT.id,
  SPELLS.VOLTAIC_BLAZE_CAST.id,
]);

/**
 * Random or unpredictable sources — waste is always unavoidable.
 */
const ALWAYS_UNAVOIDABLE_SPELL_IDS = new Set([
  TALENTS.THUNDER_CAPACITOR_TALENT.id,
  TALENTS.SUPERCHARGE_TALENT.id,
]);

/**
 * Abilities that are higher priority than spending Maelstrom Weapon.
 * Waste from passive sources during a GCD triggered by one of these is unavoidable.
 */
const HIGH_PRIORITY_ABILITIES = new Set<number>([
  // placeholder for future additions
]);

/**
 * Extended {@link SegmentData} that includes avoidable/unavoidable waste breakdowns.
 */
export class MaelstromSegmentData extends SegmentData {
  readonly wasteEvents: WasteEvent[];

  private constructor(startTimestamp: number, endTimestamp: number, wasteEvents: WasteEvent[]) {
    super(startTimestamp, endTimestamp);
    this.wasteEvents = wasteEvents;
  }

  static fromSegmentData(base: SegmentData, allWasteEvents: WasteEvent[]): MaelstromSegmentData {
    const filtered = allWasteEvents.filter(
      (e) => e.timestamp >= base.startTimestamp && e.timestamp < base.endTimestamp,
    );
    const segment = new MaelstromSegmentData(base.startTimestamp, base.endTimestamp, filtered);
    for (const update of base.updates) {
      segment._pushUpdate(update);
    }
    return segment;
  }

  get avoidableWaste(): number {
    return this.wasteEvents
      .filter((e) => e.classification === 'avoidable')
      .reduce((acc, e) => acc + e.waste, 0);
  }

  get unavoidableWaste(): number {
    return this.wasteEvents
      .filter((e) => e.classification === 'unavoidable')
      .reduce((acc, e) => acc + e.waste, 0);
  }

  avoidableWasteBySpell(spellId: number): number {
    return this.wasteEvents
      .filter((e) => e.classification === 'avoidable' && e.spellId === spellId)
      .reduce((acc, e) => acc + e.waste, 0);
  }

  unavoidableWasteBySpell(spellId: number): number {
    return this.wasteEvents
      .filter((e) => e.classification === 'unavoidable' && e.spellId === spellId)
      .reduce((acc, e) => acc + e.waste, 0);
  }
}

class MaelstromWeaponTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  isDead = false;
  expiredWaste = 0;

  /** Running total of avoidable builder waste */
  avoidableWaste = 0;
  /** Running total of unavoidable builder waste */
  unavoidableWaste = 0;
  /** All waste events with classification metadata, ordered by timestamp */
  wasteEvents: WasteEvent[] = [];

  /** Timestamp when the current GCD ends */
  private gcdEndTimestamp = 0;
  /** Spell ID that triggered the current GCD */
  private gcdTriggerSpellId = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.MAELSTROM_WEAPON;
    this.refundOnMiss = false;
    this.refundOnMissAmount = 0;
    this.isRegenHasted = false;
    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT)
      ? 10
      : 5;

    this.addEventListener(Events.freecast.by(SELECTED_PLAYER), this.onFreeCast);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);
  }

  private onGlobalCooldown(event: GlobalCooldownEvent) {
    this.gcdEndTimestamp = event.timestamp + event.duration;
    this.gcdTriggerSpellId = event.ability.guid;
  }

  private isGcdActive(timestamp: number): boolean {
    return timestamp < this.gcdEndTimestamp;
  }

  /**
   * Classify waste from a builder as avoidable or unavoidable.
   *
   * - Always-avoidable sources: deterministic gains from player-initiated casts (EA, LS, SE, SA, VB)
   * - Always-unavoidable sources: random refunds/procs (TC, Supercharge)
   * - Stormstrike damage: avoidable if the player was already at max MSW (should not have cast SS)
   * - Passive/melee/unknown sources: avoidable if the GCD is not active (player could be spending),
   *   unavoidable if the GCD is active. When a high-priority ability triggered the GCD, waste
   *   is always unavoidable; otherwise it is currently treated as unavoidable but may be refined
   *   in the future to account for low-priority GCD triggers.
   */
  private classifyWaste(spellId: number, timestamp: number): WasteClassification {
    if (ALWAYS_AVOIDABLE_SPELL_IDS.has(spellId)) {
      return 'avoidable';
    }

    if (ALWAYS_UNAVOIDABLE_SPELL_IDS.has(spellId)) {
      return 'unavoidable';
    }

    // Stormstrike damage: avoidable if the player was at max MSW when SS was cast
    if (spellId === SPELLS.STORMSTRIKE.id) {
      return this.current >= this.maxResource ? 'avoidable' : 'unavoidable';
    }

    // Passive/melee sources: avoidable when GCD is not active (player could spend)
    if (!this.isGcdActive(timestamp)) {
      return 'avoidable';
    }

    // GCD active from a high-priority ability — unavoidable
    if (HIGH_PRIORITY_ABILITIES.size > 0 && HIGH_PRIORITY_ABILITIES.has(this.gcdTriggerSpellId)) {
      return 'unavoidable';
    }

    // GCD active — currently treated as unavoidable
    return 'unavoidable';
  }

  onFreeCast(event: FreeCastEvent) {
    const castEvent: CastEvent = {
      ...event,
      type: EventType.Cast,
    };
    const cost = this.getAdjustedCost(castEvent);
    if (cost) {
      this._applySpender(event, cost, this.getResource(castEvent));
    }
  }

  override _applyBuilder(
    spellId: number,
    gain: number,
    waste: number,
    timestamp: number,
    resource?: ClassResources,
  ) {
    if (waste > 0) {
      const classification = this.classifyWaste(spellId, timestamp);
      if (classification === 'avoidable') {
        this.avoidableWaste += waste;
      } else {
        this.unavoidableWaste += waste;
      }
      this.wasteEvents.push({ timestamp, spellId, waste, classification });
    }
    super._applyBuilder(spellId, gain, waste, timestamp, resource);
  }

  override generateSegmentData(startTime: number, endTime: number): MaelstromSegmentData {
    const baseSegment = super.generateSegmentData(startTime, endTime);
    return MaelstromSegmentData.fromSegmentData(baseSegment, this.wasteEvents);
  }

  get wasted() {
    return super.wasted + this.expiredWaste;
  }

  get avoidableWasteTotal() {
    return this.avoidableWaste + this.expiredWaste;
  }

  get rawGain() {
    return this.wasted + this.generated;
  }

  get wastedPercent() {
    return this.wasted / this.rawGain;
  }

  get percentWastedPerformance(): QualitativePerformance {
    const percentWasted = this.wastedPercent;
    if (percentWasted <= PERFECT_WASTED_PERCENT) {
      return QualitativePerformance.Perfect;
    }
    if (percentWasted <= GOOD_WASTED_PERCENT) {
      return QualitativePerformance.Good;
    }
    if (percentWasted <= OK_WASTED_PERCENT) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default MaelstromWeaponTracker;
