import React from 'react';
import PropTypes from 'prop-types';

import ManaLevelGraph from 'Main/ManaLevelGraph';

const Mana = ({ parser }) => (
  <div>
    <h1>Mana pool</h1>
    <ManaLevelGraph
      reportCode={parser.report.code}
      actorId={parser.playerId}
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      manaUpdates={parser.modules.manaValues.manaUpdates}
      currentTimestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}

  </div>
);

Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
