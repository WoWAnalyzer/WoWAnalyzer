import React from 'react';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/* Vessel of Skittering Shadows
 * Equip: Your damaging spells have a chance to summon a Volatile Shadeweaver,
 * which creeps towards the target and explodes on contact,
 * dealing 2635 Shadow damage divided evenly among enemies within 8 yards.
 *
 * Item:  https://www.wowhead.com/item=159610/vessel-of-skittering-shadows&bonus=4777:1482
 * Log 1: https://www.warcraftlogs.com/reports/mtnTNQd3jYZcykCH#fight=4&source=26
 * Log 2: https://www.warcraftlogs.com/reports/bmgDAF2NpkCL3aV1#fight=last&source=1
 */
class VesselOfSkitteringShadows extends Analyzer {
  damage = 0;
  totalProcs = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VESSEL_OF_SKITTERING_SHADOWs.id);
  }

  on_byPlayer_cast(event) {
    //const spellId = event.ability.guid;

    this.damage += event.amount + (event.absorbed || 0);
    this.totalProcs += 1;
    
    console.log(event);
  }

  item() {
    return {
      item: ITEMS.VESSEL_OF_SKITTERING_SHADOWs,
      result: (
        <dfn data-tip={`<b>${this.totalProcs}</b> procs, causing <b>${formatNumber(this.damage)}</b> damage.`}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default VesselOfSkitteringShadows;
