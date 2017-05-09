import React from 'react';

import PlayerBreakdown from './PlayerBreakdown';

const ManaTab = ({ ...others }) => (
  <div>
    <div className="panel-heading">
      <h2>Mastery effectiveness player breakdown</h2>
    </div>
    <div style={{ padding: '10px 0 15px' }}>
      <PlayerBreakdown
        {...others}
      />
    </div>
  </div>
);

export default ManaTab;
