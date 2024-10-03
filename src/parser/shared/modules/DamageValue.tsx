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

  constructor(regular = 0, absorbed = 0, blocked = 0, overkill = 0, largestHit = null) {
    this._regular = regular;
    this._absorbed = absorbed;
    this._blocked = blocked;
    this._overkill = overkill;
    this._largestHit = largestHit === null ? regular + absorbed + overkill : largestHit;
  }

  constructor(event: DamageEvent) {
    this._regular = event.amount;
    this._absorbed = event.absorbed || 0;
    this._blocked = event.blocked || 0;
    this._overkill = event.overkill || 0;
    this._largestHit = this.raw;
  }

  /** Adds the given values to this value and returns the result.
   *  This object will NOT be modified */
  add(regular = 0, absorbed = 0, blocked = 0, overkill = 0) {
    return new this.constructor(
      this.regular + regular,
      this.absorbed + absorbed,
      this.blocked + blocked,
      this.overkill + overkill,
      Math.max(this.largestHit, regular + absorbed + blocked + overkill),
    );
  }

  /** Adds the given values to this damage value and returns the result.
   *  This object will NOT be modified */
  add(val: DamageValue): DamageValue {
    return this.add(val.regular, val.absorbed, val.blocked, val.overkill);
  }

  /** Adds the given event to this value and returns the result.
   *  This object will NOT be modified */
  add(event: DamageEvent) {
    return this.add(new DamageValue(event));
  }
}

/** Convenience function when all you want is an event's effective damage */
export function effectiveDamage(event: DamageEvent): number {
  return event.amount + (event.absorbed || 0);
}

export default DamageValue;
