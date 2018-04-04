import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

// Damaging spells that do not cause Atonement healing
const DAMAGING_SPELLS_THAT_DO_NOT_TRANSFER = [
  // Void Elf Racial
  SPELLS.ENTROPIC_EMBRACE_DAMAGE.id,
  // Ring of Collapsing Futures
  SPELLS.COLLAPSE.id,
  // When a target is immune, heals sometimes turn into damage events but that does not proc Atonement healing (Varimathras)
  SPELLS.ATONEMENT_HEAL_NON_CRIT.id,
];

class AtonementDamageSource extends Analyzer {
  _event = null;
  get event() {
    return this._event;
  }

  on_damage(event) {
    if (!this.owner.byPlayer(event) && !this.owner.byPlayerPet(event)) {
      return;
    }
    if (DAMAGING_SPELLS_THAT_DO_NOT_TRANSFER.includes(event.ability.guid)) {
      return;
    }
    if (event.targetIsFriendly) {
      // Friendly fire doesn't atonement transfer - I think. The only place I could find this is Aura of Sacrifice so it might also be restricted by spells not owned by the player (even though the player is the damage source), but that seems less likely.
      return;
    }
    // The next Atonement healing will be caused by this spell
    this._event = event;
  }
}

export default AtonementDamageSource;
