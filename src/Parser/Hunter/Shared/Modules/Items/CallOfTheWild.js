import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Call of the Wild
 * Equip: Reduces the cooldown of all Aspects by 35%.
 */
class CallOfTheWild extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
  }

  item() {
    return {
      item: ITEMS.CALL_OF_THE_WILD,
      result: 'This reduced the cooldown of all your Aspect spells by 35%',
    };
  }
}

export default CallOfTheWild;
