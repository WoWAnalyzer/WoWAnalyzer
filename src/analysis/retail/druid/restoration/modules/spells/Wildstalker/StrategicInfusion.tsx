import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import {
  calculateEffectiveHealingFromCritIncrease,
  calculateOverhealingFromCritIncrease,
} from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';
import { ABUNDANCE_INCREASED_CRIT } from 'analysis/retail/druid/restoration/modules/spells/Abundance';

const STRATEGIC_INFUSION_INCREASED_CRIT_CHANCE = 0.04;
const INTENSITY_CRIT_HEAL_MULTIPLIER = 2.6;

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

  hasAbundance = false;
  hasIntensity = false;

  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STRATEGIC_INFUSION_TALENT);
    this.hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    this.hasIntensity = this.selectedCombatant.hasTalent(TALENTS_DRUID.INTENSITY_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if (!event.tick || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const isRegrowthTick = event.ability.guid === SPELLS.REGROWTH.id;
    let currentCrit = Math.min(1, this.statTracker.currentCritPercentage);

    if (
      isRegrowthTick &&
      this.hasAbundance &&
      this.selectedCombatant.hasOwnBuff(SPELLS.ABUNDANCE_BUFF)
    ) {
      currentCrit = Math.min(1, currentCrit + ABUNDANCE_INCREASED_CRIT);
    }

    const strategicInfusionCritBonus = Math.min(
      1 - currentCrit,
      STRATEGIC_INFUSION_INCREASED_CRIT_CHANCE,
    );

    if (strategicInfusionCritBonus <= 0) {
      return;
    }

    this.healing +=
      this.hasIntensity && isRegrowthTick
        ? calculateEffectiveHealingFromCritIncrease(
            event,
            currentCrit,
            strategicInfusionCritBonus,
            INTENSITY_CRIT_HEAL_MULTIPLIER,
          )
        : calculateEffectiveHealingFromCritIncrease(event, currentCrit, strategicInfusionCritBonus);
    this.overhealing +=
      this.hasIntensity && isRegrowthTick
        ? calculateOverhealingFromCritIncrease(
            event,
            currentCrit,
            strategicInfusionCritBonus,
            INTENSITY_CRIT_HEAL_MULTIPLIER,
          )
        : calculateOverhealingFromCritIncrease(event, currentCrit, strategicInfusionCritBonus);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={<strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.STRATEGIC_INFUSION_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
