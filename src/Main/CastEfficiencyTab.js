import React from 'react';

import CastEfficiency from './CastEfficiency';

const CastEfficiencyTab = ({ ...other }) => (
  <div>
    <div className="panel-heading">
      <h2>Cast efficiency</h2>
    </div>
    <div style={{ padding: '10px 0' }}>
      <CastEfficiency
        {...other}
      />
    </div>
  </div>
);

export default CastEfficiencyTab;
