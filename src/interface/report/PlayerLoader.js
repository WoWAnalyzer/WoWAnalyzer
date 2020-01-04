import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import getAverageItemLevel from 'game/getAverageItemLevel';
import getFightName from 'common/getFightName';
import { fetchCombatants, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import { i18n } from 'interface/RootLocalizationProvider';
import ActivityIndicator from 'interface/common/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';
import { setCombatants } from 'interface/actions/combatants';
import { getPlayerId, getPlayerName } from 'interface/selectors/url/report';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import Tooltip from 'common/Tooltip';
import PlayerSelection from 'interface/report/PlayerSelection';
import RaidCompositionDetails from 'interface/report/RaidCompositionDetails';
import ReportRaidBuffList from 'interface/ReportRaidBuffList';
import { fetchCharacter } from 'interface/actions/characters';
import handleApiError from './handleApiError';

const defaultState = {
  error: null,
  combatants: null,
  combatantsFightId: null,
};

class PlayerLoader extends React.PureComponent {
  tanks = 0;
  healers = 0;
  dps = 0;
  ranged = 0;
  ilvl = 0;
  heartLvl = 0;

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
    let numberOfCombatantsWithLoadedHeart = 0;
    try {
      const { fetchCharacter } = this.props;
      const combatants = await fetchCombatants(report.code, fight.start_time, fight.end_time);
      const characterDataPromises = combatants.map(player => {
        const friendly = report.friendlies.find(friendly => friendly.id === player.sourceID);
        if (!friendly) {
          // unsure why this happens, but it can
          return Promise.resolve();
        }
        const exportedCharacter = report.exportedCharacters ? report.exportedCharacters.find(char => char.name === friendly.name) : null;
        if (!exportedCharacter) {
          return Promise.resolve();
        }
        return fetchCharacter(friendly.guid, exportedCharacter.region, exportedCharacter.server, exportedCharacter.name).then(data => {
          return Promise.resolve(data);
        }).catch(() => {
          // This guy failed to load - this is nice to have data
          // We can ignore this and we'll just drop him from the overall averages later
          return Promise.resolve();
        });
      });
      let characterDatas = await Promise.all(characterDataPromises);
      // Filter for only loaded characterDatas
      characterDatas = characterDatas.filter(value => value);
      combatants.forEach(player => {
        if (player.error || player.specID === -1) {
          return;
        }
        const friendly = report.friendlies.find(friendly => friendly.id === player.sourceID);
        if(!friendly) {
          console.error("friendly missing from report for player", player.sourceID);
          return;
        }
        const characterData = characterDatas ? characterDatas.find(data => data.id === friendly.guid) : null;
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
          default: break;
        }
        // Gear may be null for broken combatants
        this.ilvl += player.gear ? getAverageItemLevel(player.gear) : 0;
        if (characterData && characterData.heartOfAzeroth) {
          numberOfCombatantsWithLoadedHeart++;
          this.heartLvl += characterData.heartOfAzeroth.azeriteItemLevel;
        }
      });
      this.ilvl /= combatants.length;
      if (numberOfCombatantsWithLoadedHeart > 0) {
        this.heartLvl /= numberOfCombatantsWithLoadedHeart;
      }
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
    return <ActivityIndicator text={i18n._(t`Fetching player info...`)} />;
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
    if (!player || hasDuplicatePlayers || !combatant || !combatant.specID || combatant.error) {
      if (player) {
        // Player data was in the report, but there was another issue
        if (hasDuplicatePlayers) {
          alert(i18n._(t`It appears like another "${playerName}" is in this log, please select the correct one`));
        } else if (!combatant) {
          alert(i18n._(t`Player data does not seem to be available for the selected player in this fight.`));
        } else if (combatant.error || !combatant.specID) {
          alert(i18n._(t`The data received from WCL for this player is corrupt, this player can not be analyzed in this fight.`));
        }
      }
      return (
        <div className="container offset">
          <div style={{ position: 'relative', marginBottom: 15 }}>
            <div className="back-button">
              <Tooltip content={i18n._(t`Back to fight selection`)}>
                <Link to={`/report/${report.code}`}>
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}<Trans>Fight selection</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <div className="flex wrapable" style={{ marginBottom: 15 }}>
              <div className="flex-main">
                <h1 style={{ lineHeight: 1.4, margin: 0 }}><Trans>Player selection</Trans></h1>
                <small style={{ marginTop: -5 }}><Trans>Select the player you wish to analyze.</Trans></small>
              </div>
              <div className="flex-sub">
                <RaidCompositionDetails
                  tanks={this.tanks}
                  healers={this.healers}
                  dps={this.dps}
                  ranged={this.ranged}
                  ilvl={this.ilvl}
                  heartLvl={this.heartLvl}
                />
              </div>
            </div>
          </div>
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

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle title={i18n._(t`${getFightName(report, fight)} by ${player.name} in ${report.title}`)} />

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
    fetchCharacter,
  }),
)(PlayerLoader);
