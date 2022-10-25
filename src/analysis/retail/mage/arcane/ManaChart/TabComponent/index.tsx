import { Panel } from 'interface';
import ManaValues from 'parser/shared/modules/ManaValues';
import PropTypes from 'prop-types';

import ManaLevelGraph from './ManaLevelGraph';

const Mana = ({ parser }: any) => (
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
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
