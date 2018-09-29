import React from 'react';
import PropTypes from 'prop-types';

import Tab from 'interface/others/Tab';

import Graph from './Graph';

const Mana = ({ parser }) => (
  <Tab style={{ padding: '15px 22px' }}>
    <h1>Raid health</h1>
    <Graph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      currentTimestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}
  </Tab>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
