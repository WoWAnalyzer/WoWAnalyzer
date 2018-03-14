import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
* Lazy solution for the Riptide reset, as it is undetectable but the spell is too important to disable.
* Cast efficiency with echo selected is a lot harsher compared to without to account for the resets.
*/

class EchoReset extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  lastRiptideTimestamp = 0;
  lastRiptideCharges = 0;

  on_initialized(){
    this.active = this.combatants.selected.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RIPTIDE.id) {
      return;
    }
    if (this.spellUsable.chargesAvailable(SPELLS.RIPTIDE.id) === 0) {
        if(event.timestamp - this.lastRiptideTimestamp <= 6000 && this.lastRiptideCharges <= 1) {
            this.spellUsable.endCooldown(spellId,false,event.timestamp,6000);
            this.spellUsable.beginCooldown(spellId);
        }
        
    }

    this.lastRiptideTimestamp = event.timestamp;
    this.lastRiptideCharges = this.spellUsable.chargesAvailable(SPELLS.RIPTIDE.id);
  }
}

export default EchoReset;
