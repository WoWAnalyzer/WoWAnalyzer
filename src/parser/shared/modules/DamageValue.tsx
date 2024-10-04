import { DamageEvent } from 'parser/core/Events';

/**
 * Represents the components of a damage event or events.
 * This data object is immutable!
 */
export default class DamageValue {
  _largestHit = 0;
  _regular = 0;
  _absorbed = 0;
  _blocked = 0;
  _overkill = 0;

  /**
   * The 'regular' portion of a damage event, discounting absorbed damage, overkill, and blocked.
   * Do not use this without really good reason! "Effective" damage includes both regular and absorbed damage
   * and is almost always the value you actually want to use.
   */
  get regular(): number {
    return this._regular;
  }

  /** Amount of absorbed damage */
  get absorbed(): number {
    return this._absorbed;
  }

  /** Amount of blocked damage */
  get blocked(): number {
    return this._blocked;
  }

  /** Amount of effective damage (the sum of regular and absorbed) */
  get effective(): number {
    return this.regular + this.absorbed;
  }

  /** Amount of overkill damage */
  get overkill(): number {
    return this._overkill;
  }

  // TODO why is blocked excluded? When does blocked even show up?
  /** Amount of raw damage (regular + absorbed + overkill) -- but not blocked for some reason? */
  get raw(): number {
    return this.effective + this.overkill;
  }

  /** The largest single raw hit */
  get largestHit(): number {
    return this._largestHit;
  }

  private constructor(
    regular?: number,
    absorbed?: number,
    blocked?: number,
    overkill?: number,
    largestHit?: number,
  ) {
    this._regular = regular || 0;
    this._absorbed = absorbed || 0;
    this._blocked = blocked || 0;
    this._overkill = overkill || 0;
    this._largestHit = largestHit || this.raw;
  }

  /**
   * Constructs a new DamageValue based on the values represented by an event.
   */
  public static fromEvent(event: DamageEvent): DamageValue {
    return new DamageValue(event.amount, event.absorbed, event.blocked, event.overkill);
  }

  /** Returns a new DamageValue with explicitly specified values */
  public static fromValues(item: DamageValueItem): DamageValue {
    return new DamageValue(item.regular, item.absorbed, item.blocked, item.overkill);
  }

  /** Returns a new DamageValue with zeroed values */
  public static empty(): DamageValue {
    return new DamageValue(0, 0, 0, 0);
  }

  /** Adds the given values to this damage value and returns the result.
   *  This object will NOT be modified */
  add(val: DamageValue): DamageValue {
    return new DamageValue(
      this.regular + val.regular,
      this.absorbed + val.absorbed,
      this.blocked + val.blocked,
      this.overkill + val.overkill,
      Math.max(this.largestHit, val.largestHit),
    );
  }

  /** Adds the given event to this value and returns the result.
   *  This object will NOT be modified */
  addEvent(event: DamageEvent) {
    return this.add(DamageValue.fromEvent(event));
  }

  /** Adds the given values to this value and returns the result.
   *  This object will NOT be modified */
  addValues(item: DamageValueItem) {
    return this.add(DamageValue.fromValues(item));
  }
}

export interface DamageValueItem {
  regular?: number;
  absorbed?: number;
  blocked?: number;
  overkill?: number;
}

/** Convenience function when all you want is an event's effective damage */
export function effectiveDamage(event: DamageEvent): number {
  return event.amount + (event.absorbed || 0);
}
