import React from 'react';
import { Trans } from '@lingui/macro';

import PlayerSelectionPanelList from './PlayerSelectionPanelList';

class PlayerSelectionPanel extends React.PureComponent {
  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2><Trans>Select the player you wish to analyze</Trans></h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <PlayerSelectionPanelList
            {...this.props}
          />
        </div>
      </div>
    );
  }
}

export default PlayerSelectionPanel;
