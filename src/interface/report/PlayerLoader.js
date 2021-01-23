import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import getAverageItemLevel from 'game/getAverageItemLevel';
import getFightName from 'common/getFightName';
import { fetchCombatants, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import ActivityIndicator from 'interface/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';
import { setCombatants } from 'interface/actions/combatants';
import { getPlayerId, getPlayerName } from 'interface/selectors/url/report';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Tooltip from 'interface/Tooltip';
import RaidCompositionDetails from 'interface/report/RaidCompositionDetails';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import AdvancedLoggingWarning from 'interface/report/AdvancedLoggingWarning';
import ReportRaidBuffList from 'interface/ReportRaidBuffList';
import { fetchCharacter } from 'interface/actions/characters';
import { generateFakeCombatantInfo } from 'interface/report/CombatantInfoFaker';
import Panel from 'interface/Panel';

import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import PlayerSelection from './PlayerSelection';
import handleApiError from './handleApiError';

const defaultState = {
  error: null,
  combatants: null,
  combatantsFightId: null,
};

const FAKE_PLAYER_IF_DEV_ENV = false;

class PlayerLoader extends React.PureComponent {
  tanks = 0;
  healers = 0;
  dps = 0;
  ranged = 0;
  ilvl = 0;

  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })),
      exportedCharacters: PropTypes.any,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
      gameVersion: PropTypes.number.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      id: PropTypes.number.isRequired,
      // replace with actual fight interface when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: PropTypes.number.isRequired,
      // eslint-disable-next-line @typescript-eslint/camelcase
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
    fetchCharacter: PropTypes.func.isRequired,
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
    this.scrollToTop();
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

  async loadCombatants(report, fight) {
    if (report.gameVersion === 2) {
      return;
    }
    try {
      const combatants = await fetchCombatants(report.code, fight.start_time, fight.end_time);
      combatants.forEach(player => {
        if (process.env.NODE_ENV === 'development' && FAKE_PLAYER_IF_DEV_ENV) {
          console.error('This player (sourceID: ' + player.sourceID + ') has an error. Because you\'re in development environment, we have faked the missing information, see CombatantInfoFaker.ts for more information.');
          player = generateFakeCombatantInfo(player);
        }
        if (player.error || player.specID === -1) {
          return;
        }
        const friendly = report.friendlies.find(friendly => friendly.id === player.sourceID);
        if (!friendly) {
          console.error('friendly missing from report for player', player.sourceID);
          return;
        }
        switch (SPECS[player.specID].role) {
          case ROLES.TANK:
            this.tanks += 1;
            break;
          case ROLES.HEALER:
            this.healers += 1;
            break;
          case ROLES.DPS.MELEE:
            this.dps += 1;
            break;
          case ROLES.DPS.RANGED:
            this.ranged += 1;
            break;
          default:
            break;
        }
        // Gear may be null for broken combatants
        this.ilvl += player.gear ? getAverageItemLevel(player.gear) : 0;
      });
      this.ilvl /= combatants.length;
      if (this.props.report !== report || this.props.fight !== fight) {
        return; // the user switched report/fight already
      }
      this.setState({
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
      this.setState({
        ...defaultState,
        error,
      });
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(null);
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  renderError(error) {
    return handleApiError(error, () => {
      this.setState(defaultState);
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(null);
      this.props.history.push(makeAnalyzerUrl());
    });
  }

  renderLoading() {
    return (
      <ActivityIndicator text={t({
        id: "interface.report.renderLoading.fetchingPlayerInfo",
        message: `Fetching player info...`
      })} />
    );
  }

  renderClassicWarning() {
    return (
      <div className="container offset">
        <Panel title={<Trans id="interface.report.renderClassicWarning.classicUnsupported">Sorry, Classic WoW Logs are not supported</Trans>}>
          <div className="flex wrapable">
            <div className="flex-main" style={{ minWidth: 400 }}>
              <Trans id="interface.report.renderClassicWarning.classicUnsupportedDetails">
                The current report contains encounters from World of Warcraft: Classic. Currently WoWAnalyzer does not support, and does not have plans to support, Classic WoW logs.
              </Trans><br /><br />
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  render() {
    const { report, fight, playerName, playerId } = this.props;

    const error = this.state.error;
    if (error) {
      return this.renderError(error);
    }

    if (report.gameVersion === 2) {
      return this.renderClassicWarning();
    }

    const combatants = this.state.combatants;
    if (!combatants) {
      return this.renderLoading();
    }

    const reportDuration = report.end - report.start;

    const players = playerId ? report.friendlies.filter(friendly => friendly.id === playerId) : report.friendlies.filter(friendly => friendly.name === playerName);
    const player = players[0];
    const hasDuplicatePlayers = players.length > 1;
    const combatant = player && combatants.find(combatant => combatant.sourceID === player.id);
    if (!player || hasDuplicatePlayers || !combatant || !combatant.specID || combatant.error) {
      if (player) {
        // Player data was in the report, but there was another issue
        if (hasDuplicatePlayers) {
          alert(t({
            id: "interface.report.render.hasDuplicatePlayers",
            message: `It appears like another "${playerName}" is in this log, please select the correct one`
          }));
        } else if (!combatant) {
          alert(t({
            id: "interface.report.render.dataNotAvailable",
            message: `Player data does not seem to be available for the selected player in this fight.`
          }));
        } else if (combatant.error || !combatant.specID) {
          alert(t({
            id: "interface.report.render.logCorrupted",
            message: `The data received from WCL for this player is corrupt, this player can not be analyzed in this fight.`
          }));
        }
      }
      return (
        <div className="container offset">
          <div style={{ position: 'relative', marginBottom: 15 }}>
            <div className="back-button">
              <Tooltip content={t({
                id: "interface.report.render.backToFightSelection",
                message: `Back to fight selection`
              })}>
                <Link to={`/report/${report.code}`}>
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}<Trans id="interface.report.render.labelFightSelection">Fight selection</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <div className="flex wrapable" style={{ marginBottom: 15 }}>
              <div className="flex-main">
                <h1 style={{ lineHeight: 1.4, margin: 0 }}><Trans id="interface.report.render.playerSelection">Player selection</Trans></h1>
                <small style={{ marginTop: -5 }}><Trans id="interface.report.render.playerSelectionDetails">Select the player you wish to analyze.</Trans></small>
              </div>
              <div className="flex-sub">
                <RaidCompositionDetails
                  tanks={this.tanks}
                  healers={this.healers}
                  dps={this.dps}
                  ranged={this.ranged}
                  ilvl={this.ilvl}
                />
              </div>
            </div>
          </div>

          {fight.end_time > MAX_REPORT_DURATION &&
          <ReportDurationWarning duration={reportDuration} />}

          {combatants.length === 0 && <AdvancedLoggingWarning />}

          <PlayerSelection
            players={report.friendlies.map(friendly => {
              const combatant = combatants.find(combatant => combatant.sourceID === friendly.id);
              if (!combatant) {
                return null;
              }
              const exportedCharacter = report.exportedCharacters ? report.exportedCharacters.find(char => char.name === friendly.name) : null;

              return {
                ...friendly,
                combatant,
                server: exportedCharacter ? exportedCharacter.server : undefined,
                region: exportedCharacter ? exportedCharacter.region : undefined,
              };
            }).filter(friendly => friendly !== null)}
            makeUrl={playerId => makeAnalyzerUrl(report, fight.id, playerId)}
          />
          <ReportRaidBuffList
            combatants={combatants}
          />
        </div>
      );
    }

    return <>
      {/* TODO: Refactor the DocumentTitle away */}
      <DocumentTitle title={t({
        id: "interface.report.render.documentTitle",
        message: `${getFightName(report, fight)} by ${player.name} in ${report.title}`
      })} />

      {this.props.children(player, combatant, combatants)}
    </>;
  }
}

const mapStateToProps = (state, props) => ({
  playerName: getPlayerName(props.location.pathname),
  playerId: getPlayerId(props.location.pathname),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setCombatants,
    fetchCharacter,
  }),
)(PlayerLoader);
