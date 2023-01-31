import * as React from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import { t, Trans } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import { fetchCombatants, LogNotFoundError } from 'common/fetchWclApi';
import getFightName from 'common/getFightName';
import getAverageItemLevel from 'game/getAverageItemLevel';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import { isUnsupportedClassicVersion, wclGameVersionToExpansion } from 'game/VERSIONS';
import { setCombatants } from 'interface/actions/combatants';
import ActivityIndicator from 'interface/ActivityIndicator';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Panel from 'interface/Panel';
import AdvancedLoggingWarning from 'interface/report/AdvancedLoggingWarning';
import { generateFakeCombatantInfo } from 'interface/report/CombatantInfoFaker';
import RaidCompositionDetails from 'interface/report/RaidCompositionDetails';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import ReportRaidBuffList from 'interface/ReportRaidBuffList';
import Tooltip from 'interface/Tooltip';
import { CombatantInfoEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import Report from 'parser/core/Report';
import getBuild from 'parser/getBuild';
import getConfig from 'parser/getConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PlayerProvider } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import { useFight } from 'interface/report/context/FightContext';
import DocumentTitle from 'interface/DocumentTitle';

import handleApiError from './handleApiError';
import PlayerSelection from './PlayerSelection';
import { getPlayerIdFromParam } from 'interface/selectors/url/report/getPlayerId';
import { getPlayerNameFromParam } from 'interface/selectors/url/report/getPlayerName';

const FAKE_PLAYER_IF_DEV_ENV = false;

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  combatants: CombatantInfoEvent[] | null;
  combatantsFightId: number | null;
  tanks: number;
  healers: number;
  dps: number;
  ranged: number;
  ilvl: number;
}

const defaultState: State = {
  error: null,
  combatants: null,
  combatantsFightId: null,
  tanks: 0,
  healers: 0,
  dps: 0,
  ranged: 0,
  ilvl: 0,
};

type Action =
  | { type: 'reset' }
  | {
      type: 'update_composition';
      tanks: number;
      healers: number;
      dps: number;
      ranged: number;
      ilvl: number;
    }
  | { type: 'set_combatants'; combatants: CombatantInfoEvent[]; combatantsFightId: number }
  | { type: 'set_error'; error: Error };

const fcReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return { ...defaultState };
    case 'update_composition':
      return {
        ...state,
        tanks: action.tanks,
        healers: action.healers,
        dps: action.dps,
        ranged: action.ranged,
        ilvl: action.ilvl,
      };
    case 'set_combatants':
      return {
        ...state,
        combatants: action.combatants,
        combatantsFightId: action.combatantsFightId,
      };
    case 'set_error':
      return { ...defaultState, error: action.error };
    default:
      return { ...state };
  }
};

