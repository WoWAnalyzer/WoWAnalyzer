import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { getReport } from 'selectors/report';
import { getCombatants } from 'selectors/combatants';

import PlayerSelectionList from './PlayerSelectionList';
import ActivityIndicator from './ActivityIndicator';

class PlayerSelecter extends Component {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    combatants: PropTypes.array,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, combatants } = this.props;

    if (!combatants) {
      return <ActivityIndicator text="Fetching players..." />;
    }

    return (
      <div className="container">
        <h1>
          <div className="back-button">
            <Link to={`/report/${report.code}`} data-tip="Back to fight selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          Player selection
        </h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the player you wish to analyze</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <PlayerSelectionList />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  report: getReport(state),
  combatants: getCombatants(state),
});
export default connect(mapStateToProps)(PlayerSelecter);
