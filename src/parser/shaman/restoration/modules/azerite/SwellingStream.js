import { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import BaseHealerAzerite from './BaseHealerAzerite';

/**
 * Swelling Stream:
 * Every 3 sec your Healing Stream Totem releases a lesser chain heal,
 * restoring 637 health to up to 3 injured allies. Healing is reduced by 30% after each jump.
 */

class SwellingStream extends BaseHealerAzerite {
  static TRAIT = SPELLS.SWELLING_STREAM;
  static HEAL = SPELLS.SWELLING_STREAM_HEAL;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(this.constructor.TRAIT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell(this.constructor.HEAL), this._processHealing);
  }
}

export default SwellingStream;
