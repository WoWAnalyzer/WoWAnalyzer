import Panel from 'interface/Panel';
import PropTypes from 'prop-types';
import React from 'react';

import './FightSelection.scss';
import FightSelectionPanelList from './FightSelectionPanelList';

const FightSelectionPanel = (props) => {
  const { report, killsOnly } = props;

  return (
    <>
      <Panel pad={false}>
        <FightSelectionPanelList report={report} fights={report.fights} killsOnly={killsOnly} />
      </Panel>
    </>
  );
};

FightSelectionPanel.propTypes = {
  report: PropTypes.shape({
    fights: PropTypes.array.isRequired,
  }).isRequired,
  killsOnly: PropTypes.bool.isRequired,
};

export default FightSelectionPanel;
