import { Trans, t } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import { fetchCombatants, LogNotFoundError } from 'common/fetchWclApi';
import getFightName from 'common/getFightName';
import getAverageItemLevel from 'game/getAverageItemLevel';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import { fetchCharacter } from 'interface/actions/characters';
import { setCombatants } from 'interface/actions/combatants';
import ActivityIndicator from 'interface/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Panel from 'interface/Panel';
import { RootState } from 'interface/reducers';
import AdvancedLoggingWarning from 'interface/report/AdvancedLoggingWarning';
import { generateFakeCombatantInfo } from 'interface/report/CombatantInfoFaker';
import RaidCompositionDetails from 'interface/report/RaidCompositionDetails';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import ReportRaidBuffList from 'interface/ReportRaidBuffList';
import { getPlayerId, getPlayerName } from 'interface/selectors/url/report';
import Tooltip from 'interface/Tooltip';
import CharacterProfile from 'parser/core/CharacterProfile';
import { CombatantInfoEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import getConfig from 'parser/getConfig';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import handleApiError from './handleApiError';
import PlayerSelection from './PlayerSelection';

const FAKE_PLAYER_IF_DEV_ENV = false;

interface ConnectedProps extends RouteComponentProps {
  setCombatants: (combatants: CombatantInfoEvent[] | null) => void;
  playerName: string | null;
  playerId: number | null;
  fetchCharacter: (guid: number, region: string, realm: string, name: string) => CharacterProfile;
}

interface PassedProps {
  report: Report;
  fight: WCLFight;
  children: (
    player: PlayerInfo,
    combatant: CombatantInfoEvent,
    combatants: CombatantInfoEvent[],
  ) => React.ReactNode;
}

type Props = ConnectedProps & PassedProps;

interface State {
  error: Error | null;
  combatants: CombatantInfoEvent[] | null;
  combatantsFightId: number | null;
}

const defaultState: State = {
  error: null,
  combatants: null,
  combatantsFightId: null,
};

class PlayerLoader extends React.PureComponent<Props, State> {
  tanks = 0;
  healers = 0;
  dps = 0;
  ranged = 0;
  ilvl = 0;

  static getDerivedStateFromProps(props: Props, state: State) {
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    const changedReport = this.props.report !== prevProps.report;
    const changedFight = this.props.fight !== prevProps.fight;
    if (changedReport || changedFight) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadCombatants(this.props.report, this.props.fight);
    }
    if (
      this.props.playerId &&
      (!this.props.playerName || this.props.playerName === `${this.props.playerId}`)
    ) {
      this.props.history.replace(
        makeAnalyzerUrl(this.props.report, this.props.fight.id, this.props.playerId),
      );
    }
  }

  async loadCombatants(report: Report, fight: WCLFight) {
    if (report.gameVersion === 2) {
      return;
    }
    try {
      const combatants = (await fetchCombatants(
        report.code,
        fight.start_time,
        fight.end_time,
      )) as CombatantInfoEvent[];
      combatants.forEach((combatant) => {
        if (process.env.NODE_ENV === 'development' && FAKE_PLAYER_IF_DEV_ENV) {
          console.error(
            `This player (sourceID: ${combatant.sourceID!}) has an error. Because you're in development environment, we have faked the missing information, see CombatantInfoFaker.ts for more information.`,
          );
          combatant = generateFakeCombatantInfo(combatant);
        }
        if (combatant.error || combatant.specID === -1) {
          return;
        }
        const player = report.friendlies.find((friendly) => friendly.id === combatant.sourceID);
        if (!player) {
          console.error('friendly missing from report for player', combatant.sourceID);
          return;
        }
        combatant.player = player;
        if (SPECS[combatant.specID]) {
          // TODO: TBC support: specID is always null, so look at talents to figure out the most likely spec. Or use friendly.icon. Then make a table that has roles for that. Cumbersome, but not too difficult.
          // TODO: Move this code to the component that renders the tanks/healers/dps/ranged
          switch (SPECS[combatant.specID].role) {
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
        }
        // Gear may be null for broken combatants
        this.ilvl += combatant.gear ? getAverageItemLevel(combatant.gear) : 0;
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

  renderError(error: Error) {
    return handleApiError(error, () => {
      this.setState(defaultState);
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      this.props.setCombatants(null);
      this.props.history.push(makeAnalyzerUrl());
    });
  }

  renderLoading() {
    return (
      <ActivityIndicator
        text={t({
          id: 'interface.report.renderLoading.fetchingPlayerInfo',
          message: `Fetching player info...`,
        })}
      />
    );
  }

  renderClassicWarning() {
    return (
      <div className="container offset">
        <Panel
          title={
            <Trans id="interface.report.renderClassicWarning.classicUnsupported">
              Sorry, Classic WoW Logs are not supported
            </Trans>
          }
        >
          <div className="flex wrapable">
            <div className="flex-main" style={{ minWidth: 400 }}>
              <Trans id="interface.report.renderClassicWarning.classicUnsupportedDetails">
                The current report contains encounters from World of Warcraft: Classic. Currently
                WoWAnalyzer does not support, and does not have plans to support, Classic WoW logs.
              </Trans>
              <br />
              <br />
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

    const players = playerId
      ? report.friendlies.filter((friendly) => friendly.id === playerId)
      : report.friendlies.filter((friendly) => friendly.name === playerName);
    const player = players[0];
    const hasDuplicatePlayers = players.length > 1;
    const combatant = player && combatants.find((combatant) => combatant.sourceID === player.id);
    const config =
      combatant &&
      getConfig(wclGameVersionToExpansion(report.gameVersion), combatant.specID, player.type);
    if (!player || hasDuplicatePlayers || !combatant || !config || combatant.error) {
      if (player) {
        // Player data was in the report, but there was another issue
        if (hasDuplicatePlayers) {
          alert(
            t({
              id: 'interface.report.render.hasDuplicatePlayers',
              message: `It appears like another "${playerName}" is in this log, please select the correct one`,
            }),
          );
        } else if (!combatant) {
          alert(
            t({
              id: 'interface.report.render.dataNotAvailable',
              message: `Player data does not seem to be available for the selected player in this fight.`,
            }),
          );
        } else if (combatant.error || (!combatant.specID && combatant.specID !== 0)) {
          alert(
            t({
              id: 'interface.report.render.logCorrupted',
              message: `The data received from WCL for this player is corrupt, this player can not be analyzed in this fight.`,
            }),
          );
        } else if (!config) {
          alert(
            t({
              id: 'interface.report.render.notSupported',
              message: `This spec is not supported for this expansion.`,
            }),
          );
        }
      }

      return (
        <div className="container offset">
          <div style={{ position: 'relative', marginBottom: 15 }}>
            <div className="back-button">
              <Tooltip
                content={t({
                  id: 'interface.report.render.backToFightSelection',
                  message: `Back to fight selection`,
                })}
              >
                <Link to={`/report/${report.code}`}>
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}
                    <Trans id="interface.report.render.labelFightSelection">Fight selection</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <div className="flex wrapable" style={{ marginBottom: 15 }}>
              <div className="flex-main">
                <h1 style={{ lineHeight: 1.4, margin: 0 }}>
                  <Trans id="interface.report.render.playerSelection">Player selection</Trans>
                </h1>
                <small style={{ marginTop: -5 }}>
                  <Trans id="interface.report.render.playerSelectionDetails">
                    Select the player you wish to analyze.
                  </Trans>
                </small>
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

          {fight.end_time > MAX_REPORT_DURATION && (
            <ReportDurationWarning duration={reportDuration} />
          )}

          {combatants.length === 0 && <AdvancedLoggingWarning />}

          <PlayerSelection
            report={report}
            combatants={combatants}
            makeUrl={(playerId) => makeAnalyzerUrl(report, fight.id, playerId)}
          />
          <ReportRaidBuffList combatants={combatants} />
        </div>
      );
    }

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle
          title={t({
            id: 'interface.report.render.documentTitle',
            message: `${getFightName(report, fight)} by ${player.name} in ${report.title}`,
          })}
        />

        {this.props.children(player, combatant, combatants)}
      </>
    );
  }
}

const mapStateToProps = (state: RootState, props: RouteComponentProps) => ({
  playerName: getPlayerName(props.location.pathname),
  playerId: getPlayerId(props.location.pathname),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setCombatants,
    fetchCharacter,
  }),
)(PlayerLoader) as React.ComponentType<PassedProps>;
