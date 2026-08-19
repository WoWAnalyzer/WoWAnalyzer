import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Mastery from '../core/Mastery';

const DEBUG = false;

class AverageHots extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  statistic() {
    const avgTotalBenefitMult = this.mastery.getAverageMasteryBonusMult().toFixed(2);
    const avgDruidBenefitMult = this.mastery.getAverageDruidSpellMasteryBonusMult().toFixed(2);

    DEBUG && console.log(`Total Healing: ${this.mastery.totalNoMasteryHealing}`);
    DEBUG &&
      console.log(`Total Mastery Effected Healing: ${this.mastery.druidSpellNoMasteryHealing}`);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            <p>
              Mastery Multiplier is the average increase to your healing from Mastery, weighted by
              healing done. For example, if you have 10% Mastery and your healing is increased by an
              average of 17%, this number would be 1.7.
            </p>
            <p>
              This is not a performance metric. It mostly reflects your talent choices and healing
              style. Talents that apply more HoTs will generally increase this number, while healing
              in larger groups will tend to lower it.
            </p>
            <p>
              This number includes all of your healing, including spells that do not benefit from
              Mastery such as Trinkets, potions, and Renewal. If you only look at healing that can
              benefit from Mastery, the average multiplier is <strong>{avgDruidBenefitMult}</strong>
              .
            </p>
            <p>
              <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> splash healing and{' '}
              <SpellLink spell={TALENTS_DRUID.SYMBIOTIC_RELATIONSHIP_TALENT} /> use the Mastery from
              HoTs on the target of the original heal. They do not use the HoTs on the ally who
              receives the resulting heal.
            </p>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.MASTERY_HARMONY} /> Average Mastery benefit
            </>
          }
        >
          <>{avgTotalBenefitMult}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default AverageHots;
