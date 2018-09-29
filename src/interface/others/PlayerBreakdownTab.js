import React from 'react';

import Tab from 'interface/others/Tab';

import PlayerBreakdown from './PlayerBreakdown';

const PlayerBreakdownTab = ({ ...others }) => (
  <Tab style={{ padding: '10px 0 15px' }}>
    <PlayerBreakdown
      {...others}
    />
  </Tab>
);

export default PlayerBreakdownTab;
