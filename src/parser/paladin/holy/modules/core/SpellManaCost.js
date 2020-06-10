import SPELLS from 'common/SPELLS';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import Combatants from 'parser/shared/modules/Combatants';

class SpellManaCost extends CoreSpellManaCost {
  static dependencies = {
    combatants: Combatants,
  };

  getResourceCost(event) {
    const spellId = event.ability.guid;
    const cost = super.getResourceCost(event);
    if (spellId !== SPELLS.HOLY_SHOCK_CAST.id && spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return cost;
    }
    if (cost === 0) {
      return cost;
    }

    if (
      spellId === SPELLS.HOLY_SHOCK_CAST.id &&
      this.combatants.selected.hasBuff(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id, event.timestamp)
    ) {
      return 0;
    }
    if (
      spellId === SPELLS.LIGHT_OF_DAWN_CAST.id &&
      this.combatants.selected.hasBuff(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id, event.timestamp)
    ) {
      return 0;
    }

    return cost;
  }
}

export default SpellManaCost;
