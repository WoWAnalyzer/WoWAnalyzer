import React from 'react';
import PropTypes from 'prop-types';

import Panel from 'interface/others/Panel';

import Graph from './Graph';

const Mana = ({ parser }) => (
  <Panel style={{ padding: '15px 22px' }}>
    <h1>Raid health</h1>
    <Graph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      currentTimestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}
  </Panel>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
