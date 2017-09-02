import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import indexById from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import {ABILITIES_AFFECTED_BY_HEALING_INCREASES} from '../../Constants';
import {HEALS_MASTERY_STACK} from '../../Constants';

class Mastery extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  hotHealingMap = null;
  masteryBuffs = null;

  on_initialized() {
    // TODO use JS objects instead of Maps for hotHealingMap and masteryBuffs?
    this.hotHealingMap = new Map();
    for(let healId of HEALS_MASTERY_STACK) {
      this.hotHealingMap.set(healId, {'name':indexById(healId).name, 'direct':0, 'mastery':0});
    }

    this.masteryBuffs = new Map([
        [ SPELLS.ASTRAL_HARMONY.id, { 'spell':SPELLS.ASTRAL_HARMONY, 'amount':4000 } ],
        [ SPELLS.JACINS_RUSE.id, { 'spell':SPELLS.JACINS_RUSE, 'amount':3000 } ],
    ]);
    for(let[buffId, buffObj] of this.masteryBuffs.entries()) {
  		buffObj.attributableHealing = 0;
  		buffObj.isActive = false; // TODO: is buff presence already handled by WoWAnalyzer?
  	}
  }

  // TODO handle pre proc mastery buffs? Looks like pre-hots are already handled by the system.

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    const amount = event.amount + (event.absorbed === undefined : 0 ? event.absorbed);

    if(target === null) {
      return;
    }

    if(this.hotHealingMap.has(spellId)) {
      this.hotHealingMap.get(spellId).direct += amount;
    }

    if(ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      let hotsOn = target.activeBuffs().filter(buff => HEALS_MASTERY_STACK.includes(buff.ability.guid));
      let numHotsOn = hotsOn.length;
      let decomposedHeal = _decompHeal(amount, numHotsOn);

      this.totalNoMasteryHealing += decomposedHeal.noMasteryHealing;
      this.druidSpellNoMasteryHealing += decomposedHeal.noMasteryHealing;
      this.masteryTimesHealing += decomposedHeal.noMasteryHealing * numHotsOn;

      // TODO give each HoT credit for mastery boosting

      // TODO attribute healing to mastery buffs that are present

    } else {
      this.totalNoMasteryHealing += amount;
    }
  }

  // TODO also count absorbs in total no mastery healing?

  // TODO build suggested results

  _decompHeal(amount, hotCount) {
    // TODO implement
    // return object with [no mastery healing], [one stack mastery healing], and [one mastery rating healing]
    // takes place of all helpers
  }

}


export default Mastery;
