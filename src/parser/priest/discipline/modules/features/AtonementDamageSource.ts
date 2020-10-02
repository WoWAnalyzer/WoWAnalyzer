import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import { ATONEMENT_DAMAGE_SOURCES } from '../../constants';

class AtonementDamageSource extends Analyzer {
  _event: DamageEvent | null = null;

  get event() {
    return this._event;
  }

  on_damage(event: DamageEvent) {
    if (!this.owner.byPlayer(event) && !this.owner.byPlayerPet(event)) {
      return;
    }
    if (!ATONEMENT_DAMAGE_SOURCES[event.ability.guid]) {
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