const PlayerLoader = ({ children }: Props) => {
  const [{ error, combatants, combatantsFightId, tanks, healers, dps, ranged, ilvl }, dispatchFC] =
    useReducer(fcReducer, defaultState);
  const { report: selectedReport } = useReport();
  const { fight: selectedFight } = useFight();
  const { player: playerParam } = useParams();
  const navigate = useNavigate();
  const playerId = getPlayerIdFromParam(playerParam);
  const playerName = getPlayerNameFromParam(playerParam);

  const loadCombatants = useCallback(
    async (report: Report, fight: WCLFight) => {
      if (isUnsupportedClassicVersion(report.gameVersion)) {
        return;
      }

      try {
        const combatants = (await fetchCombatants(
          report.code,
          fight.start_time,
          fight.end_time,
        )) as CombatantInfoEvent[];

        let combatantsWithGear = 0;
        let tanks = 0;
        let healers = 0;
        let dps = 0;
        let ranged = 0;
        let ilvl = 0;

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
                tanks += 1;
                break;
              case ROLES.HEALER:
                healers += 1;
                break;
              case ROLES.DPS.MELEE:
                dps += 1;
                break;
              case ROLES.DPS.RANGED:
                ranged += 1;
                break;
              default:
                break;
            }
          }

          // Gear may be null for broken combatants
          const combatantILvl = combatant.gear ? getAverageItemLevel(combatant.gear) : 0;
          if (combatantILvl !== 0) {
            combatantsWithGear += 1;
            ilvl += combatantILvl;
          }
        });
        ilvl /= combatantsWithGear;
        dispatchFC({ type: 'update_composition', tanks, healers, dps, ranged, ilvl });
        if (selectedReport !== report || selectedFight !== fight) {
          return; // the user switched report/fight already
        }
        dispatchFC({ type: 'set_combatants', combatants, combatantsFightId: fight.id });
        // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
        setCombatants(combatants);
      } catch (error) {
        const isCommonError = error instanceof LogNotFoundError;
        if (!isCommonError) {
          captureException(error as Error);
        }
        dispatchFC({ type: 'set_error', error: error as Error });
        // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
        setCombatants(null);
      }
    },
    [selectedFight, selectedReport],
  );

  useEffect(() => {
    if (selectedFight.id !== combatantsFightId) {
      dispatchFC({ type: 'reset' });
    }
  }, [combatantsFightId, selectedFight.id]);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    loadCombatants(selectedReport, selectedFight);
  }, [loadCombatants, selectedReport, selectedFight]);

  useEffect(() => {
    // scroll to top of window
    window.scrollTo(0, 0);
  }, []);

  const renderError = (error: Error) => {
    return handleApiError(error, () => {
      dispatchFC({ type: 'reset' });
      // We need to set the combatants in the global state so the NavigationBar, which is not a child of this component, can also use it
      setCombatants(null);
      navigate(makeAnalyzerUrl());
    });
  };

  const renderLoading = () => {
    return (
      <ActivityIndicator
        text={t({
          id: 'interface.report.renderLoading.fetchingPlayerInfo',
          message: `Fetching player info...`,
        })}
      />
    );
  };

  const renderClassicWarning = () => {
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
  };

  if (error) {
    return renderError(error);
  }

  if (isUnsupportedClassicVersion(selectedReport.gameVersion)) {
    return renderClassicWarning();
  }

  if (!combatants) {
    return renderLoading();
  }

  const reportDuration = selectedReport.end - selectedReport.start;

  const players = playerId
    ? selectedReport.friendlies.filter((friendly) => friendly.id === playerId)
    : selectedReport.friendlies.filter((friendly) => friendly.name === playerName);
  const player = players[0];
  const hasDuplicatePlayers = players.length > 1;
  const combatant = player && combatants.find((combatant) => combatant.sourceID === player.id);
  const config =
    combatant &&
    getConfig(
      wclGameVersionToExpansion(selectedReport.gameVersion),
      combatant.specID,
      player,
      combatant,
    );
  const build = combatant && getBuild(config, combatant);
  const missingBuild = config?.builds && !build;
  if (!player || hasDuplicatePlayers || !combatant || !config || missingBuild || combatant.error) {
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
      } else if (!config || missingBuild) {
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
              <Link to={`/report/${selectedReport.code}`}>
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
                tanks={tanks}
                healers={healers}
                dps={dps}
                ranged={ranged}
                ilvl={ilvl}
              />
            </div>
          </div>
        </div>

        {selectedFight.end_time > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {combatants.length === 0 && <AdvancedLoggingWarning />}

        <PlayerSelection
          report={selectedReport}
          combatants={combatants}
          makeUrl={(playerId, build) =>
            makeAnalyzerUrl(selectedReport, selectedFight.id, playerId, undefined, build)
          }
        />
        <ReportRaidBuffList combatants={combatants} />
      </div>
    );
  }

  return (
    <>
      <DocumentTitle
        title={t({
          id: 'interface.report.render.documentTitle',
          message: `${getFightName(selectedReport, selectedFight)} by ${player.name} in ${
            selectedReport.title
          }`,
        })}
      />

      <PlayerProvider player={player} combatant={combatant} combatants={combatants}>
        {children}
      </PlayerProvider>
    </>
  );
};

export default PlayerLoader;
