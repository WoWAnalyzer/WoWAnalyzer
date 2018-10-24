import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

/**
 * Swelling Stream:
 * Every 3 sec your Healing Stream Totem releases a lesser chain heal,
 * restoring 637 health to up to 3 injured allies. Healing is reduced by 30% after each jump.
 */

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
