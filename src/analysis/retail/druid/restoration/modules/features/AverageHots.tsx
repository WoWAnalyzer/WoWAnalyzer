import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Mastery from '../core/Mastery';

class AverageHots extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  statistic() {
    const avgTotalHots = this.mastery.getAverageTotalMasteryStacks().toFixed(2);
    const avgDruidHots = this.mastery.getAverageDruidSpellMasteryStacks().toFixed(2);

    console.log(`Total Healing: ${this.mastery.totalNoMasteryHealing}`);
    console.log(`Total Mastery Effected Healing: ${this.mastery.druidSpellNoMasteryHealing}`);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            <p>
              This is the average effective number of mastery stacks your heals benefitted from,
              weighted by healing done.
            </p>
            <p>
              This number should not be read as a performance metric but rather a function of talent
              choices and healing style. Talents that spread extra HoTs like Cultivation or Spring
              Blossoms will increase this number, while playing in larger groups will tend to reduce
              this number.
            </p>
            <p>
              This number includes all your healing, even heals that don't benefit from mastery
              (like Trinkets, potions, Renewal, etc..) Your average mastery stacks counting only
              heals that benefit from mastery is <strong>{avgDruidHots}</strong>.
            </p>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.MASTERY_HARMONY} /> Average Mastery stacks
            </>
          }
        >
          <>{avgTotalHots}</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default AverageHots;
