import React from 'react';

import CooldownOverview from './CooldownOverview';

const CooldownsTab = ({ ...other }) => (
  <div>
    <div className="panel-heading">
      <h2>Cooldown Usages</h2>
    </div>
    <div style={{ padding: '10px 0' }}>
      <CooldownOverview
        {...other}
      />
    </div>
  </div>
);

export default CooldownsTab;
