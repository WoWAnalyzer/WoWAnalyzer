import React from 'react';

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

export default TalentsTab;
