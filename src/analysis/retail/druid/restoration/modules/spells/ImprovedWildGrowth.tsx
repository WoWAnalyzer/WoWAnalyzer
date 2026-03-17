import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';

const WG_BASE_TARGETS = 5;
const IMPROVED_WILD_GROWTH_ADDITIONAL_TARGETS = 2;
const TOL_EXTRA_WG_TARGETS = 2;

/**
 * **Improved Wild Growth**
 * Spec Talent Tier 6
 *
 * Wild Growth heals 2 additional targets.
 */
export default class ImprovedWildGrowth extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  attribution = HotTrackerRestoDruid.getNewAttribution('Improved Wild Growth: Extra Targets');

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPROVED_WILD_GROWTH_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onApplyWildGrowth,
    );
  }

  onApplyWildGrowth(event: ApplyBuffEvent | RefreshBuffEvent) {
    const hasTreeOfLife = this.selectedCombatant.hasBuff(
      TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
      event.timestamp,
    );
    const baselineTargets = WG_BASE_TARGETS + (hasTreeOfLife ? TOL_EXTRA_WG_TARGETS : 0);
    const improvedWildGrowthIncrease = IMPROVED_WILD_GROWTH_ADDITIONAL_TARGETS / baselineTargets;

    this.hotTracker.addBoostFromApply(this.attribution, improvedWildGrowthIncrease, event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Instead of guessing which two extra <strong>Wild Growth</strong> buffs came from this
            talent, we partially count a share of every <strong>Wild Growth</strong> buff toward
            this talent.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.IMPROVED_WILD_GROWTH_TALENT}>
          <ItemPercentHealingDone amount={this.attribution.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
