import React from 'react';

import SoulShardBreakdown from './SoulShardBreakdown';

const SoulShardTab = ({ ...others }) => (
  <div>
    <div className="panel-heading">
      <h2>Soul Shard usage breakdown</h2>
    </div>
    <div style={{ padding: '10px 0 15px' }}>
      <SoulShardBreakdown
        {...others}
      />
    </div>
  </div>
);

export default SoulShardTab;
