import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import { formatNumber } from 'common/format';

class TheDeceiversBloodPact extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  extraMaelstrom = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.THE_DECEIVERS_BLOOD_PACT_EQUIP.id);
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid===SPELLS.THE_DECEIVERS_BLOOD_PACT_BUFF.id) {
        this.extraMaelstrom+=event.classResources[0].amount;
    }
  }

  item() {
    return {
      id: `item-${ITEMS.THE_DECEIVERS_BLOOD_PACT.id}`,
      icon: <ItemIcon id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />,
      title: <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />,
      result: `${formatNumber(this.extraMaelstrom)} Maelstrom refunded`,
    };
  }
}
export default TheDeceiversBloodPact;
