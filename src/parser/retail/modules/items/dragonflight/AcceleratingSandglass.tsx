import ITEMS from 'common/ITEMS/dragonflight';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import { formatNumber } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class AcceleratingSandglass extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  item!: Item;
  hastePerStack!: number;

  constructor(options: Options & { statTracker: StatTracker }) {
    super(options);

    const item = this.selectedCombatant.getItem(ITEMS.ACCELERATING_SANDGLASS.id);
    if (item == null) {
      this.active = false;
      return;
    }
    this.item = item;

    this.hastePerStack = calculateSecondaryStatDefault(421, 93, this.item.itemLevel);

    options.statTracker.add(SPELLS.ACCELERATING_SANDGLASS_DRAINING.id, {
      haste: this.hastePerStack,
    });
  }

  get averageStacks() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.ACCELERATING_SANDGLASS_DRAINING.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    const averageStacks = this.averageStacks;
    const averageHaste = formatNumber(averageStacks * this.hastePerStack);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            During the fight you had an average of {averageStacks.toFixed(1)} stacks, giving{' '}
            {formatNumber(this.hastePerStack)} haste per stack, resulting in an average of{' '}
            {averageHaste} haste over the duration of the fight
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          {averageHaste} <small>haste on average</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default AcceleratingSandglass;
