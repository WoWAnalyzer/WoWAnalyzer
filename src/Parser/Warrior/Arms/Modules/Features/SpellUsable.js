import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';

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
    if (SPELLS.TACTICIAN.id === event.ability.guid) {
      if (this.isOnCooldown(SPELLS.MORTAL_STRIKE.id)) {
        this.endCooldown(SPELLS.MORTAL_STRIKE.id);
      }
      if (this.isOnCooldown(SPELLS.COLOSSUS_SMASH.id)) {
        this.endCooldown(SPELLS.COLOSSUS_SMASH.id);
      }
    }
  }
}

export default SpellUsable;
