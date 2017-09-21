import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const HEALING_BREAKPOINT = 0.6;
const HEALING_INCREASE = 0.6;

class EssenceOfInfusion extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.ESSENCE_OF_INFUSION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.TRANQUILITY_HEAL.id) {
      const healthBeforeHeal = event.hitPoints - event.amount;
      const healthBreakpoint = event.maxHitPoints * HEALING_BREAKPOINT;
      if (healthBeforeHeal <= healthBreakpoint) {
        this.healing += calculateEffectiveHealing(event, HEALING_INCREASE);
      }
    }
  }

  item() {
    return {
      item: ITEMS.ESSENCE_OF_INFUSION,
      result: `${this.owner.formatItemHealingDone(this.healing)}`,
    };
  }

}

export default EssenceOfInfusion;
