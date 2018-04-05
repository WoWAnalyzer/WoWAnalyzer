import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

const TACTICIAN_ID = SPELLS.TACTICIAN.id;
const MORTAL_STRIKE_ID = SPELLS.MORTAL_STRIKE.id;
const COLOSSUS_SMASH_ID = SPELLS.COLOSSUS_SMASH.id;

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  on_byPlayer_applybuff(event) {
    if(super.on_byPlayer_applybuff) {
      super.on_byPlayer_applybuff(event);
    }
    this.handleTacticianBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    if(super.on_byPlayer_refreshbuff) {
      super.on_byPlayer_refreshbuff(event);
    }
    this.handleTacticianBuff(event);
  }

  handleTacticianBuff(event) {
    // If the buff being applied/refreshed is tactician, refresh the cooldowns of mortal strike and colossus smash.
    if (TACTICIAN_ID === event.ability.guid) {
      if (this.isOnCooldown(MORTAL_STRIKE_ID)) {
        this.endCooldown(MORTAL_STRIKE_ID);
      }
      if (this.isOnCooldown(COLOSSUS_SMASH_ID)) {
        this.endCooldown(COLOSSUS_SMASH_ID);
      }
    }
  }
}

export default SpellUsable;
