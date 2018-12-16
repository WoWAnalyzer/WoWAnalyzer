import React from 'react';

import Panel from 'interface/others/Panel';

import PlayerBreakdown from './PlayerBreakdown';

const PlayerBreakdownTab = ({ ...others }) => (
  <Panel style={{ padding: '10px 0 15px' }}>
    <PlayerBreakdown
      {...others}
    />
  </Panel>
);

export default PlayerBreakdownTab;
