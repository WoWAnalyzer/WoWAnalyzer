import React from 'react';

import PlayerSelectionPanelList from './PlayerSelectionPanelList';

class PlayerSelectionPanel extends React.PureComponent {
  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>Select the player you wish to analyze</h2>
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
