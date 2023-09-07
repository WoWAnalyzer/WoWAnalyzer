import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotAttributor from 'analysis/retail/druid/restoration/modules/core/hottracking/HotAttributor';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * **Luxuriant Soil**
 * Spec Talent Tier 9 - 2 Points
 *
 * Rejuvenation healing has a 1%/2% chance to create a new Rejuvenation on a nearby target.
 */
class LuxuriantSoil extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
  };

  hotAttributor!: HotAttributor;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LUXURIANT_SOIL_TALENT);
  }

  get procs() {
    return this.hotAttributor.luxuriantSoilAttrib.procs;
  }

  get procsPerMinute() {
    return this.procs / (this.owner.fightDuration / 60 / 1000);
  }

  get healing() {
    return this.hotAttributor.luxuriantSoilAttrib.healing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the healing attributable to rejuvenations spawned by the Luxuriant Soil talent.
            This amount includes the mastery benefit.
            <ul>
              <li>
                Total Procs: <strong>{this.procs}</strong>
              </li>
              <li>
                Procs per Minute: <strong>{this.procsPerMinute.toFixed(1)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.LUXURIANT_SOIL_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LuxuriantSoil;
