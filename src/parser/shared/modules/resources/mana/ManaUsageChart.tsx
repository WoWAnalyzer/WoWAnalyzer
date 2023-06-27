
import Analyzer from 'parser/core/Analyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import Panel from 'parser/ui/Panel';

import ManaUsageChartComponent from './ManaUsageChartComponent';

/**
 * @property {ManaValues} manaValues
 * @property {HealingDone} healingDone
 */
class ManaUsageChart extends Analyzer {
  static dependencies = {
    manaValues: ManaValues,
    healingDone: HealingDone,
  };

  protected manaValues!: ManaValues;
  protected healingDone!: HealingDone;

  statistic() {
    const start = this.owner.fight.start_time;
    const end = this.owner.fight.end_time;
    const offset = this.owner.fight.offset_time;

    return (
      <Panel
        title={<>Mana usage</>}
        explanation={
          <>
            This shows you your mana usage in correlation with your throughput. Big spikes in mana
            usage without increases in throughput may indicate poor mana usage. The scale for both
            mana lines is 0-100% where 100% is aligned with the max HPS throughput.
          </>
        }
        position={110}
      >
        <ManaUsageChartComponent
          start={start}
          end={end}
          offset={offset}
          manaUpdates={this.manaValues.manaUpdates}
          healingBySecond={this.healingDone.bySecond}
        />
      </Panel>
    );
  }
}

export default ManaUsageChart;
