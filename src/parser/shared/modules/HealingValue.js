class HealingValue {
  _regular = 0;
  /** Do not use this without really good reason! `effective` is almost always better; we WANT to include absorbed healing as this is most commonly related to mechanics that need to be removed and therefore significant. */
  get regular() { return this._regular; }
  _absorbed = 0;
  get absorbed() { return this._absorbed; }
  get effective() {
    // `absorbed` is usually a negative debuff you need to remove as part of game mechanics. We should include this as to not punish for doing mechanics.
    return this.regular + this.absorbed;
  }
  _overheal = 0;
  get overheal() { return this._overheal; }
  get raw() {
    return this.effective + this.overheal;
  }

  constructor(regular = 0, absorbed = 0, overheal = 0) {
    this._regular = regular;
    this._absorbed = absorbed;
    this._overheal = overheal;
  }

  add(regular = 0, absorbed = 0, overheal = 0) {
    return new this.constructor(this.regular + regular, this.absorbed + absorbed, this.overheal + overheal);
  }
  // TODO: reduceDamage (e.g. LotM self-damage)
}

export default HealingValue;
