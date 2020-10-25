import React from 'react';
import ITEMS from 'common/ITEMS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import SPELLS from 'common/SPELLS/';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';

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
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WEBWEAVERS_SOUL_GEM_DAMAGE), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.VESSEL_OF_SKITTERING_SHADOWS}>
          <ItemDamageDone amount={this.damage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default VesselOfSkitteringShadows;
