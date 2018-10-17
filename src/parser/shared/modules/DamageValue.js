class DamageValue {
  _largestHit = 0;
  _regular = 0;
  /** Do not use this without really good reason! `effective` is almost always better; we WANT to include absorbed damage as this is most commonly related to mechanics that need to be removed and therefore significant. */
  get regular() { return this._regular; }
  _absorbed = 0;
  get absorbed() { return this._absorbed; }
  _blocked = 0;
  get blocked() { return this._blocked; }
  get effective() {
    return this.regular + this.absorbed;
  }
  _overkill = 0;
  get overkill() { return this._overkill; }
  get raw() {
    return this.effective + this.overkill;
  }

  get largestHit() {
    return this._largestHit;
  }

  constructor(regular = 0, absorbed = 0, blocked = 0, overkill = 0, largestHit = null) {
    this._regular = regular;
    this._absorbed = absorbed;
    this._blocked = blocked;
    this._overkill = overkill;
    this._largestHit = (largestHit === null) ? regular + absorbed + overkill : largestHit;
  }

  add(regular, absorbed, blocked, overkill) {
    return new this.constructor(this.regular + regular, this.absorbed + absorbed, this.blocked + blocked, this.overkill + overkill, Math.max(this.largestHit, regular + absorbed + blocked + overkill));
  }
  subtract(regular, absorbed, blocked, overkill) {
    return new this.constructor(this.regular - regular, this.absorbed - absorbed, this.blocked - blocked, this.overkill - overkill, this.largestHit);
  }
}

export default DamageValue;
