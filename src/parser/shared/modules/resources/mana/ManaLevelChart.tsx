
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import Panel from 'parser/ui/Panel';

import ManaLevelChartComponent from './ManaLevelChartComponent';

class ManaLevelChart extends Analyzer {
  static dependencies = {
    manaValues: ManaValues,
    combatants: Combatants,
  };

  protected manaValues!: ManaValues;
  protected combatants!: Combatants;

  statistic() {
    const reportCode = this.owner.report.code;
    const start = this.owner.fight.start_time;
    const end = this.owner.fight.end_time;
    const offset = this.owner.fight.offset_time;

    return (
      <Panel
        title={<>Mana pool</>}
        explanation={
          <>
            Mana (blue) along with boss HP and deaths. As a rule of thumb aim to burn mana about as
            quickly as the boss is losing health. Some fights require specific mana management
            though.
          </>
        }
        position={100}
      >
        <ManaLevelChartComponent
          reportCode={reportCode}
          start={start}
          end={end}
          offset={offset}
          combatants={this.combatants}
          manaUpdates={this.manaValues.manaUpdates}
        />
      </Panel>
    );
  }
}

export default ManaLevelChart;
