import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

class SwellingStream extends BaseHealerAzerite {
  static TRAIT = SPELLS.SWELLING_STREAM.id;
  static HEAL = SPELLS.SWELLING_STREAM_HEAL.id;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(this.constructor.TRAIT);
    if (!this.active) {
      return;
    }
  }

  on_byPlayerPet_heal(event) {
    this.on_byPlayer_heal(event);
  }
}

export default SwellingStream;
