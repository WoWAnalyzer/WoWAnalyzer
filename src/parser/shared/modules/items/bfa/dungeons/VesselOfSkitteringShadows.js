import React from 'react';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/';
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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.VESSEL_OF_SKITTERING_SHADOWS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WEBWEAVERS_SOUL_GEM_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.VESSEL_OF_SKITTERING_SHADOWS,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default VesselOfSkitteringShadows;
