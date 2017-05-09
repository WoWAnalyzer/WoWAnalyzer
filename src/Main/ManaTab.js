import React from 'react';

import Mana from './Mana';

const ManaTab = ({ ...others }) => (
  <div>
    <div className="panel-heading">
      <h2>Mana</h2>
    </div>
    <div style={{ padding: '15px 22px' }}>
      <Mana
        {...others}
      />
    </div>
  </div>
);

export default ManaTab;
