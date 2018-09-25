// Note: Based on PlayerSelecter
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getCombatants } from 'Interface/selectors/combatants';
import { getReport } from 'Interface/selectors/report';
import { getFightId, getPlayerName } from 'Interface/selectors/url/report';
import { getFightFromReport } from 'Interface/selectors/fight';
import PlayerSelectionPanelList from 'Interface/Others/Report/PlayerSelectionPanelList';

import SelectorBase from './SelectorBase';

class PlayerSelectorHeader extends SelectorBase {
  static propTypes = {
    selectedPlayerName: PropTypes.string.isRequired,
    report: PropTypes.object.isRequired,
    fight: PropTypes.object.isRequired,
    combatants: PropTypes.array.isRequired,
  };

  render() {
    const { selectedPlayerName, report, fight, combatants, ...others } = this.props;
    delete others.dispatch;
    return (
      <div ref={this.setRef} {...others}>
        <a onClick={this.handleClick}>{selectedPlayerName}</a>
        {this.state.show && (
          <span className="selectorHeader">
            <div className="panel">
              <div className="panel-heading">
                <h2>Select the player you wish to analyze</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }} onClick={this.handleClick}>
                <PlayerSelectionPanelList
                  report={report}
                  fight={fight}
                  combatants={combatants}
                />
              </div>
            </div>
          </span>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const report = getReport(state);
  return {
    selectedPlayerName: getPlayerName(state),
    report,
    fight: getFightFromReport(report, getFightId(state)),
    combatants: getCombatants(state),
  };
};
export default connect(
  mapStateToProps
)(PlayerSelectorHeader);
