import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const POWER_OF_NATURE_HEALING_INCREASE = 0.1;

/**
 * **Power of Nature**
 * Hero Talent - Keeper of the Grove
 *
 * Your Grove Guardians increase the healing of your Rejuvenation, Efflorescence, and Lifebloom by 10% while active.
 */
export default class PowerOfNature extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_NATURE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.REJUVENATION,
          SPELLS.REJUVENATION_GERMINATION,
          SPELLS.EFFLORESCENCE_HEAL,
          SPELLS.LIFEBLOOM_HOT_HEAL,
          SPELLS.LIFEBLOOM_BLOOM_HEAL,
        ]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.POWER_OF_NATURE.id);
    if (stacks === 0) {
      return;
    }

    this.totalHealing += calculateEffectiveHealing(
      event,
      POWER_OF_NATURE_HEALING_INCREASE * stacks,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POWER_OF_NATURE_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
