import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

const DREAM_SURGE_BASE_TARGETS = 3;
const POWER_OF_THE_DREAM_ADDITIONAL_TARGETS = 1;

/**
 * **Power of the Dream**
 * Hero Talent - Keeper of the Grove
 *
 * Dream Surge heals 1 additional ally.
 */
export default class PowerOfTheDream extends Analyzer {
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DREAM_BLOOM),
      this.onDreamBloomHeal,
    );
  }

  onDreamBloomHeal(event: HealEvent) {
    const powerOfTheDreamIncrease =
      POWER_OF_THE_DREAM_ADDITIONAL_TARGETS / DREAM_SURGE_BASE_TARGETS;
    this.totalHealing += calculateEffectiveHealing(event, powerOfTheDreamIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POWER_OF_THE_DREAM_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
