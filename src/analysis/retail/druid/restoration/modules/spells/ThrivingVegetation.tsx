import HotTrackerRestoDruid, {
  THRIVING_VEG_ATT_NAME,
} from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

/**
 * **Thriving Vegetation**
 * Spec Talent
 *
 * Rejuvenation instantly heals your target for (15/30)% of its total periodic effect and Regrowth's duration is increased by (3/6) sec.
 */
export default class ThrivingVegetation extends Analyzer.withDependencies({
  hotTracker: HotTrackerRestoDruid,
  abilityTracker: AbilityTracker,
}) {
  rank: number;

  constructor(options: Options) {
    super(options);
    this.rank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.THRIVING_VEGETATION_TALENT);
    this.active = this.rank > 0;
  }

  statistic() {
    const extraDurationHealing =
      this.deps.hotTracker.getAttribution(THRIVING_VEG_ATT_NAME)?.healing || 0;
    const instantRejuvHealing = this.deps.abilityTracker.getAbilityHealing(
      SPELLS.THRIVING_VEGETATION.id,
    );
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the direct healing from Rejuvenation casts and the extra healing from
            the extension to Regrowth.
            <ul>
              <li>
                <SpellLink spell={SPELLS.REJUVENATION} /> Direct:{' '}
                <strong>{this.owner.formatItemHealingDone(instantRejuvHealing)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.REGROWTH} /> Extension:{' '}
                <strong>{this.owner.formatItemHealingDone(extraDurationHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.THRIVING_VEGETATION_TALENT}>
          <ItemPercentHealingDone amount={extraDurationHealing + instantRejuvHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
