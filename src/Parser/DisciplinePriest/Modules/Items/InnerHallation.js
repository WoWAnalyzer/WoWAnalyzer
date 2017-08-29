import SPELLS from 'common/SPELLS';
import ITEMS  from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = false;

class InnerHallation extends Module {
  manaGained = 0;

  // timestamp for power infusion if its talented & casted (to exclude mana saved):
  lastPowerInfusionCastStartTimestamp = null;

  on_initialized() {
    const selectedCombatant = this.owner.selectedCombatant;
    this.active = selectedCombatant.hasShoulder(ITEMS.INNER_HALLATION.id);
  }

  on_byPlayer_cast(event) {
    if(this.owner.selectedCombatant.hasTalent(SPELLS.POWER_INFUSION.id) && event.ability.guid === SPELLS.POWER_INFUSION.id){
      this.lastPowerInfusionCastStartTimestamp = event.timestamp;
      return;
      
    } else if (this.owner.selectedCombatant.hasBuff(SPELLS.POWER_INFUSION.id) && (event.timestamp + 20000) > this.lastPowerInfusionCastStartTimestamp){
      const spellId   = event.ability.guid;
      const manaCost  = event.manaCost;
      if (!manaCost) {
        return;
      }

      const manaSaved   = Math.floor(manaCost/3);

      if (!event.isManaCostNullified) {
        this.manaGained   += manaSaved;
        debug && console.log('Inner Hallation saved', manaSaved, 'mana on', SPELLS[spellId].name, ', normally costing', manaCost, event);
      } else {
        debug && console.log('Inner Hallation saved 0 mana on', SPELLS[spellId].name, 'costing', manaCost, 'since Innervate or Symbol of Hope is active (normally ', manaSaved, ' mana)', event);
      }

    }
  }
}

export default InnerHallation;
