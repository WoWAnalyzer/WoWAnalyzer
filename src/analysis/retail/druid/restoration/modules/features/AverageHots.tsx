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

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            This is the average number of mastery stacks your heals benefitted from, weighted by
            healing done. It can help show how valuable mastery was to you during the encounter.
            <br />
            <br />
            This number should not be read as a measure of performance but rather of talent choices
            and healing style. Doing lots of tank healing will increase this number, as will
            speccing Talents that spread extra HoTs around like Cultivation and Spring Blossoms. On
            the other hand, playing in larger groups will tend to reduce average stacks.
            <br />
            <br />
            This number includes all your healing, even heals that don't benefit from mastery (like
            most trinkets). Your average mastery stacks counting only heals that benefit from
            mastery is <strong>{avgDruidHots}</strong>.
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
