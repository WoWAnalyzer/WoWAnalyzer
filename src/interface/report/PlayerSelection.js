import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import getFightName from 'common/getFightName';
import { fetchCombatants, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import ActivityIndicator from 'interface/common/ActivityIndicator';
import DocumentTitle from 'interface/common/DocumentTitle';
import { setCombatants } from 'interface/actions/combatants';
import { getPlayerId, getPlayerName } from 'interface/selectors/url/report';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import PlayerSelectionPanel from './PlayerSelectionPanel';
import handleApiError from './handleApiError';

const defaultState = {
  error: null,
  combatants: null,
  combatantsFightId: null,
};

class PlayerSelection extends React.PureComponent {
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
    fight: PropTypes.shape({
      id: PropTypes.number.isRequired,
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
    }).isRequired,
    setCombatants: PropTypes.func.isRequired,
    playerName: PropTypes.string,
    playerId: PropTypes.number,
    children: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
    }).isRequired,
  };
  static getDerivedStateFromProps(props, state) {
    if (props.fight.id !== state.combatantsFightId) {
      // When switching fights we need to unset combatants before rendering to avoid children from doing API calls twice
      return defaultState;
    }
    return state;
  }
  state = defaultState;

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.loadCombatants(this.props.report, this.props.fight);
  }
  componentDidUpdate(prevProps, prevState, prevContext) {
    const changedReport = this.props.report !== prevProps.report;
    const changedFight = this.props.fight !== prevProps.fight;
    if (changedReport || changedFight) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadCombatants(this.props.report, this.props.fight);
    }
    if (this.props.playerId && (!this.props.playerName || this.props.playerName === `${this.props.playerId}`)) {
      this.props.history.replace(makeAnalyzerUrl(this.props.report, this.props.fight.id, this.props.playerId));
    }
  }
  componentWillUnmount() {
    ReactTooltip.hide();
  }
  async loadCombatants(report, fight) {
    try {
      const combatants = await fetchCombatants(report.code, fight.start_time, fight.end_time);
      if (this.props.report !== report || this.props.fight !== fight) {
        return; // the user switched report/fight already
      }
      super.setState({
        ...defaultState,
        combatants,
        combatantsFightId: fight.id,
      });
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(combatants);
    } catch (error) {
      const isCommonError = error instanceof LogNotFoundError;
      if (!isCommonError) {
        captureException(error);
      }
      super.setState({
        ...defaultState,
        error,
      });
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(null);
    }
  }

  renderError(error) {
    return handleApiError(error, () => {
      super.setState(defaultState);
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(null);
      this.props.history.push(makeAnalyzerUrl());
    });
  }
  renderLoading() {
    return <ActivityIndicator text="Fetching player info..." />;
  }
  render() {
    const { report, fight, playerName, playerId } = this.props;

    const error = this.state.error;
    if (error) {
      return this.renderError(error);
    }

    const combatants = this.state.combatants;
    if (!combatants) {
      return this.renderLoading();
    }

    const players = playerId ? report.friendlies.filter(friendly => friendly.id === playerId) : report.friendlies.filter(friendly => friendly.name === playerName);
    const player = players[0];
    const hasDuplicatePlayers = players.length > 1;
    const combatant = player && combatants.find(combatant => combatant.sourceID === player.id);
    if (!player || hasDuplicatePlayers || !combatant || !combatant.specID) {
      if (player) {
        // Player data was in the report, but there was another issue
        if (hasDuplicatePlayers) {
          alert(`It appears like another "${playerName}" is in this log, please select the correct one`);
        } else if (!combatant) {
          alert('Player data does not seem to be available for the selected player in this fight.');
        } else if (!combatant.specID) {
          alert('The data received from WCL for this player is corrupt, this player can not be analyzed in this fight.');
        }
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

          <PlayerSelectionPanel
            report={report}
            fight={fight}
            combatants={combatants}
          />
        </div>
      );
    }

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle title={`${getFightName(report, fight)} by ${player.name} in ${report.title}`} />

        {this.props.children(player, combatant, combatants)}
      </>
    );
  }
}

const mapStateToProps = state => ({
  playerName: getPlayerName(state),
  playerId: getPlayerId(state),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setCombatants,
  })
)(PlayerSelection);
