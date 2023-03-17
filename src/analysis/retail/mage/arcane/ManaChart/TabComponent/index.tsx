import { Panel } from 'interface';
import CombatLogParser from 'parser/core/CombatLogParser';
import ManaValues from 'parser/shared/modules/ManaValues';

import ManaLevelGraph from './ManaLevelGraph';

type props = {
  parser: CombatLogParser;
};

const Mana = ({ parser }: props) => (
  <Panel style={{ padding: '15px 22px' }}>
    <h1>Mana pool</h1>
    <ManaLevelGraph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      offsetTime={parser.fight.offset_time}
      manaUpdates={parser.getModule(ManaValues).manaUpdates}
    />
  </Panel>
);

export default Mana;
