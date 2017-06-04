import React from 'react';
import PropTypes from 'prop-types';

import Talents from './Talents';

const TalentsTab = ({ combatant }) => (
  <div>
    <div className="panel-heading">
      <h2>Talents</h2>
    </div>
    <div style={{ padding: '10px 0' }}>
      <Talents
        combatant={combatant}
      />
    </div>
  </div>
);
TalentsTab.propTypes = {
  combatant: PropTypes.object,
};

export default TalentsTab;
