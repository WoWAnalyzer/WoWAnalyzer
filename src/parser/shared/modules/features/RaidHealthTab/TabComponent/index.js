import React from 'react';
import PropTypes from 'prop-types';

import Panel from 'interface/others/Panel';

import Graph from './Graph';

const Mana = ({ parser }) => (
  <Panel
    title="Raid health"
    explanation="The stacked health of your raid to give an idea of the healing intensity. Most progression raid fights the raid will rarely be topped."
  >
    <Graph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      offset={parser.fight.offset_time}
    />
  </Panel>
);
Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
