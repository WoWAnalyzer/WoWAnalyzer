// Based on Main/ManaTab.js
import React from 'react';

import Maelstrom from './Maelstrom';

const MaelstromTab = ({ ...others }) => (
  <div>
    <div className="panel-heading">
      <h2>Maelstrom</h2>
    </div>
    <div style={{ padding: '15px 22px' }}>
      <Maelstrom
        {...others}
      />
    </div>
  </div>
);

export default MaelstromTab;
