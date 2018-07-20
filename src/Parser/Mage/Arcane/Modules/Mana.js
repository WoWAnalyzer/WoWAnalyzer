import React from 'react';
import PropTypes from 'prop-types';

import ManaUsageGraph from './ManaUsageGraph';

const Mana = ({ parser }) => (
  <div>
    <h1>Mana usage</h1>
    <ManaUsageGraph
      start={parser.fight.start_time}
      end={parser.fight.end_time}
      damageBySecond={parser._modules.damageDone.bySecond}
      manaUpdates={parser._modules.manaValues.manaUpdates}
      timestamp={parser.currentTimestamp}
    /> {/* the currentTimestamp makes sure the Mana tab re-renders after parsing events */}

  </div>
);

Mana.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default Mana;
