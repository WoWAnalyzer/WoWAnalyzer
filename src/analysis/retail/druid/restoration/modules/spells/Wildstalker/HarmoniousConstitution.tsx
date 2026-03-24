import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';

const HARMONIOUS_CONSTITUTION_HEALING_INCREASE = 0.35;

/**
 * **Harmonious Constitution**
 * Hero Talent - Wildstalker
 *
 * Your Regrowth's healing to yourself is increased by 35%.
 */
export default class HarmoniousConstitution extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.HARMONIOUS_CONSTITUTION_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (event.targetID !== this.selectedCombatant.id) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, HARMONIOUS_CONSTITUTION_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.HARMONIOUS_CONSTITUTION_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
