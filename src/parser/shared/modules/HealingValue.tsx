import { AbsorbedEvent, EventType, HealEvent } from 'parser/core/Events';

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

  /** Amount of absorbed healing. */
  get absorbed(): number {
    return this._absorbed;
  }

  /** Amount of effective healing (the sum of regular and absorbed) */
  get effective(): number {
    // `absorbed` is usually a negative debuff you need to remove as part of game mechanics.
    // As such, we consider it to be effective healing
    return this.regular + this.absorbed;
  }

  /** Amount of overhealing */
  get overheal(): number {
    return this._overheal;
  }

  /** Amount of raw healing (sum of all components) */
  get raw(): number {
    return this.effective + this.overheal;
  }

  constructor(regular = 0, absorbed = 0, overheal = 0) {
    this._regular = regular;
    this._absorbed = absorbed;
    this._overheal = overheal;
  }

  constructor(event: HealEvent | AbsorbedEvent) {
    this._regular = event.amount;
    if (event.type === EventType.Heal) {
      this._absorbed = event.absorbed || 0;
      this._overheal = event.overheal || 0;
    } else {
      this._absorbed = 0;
      this._overheal = 0;
    }
  }

  /** Adds the given values to this value and returns the result.
   *  This object will NOT be modified */
  add(regular = 0, absorbed = 0, overheal = 0): HealingValue {
    return new this.constructor(
      this.regular + regular,
      this.absorbed + absorbed,
      this.overheal + overheal,
    );
  }

  /** Adds the given healing value to this one and returns the result.
   *  This object will NOT be modified */
  add(val: HealingValue): HealingValue {
    return this.add(val.regular, val.absorbed, val.overheal);
  }

  /** Adds the given event to this value and returns the result.
   *  This object will NOT be modified */
  add(event: HealEvent | AbsorbedEvent): HealingValue {
    return this.add(new HealingValue(event));
  }
}

/** Convenience function when all you want is an event's effective healing */
export function effectiveHealing(event: HealEvent | AbsorbedEvent): number {
  return event.type === EventType.Heal ? event.amount + (event.absorbed || 0) : event.amount;
}

export default HealingValue;
