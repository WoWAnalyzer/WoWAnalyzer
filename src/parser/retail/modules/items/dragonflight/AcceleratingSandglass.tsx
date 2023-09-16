import ITEMS from 'common/ITEMS/dragonflight';
import SPELLS from 'common/SPELLS/dragonflight/trinkets';
import { formatNumber, formatPercentage } from 'common/format';
import { DamageIcon, HasteIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, Item } from 'parser/core/Events';
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
  damageCount = 0;
  totalDamage = 0;

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

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ACCELERATING_SANDGLASS_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damageCount += 1;
    this.totalDamage += event.amount + (event.absorbed || 0);
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
            {averageHaste} haste over the duration of the fight.
            <br />
            <br />
            Damage triggered {this.damageCount} times for an average of{' '}
            {formatNumber(this.totalDamage / this.damageCount)} per time, and a total of{' '}
            {formatNumber(this.totalDamage)} damage.
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          <div>
            <HasteIcon /> {averageHaste} <small>haste on average</small>
          </div>
          <div>
            <DamageIcon /> {formatNumber(this.owner.getPerSecond(this.totalDamage))} DPS{' '}
            <small>
              {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))}%
            </small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default AcceleratingSandglass;
