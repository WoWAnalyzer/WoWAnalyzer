import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const REGROWTH_HOT_BOOST = 0.5;

/**
 * **Rampant Growth**
 * Spec Talent
 *
 * Regrowth's healing over time is increased by 50%,
 * and it also applies to the target of your Lifebloom.
 */
class RampantGrowth extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    hotAttributor: HotAttributor,
  };

  protected hotTracker!: HotTrackerRestoDruid;
  protected hotAttributor!: HotAttributor;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_GROWTH_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onApplyRegrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onApplyRegrowth,
    );
  }

  onApplyRegrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.hotTracker.addBoostFromApply(
      this.hotAttributor.rampantGrowthAttrib,
      REGROWTH_HOT_BOOST,
      event,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This counts both the healing from Regrowth HoTs that splash onto Lifebloom targets and
            also the boost to the healing on normally applied Regrowth HoTs
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.RAMPANT_GROWTH_TALENT}>
          <ItemPercentHealingDone amount={this.hotAttributor.rampantGrowthAttrib.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RampantGrowth;
