import Analyzer from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { Options } from 'parser/core/Module';
import TreeOfLife from 'analysis/retail/druid/restoration/modules/spells/TreeOfLife';

/**
 * **Potent Enchantments**
 * Hero Talent - Keeper of the Grove
 *
 * Reforestation grants Tree of Life for 6 additional sec.
 */
export default class PotentEnchantments extends Analyzer {
  static dependencies = {
    treeOfLife: TreeOfLife,
  };

  protected treeOfLife!: TreeOfLife;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POTENT_ENCHANTMENTS_TALENT);
  }

  get healing() {
    return this.treeOfLife.getPotentEnchantmentsHealing();
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POTENT_ENCHANTMENTS_TALENT}>
          <ItemPercentHealingDone amount={this.treeOfLife.getPotentEnchantmentsHealing()} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
