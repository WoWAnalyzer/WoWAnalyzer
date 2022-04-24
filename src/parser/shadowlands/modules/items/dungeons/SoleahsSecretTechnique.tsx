import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, Item } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * ### Example Log:
 *
 * - https://www.warcraftlogs.com/reports/xJRtNYPHG1M7q2yr#fight=1&type=summary&source=2
 */
class SoleahsSecretTechnique extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  item: Item;

  constructor(options: Options) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.SOLEAHS_SECRET_TECHNIQUE.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SOLEAHS_SECRET_TECHNIQUE_FRIEND_BUFF),
      this.onBuff,
    );
  }

  onBuff(event: ApplyBuffEvent) {
    // console.log(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="small"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={this.item}>Versatility</BoringItemValueText>
      </Statistic>
    );
  }
}

export default SoleahsSecretTechnique;
