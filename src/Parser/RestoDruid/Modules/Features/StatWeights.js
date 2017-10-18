import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import { getSpellInfo } from '../Core/SpellInfo';

class StatWeights extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalNonIgnoredHealing = 0;

  on_initialized() {
    // TODO implement
  }

  on_byPlayer_heal(event) {
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    _handleHeal(event, healVal.effective);
  }

  on_byPlayer_absorbed(event) {
    const healVal = new HealingValue(event.amount, 0, 0);
    _handleHeal(event, healVal.effective);
  }

  _handleHeal(event, amount) {
    const spellInfo = getSpellInfo(event.ability.guid);

    if(spellInfo.ignored) {
      return;
    }


  }

  _decompHeal(healVal, hotCount) {

  }

  // TODO output
}

export default StatWeights;
