import { AbsorbedEvent, EventType, HealEvent, RemoveBuffEvent } from 'parser/core/Events';

/**
 * Represents the components of a healing event or events.
 * This data object is immutable!
 */
export default class HealingValue {
  readonly _regular: number = 0;
  readonly _absorbed: number = 0;
  readonly _overheal: number = 0;

  /**
   * The 'regular' portion of a heal, discounting absorbed healing and overhealing.
   * Do not use this without really good reason! "Effective" healing includes both regular and absorbed healing
   * and is almost always the value you actually want to use.
   */
  get regular(): number {
    return this._regular;
  }

  /** Amount of absorbed healing. *This tallies absorbed healing, NOT absorbed damage.
   * Damage absorbed (from an AbsorbedEvent) is tallied as 'regular' healing.* */
  get absorbed(): number {
    return this._absorbed;
  }

  /** Amount of effective healing (the sum of regular and absorbed) */
  get effective(): number {
    // `absorbed` is usually a negative debuff you need to remove as part of game mechanics.
    // As such, we consider it to be effective healing
    return this.regular + this.absorbed;
  }

  /** Amount of overhealing. This also can include expired absorb shields. */
  get overheal(): number {
    return this._overheal;
  }

  /** Amount of raw healing (sum of all components) */
  get raw(): number {
    return this.effective + this.overheal;
  }

  private constructor(regular?: number, absorbed?: number, overheal?: number) {
    this._regular = regular || 0;
    this._absorbed = absorbed || 0;
    this._overheal = overheal || 0;
  }

  /**
   * Constructs a new HealingValue based on the values represented by an event.
   * @param event
   *   HealEvent - populates regular healing and optionally absorbed and overheal if present.
   *   AbsorbedEvent - only includes regular healing. Damage absorbs cannot remove healing absorbs,
   *     and expired absorbs are tallied in a future event
   *   RemoveBuff - when a damage absorb expires, the expired amount is overheal.
   */
  public static fromEvent(event: HealEvent | AbsorbedEvent | RemoveBuffEvent): HealingValue {
    if (event.type === EventType.Heal) {
      return new HealingValue(event.amount, event.absorbed, event.overheal);
    } else if (event.type === EventType.Absorbed) {
      return new HealingValue(event.amount, 0, 0);
    } else {
      // RemoveBuff
      return new HealingValue(0, 0, event.absorb);
    }
  }

  /** Returns a new HealingValue with explicitly specified values */
  public static fromValues(item: HealingValueItem): HealingValue {
    return new HealingValue(item.regular, item.absorbed, item.overheal);
  }

  /** Returns a new HealingValue with zeroed values */
  public static empty(): HealingValue {
    return new HealingValue(0, 0, 0);
  }

  /** Adds the given healing value to this one and returns the result.
   *  This object will NOT be modified */
  add(val: HealingValue): HealingValue {
    return new HealingValue(
      this.regular + val.regular,
      this.absorbed + val.absorbed,
      this.overheal + val.overheal,
    );
  }

  /** Adds the given event to this value and returns the result.
   *  This object will NOT be modified */
  addEvent(event: HealEvent | AbsorbedEvent | RemoveBuffEvent): HealingValue {
    return this.add(HealingValue.fromEvent(event));
  }

  /** Adds the given values to this value and returns the result.
   *  This object will NOT be modified */
  addValues(item: HealingValueItem): HealingValue {
    return this.add(HealingValue.fromValues(item));
  }
}

export interface HealingValueItem {
  regular?: number;
  absorbed?: number;
  overheal?: number;
}

/** Convenience function when all you want is an event's effective healing */
export function effectiveHealing(event: HealEvent | AbsorbedEvent): number {
  return event.type === EventType.Heal ? event.amount + (event.absorbed || 0) : event.amount;
}
