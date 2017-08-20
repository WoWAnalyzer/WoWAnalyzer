import Module from 'Parser/Core/Module';

class Totals extends Module {
  totalDamageDone = 0;
  totalDamageDoneToFriendly = 0;
  on_byPlayer_damage(event) {
    const damageDone = event.amount + (event.absorbed || 0);
    if (event.targetIsFriendly) {
      this.totalDamageDoneToFriendly += damageDone;
    } else {
      this.totalDamageDone += damageDone;
    }
  }

  totalDamageTaken = 0;
  totalDamageTakenAbsorb = 0;
  on_toPlayer_damage(event) {
    this.totalDamageTaken += event.amount + (event.absorbed || 0);
    this.totalDamageTakenAbsorb += (event.absorbed || 0); // this also triggers an `absorbed` event for the player responsible for the absorb, which may be someone else
  }
}

export default Totals;
