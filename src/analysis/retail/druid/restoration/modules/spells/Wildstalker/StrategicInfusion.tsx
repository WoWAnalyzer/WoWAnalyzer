import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealingFromCritIncrease } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import StatTracker from 'parser/shared/modules/StatTracker';

const STRATEGIC_INFUSION_INCREASED_CRIT_CHANCE = 0.04;

/**
 * **Strategic Infusion**
 * Hero Talent - Wildstalker
 *
 * Your periodic heals have a 4% increased chance to critically heal.
 */
export default class StrategicInfusion extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STRATEGIC_INFUSION_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }

    const currentCrit = Math.min(1, this.statTracker.currentCritPercentage);
    const strategicInfusionCritBonus = Math.min(
      1 - currentCrit,
      STRATEGIC_INFUSION_INCREASED_CRIT_CHANCE,
    );

    if (strategicInfusionCritBonus <= 0) {
      return;
    }

    this.healing += calculateEffectiveHealingFromCritIncrease(
      event,
      currentCrit,
      strategicInfusionCritBonus,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.STRATEGIC_INFUSION_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
