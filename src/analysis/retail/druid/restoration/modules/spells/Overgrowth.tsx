import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';

/**
 * **Overgrowth**
 * Spec Talent
 *
 * Apply Lifebloom, Rejuvenation, Wild Growth, and Regrowth's heal over time effects to an ally.
 */
class Overgrowth extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
    abilityTracker: AbilityTracker,
  };

  hotAttributor!: HotAttributor;
  abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.OVERGROWTH_TALENT);
  }

  get averageHealingPerCast() {
    const casts = this.abilityTracker.getAbility(TALENTS_DRUID.OVERGROWTH_TALENT.id).casts;
    return casts === 0 ? 0 : this.hotAttributor.overgrowthAttrib.healing / casts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            In overall numbers this talent is typically very weak in raid, and you'd be better off
            taking <SpellLink spell={TALENTS_DRUID.SPRING_BLOSSOMS_TALENT} /> instead. Its sole use
            is high HPCT tank healing in dungeons to allow more DPS time.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.OVERGROWTH_TALENT}>
          {formatNumber(this.averageHealingPerCast)}
          <small> avg. effective healing per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Overgrowth;
