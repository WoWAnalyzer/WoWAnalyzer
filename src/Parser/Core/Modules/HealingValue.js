class HealingValue {
  _regular = 0; // do not use this without really good reason! `effective` is almost always better; we WANT to include absorbed healing as this is most often related to mechanics that need to be removed and therefore significant.
  get regular() { return this._regular; }
  _absorbed = 0;
  get absorbed() { return this._absorbed; }
  get effective() {
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

  add(regular, absorbed, overheal) {
    return new HealingValue(this.regular + regular, this.absorbed + absorbed, this.overheal + overheal);
  }
  // TODO: reduceDamage (e.g. LotM self-damage)
}

export default HealingValue;
