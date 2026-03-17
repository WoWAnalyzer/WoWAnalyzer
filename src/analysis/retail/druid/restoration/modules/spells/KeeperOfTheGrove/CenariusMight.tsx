import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const CENARIUS_MIGHT_HEALING_INCREASE = 0.2;

/**
 * **Cenarius Might**
 * Hero Talent - Keeper of the Grove
 *
 * Swiftmend healing is increased by 20%.
 */
export default class CenariusMight extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_MIGHT_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND), this.onHeal);
  }

  onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, CENARIUS_MIGHT_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.CENARIUS_MIGHT_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
