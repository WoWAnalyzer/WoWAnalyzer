import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

class TheDeceiversBloodPact extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  extraMaelstrom = 0;
  counter = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.THE_DECEIVERS_BLOOD_PACT_EQUIP.id);
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid === SPELLS.THE_DECEIVERS_BLOOD_PACT_BUFF.id) {
      this.extraMaelstrom += event.classResources[0].amount;
      this.counter++;
    }
  }

  item() {
    return {
      item: ITEMS.THE_DECEIVERS_BLOOD_PACT,
      result: `${this.counter} procs refunded ${formatNumber(this.extraMaelstrom)} Maelstrom`,
    };
  }
}

export default TheDeceiversBloodPact;
