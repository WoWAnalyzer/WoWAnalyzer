import React from 'react';
import PropTypes from 'prop-types';

import Panel from 'interface/others/Panel';

import './FightSelection.scss';
import FightSelectionPanelList from './FightSelectionPanelList';

class FightSelectionPanel extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      fights: PropTypes.array.isRequired,
    }).isRequired,
    killsOnly: PropTypes.bool.isRequired,
  };

  render() {
    const { report, killsOnly } = this.props;

    return (
      <>
        <Panel pad={false}>
          <FightSelectionPanelList
            report={report}
            fights={report.fights}
            killsOnly={killsOnly}
          />
        </Panel>
      </>
    );
  }
}

export default FightSelectionPanel;
