import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemIcon from 'common/ItemIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

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
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VESSEL_OF_SKITTERING_SHADOWs.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // Do something when the player cast something
    // to see what event holds you can do a console.log:
    console.log(event);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<ItemIcon id={ITEMS.STUPID_ROCK.id} />}
        value={`${formatNumber(this.healing)} %`}
        label="Damage Done"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(40);
}

export default MyCuteRock;
