import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import { SMOLDERING } from '../../Constants';

class SmolderingHeart extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  smolderingProcs = 0;
  smolderingDuration = 0;
  maelstromSpent = 0;
  ascendanceCastEventIds = new Set();

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.SMOLDERING_HEART.id);
  }

  smoldering_uptime() {
    return this.smolderingDuration / this.owner.fightDuration;
  }

  expected_smoldering_uptime() {
    // Smoldering Heart (Elemental) gives a 0.10% (0.001 decimal) chance per point of Maelstrom spent to grant Ascendance for 10 seconds (10000ms).
    const EXPECTED_PROC_COUNT = this.maelstromSpent*SMOLDERING.PROC_CHANCE;
    const EXPECTED_UPTIME = (EXPECTED_PROC_COUNT * SMOLDERING.PROC_DURATION) / this.owner.fightDuration;
    return EXPECTED_UPTIME;
  }



  on_byPlayer_cast(event) {
      if (event.ability.guid === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
          this.ascendanceCastEventIds.add(event.eventUniqueId);
      }
      if (event.ability.guid === SPELLS.EARTH_SHOCK.id) {
          this.maelstromSpent += event.classResources[0].cost;
      } else if (event.ability.guid === SPELLS.FROST_SHOCK.id || event.ability.guid === SPELLS.FLAME_SHOCK.id) {
          // FS and FrS spend up to 20 Maesltrom, based on the amount available.
          this.maelstromSpent += (event.classResources[0].amount >= 20 ? 20 : event.classResources[0].amount);
      } else if (event.ability.guid === SPELLS.EARTHQUAKE.id) {
          this.maelstromSpent += 50;
      }
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) {
        if (!this.ascendanceCastEventIds.has(event.eventUniqueId + 1)) {
            // On manual Ascendance cast, the applybuff event occurs one event before the cast event, so checking if
            // a cast event exists one place after the applybuff event is a robust way of determining whether an Ascendance
            // buff was manually casted or is a result of a Smoldering Heart proc.
            // Magic number: 10000ms is the duration of the Smoldering Heart Asc proc.
            this.smolderingProcs += 1;
            this.smolderingDuration += 10000;
        }
    }
  }

  item() {
    return {
      id: `item-${ITEMS.SMOLDERING_HEART.id}`,
      icon: <ItemIcon id={ITEMS.SMOLDERING_HEART.id} />,
      title: <ItemLink id={ITEMS.SMOLDERING_HEART.id} />,
      result: (
        <dfn data-tip={`Smoldering Heart proc uptime does not consider Ascendance that you cast yourself. Expected uptime is a very rough estimate based on Maelstrom spent.`}>
        <ul>
            <li>Real uptime: {formatPercentage(this.smoldering_uptime())}%</li>
            <li>Expected uptime: {formatPercentage(this.expected_smoldering_uptime())}%</li>
        </ul>
        </dfn>
      ),
    };
  }
}
export default SmolderingHeart;
