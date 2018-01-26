import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellHistory from 'Parser/Core/Modules/SpellHistory';

class SharedBrews extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
  };

  // reduces the cooldown of the (fake) ISB/PB in SpellUsable, returning the amount by
  // which the CD was reduced (0 if it was not on cooldown)
  //
  // also reduces BoB & FB cooldowns
  reduceCooldown(amount) {
    if(this.spellUsable.isOnCooldown(SPELLS.BLACK_OX_BREW_TALENT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.BLACK_OX_BREW_TALENT.id, amount);
    }
    if(this.spellUsable.isOnCooldown(SPELLS.FORTIFYING_BREW_BRM.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FORTIFYING_BREW_BRM.id, amount);
    }
    if(!this.spellUsable.isOnCooldown(SPELLS.IRONSKIN_BREW.id)) {
      return 0;
    }
    return this.spellUsable.reduceCooldown(SPELLS.IRONSKIN_BREW.id, amount);
  }
}

export default SharedBrews;
