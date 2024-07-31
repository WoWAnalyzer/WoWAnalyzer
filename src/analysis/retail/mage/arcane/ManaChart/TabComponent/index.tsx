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
    <div>
      <>
        Playing Arcane well typically involves managing your mana properly. Things such as not going
        OOM during Arcane Surge, not letting your mana cap, and ensuring you end the fight with as
        little mana as possible will all help in improving your DPS.
      </>
    </div>
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
