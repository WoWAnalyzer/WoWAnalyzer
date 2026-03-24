import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { defineMessage, t, Trans } from '@lingui/macro';
import getFightName from 'common/getFightName';
import { isUnsupportedClassicVersion, wclGameVersionToBranch } from 'game/VERSIONS';
import ActivityIndicator from 'interface/ActivityIndicator';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Panel from 'interface/Panel';
import AdvancedLoggingWarning from 'interface/report/AdvancedLoggingWarning';
import RaidCompositionDetails from 'interface/report/RaidCompositionDetails';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import ReportRaidBuffList from 'interface/ReportRaidBuffList';
import Tooltip from 'interface/Tooltip';
import getConfig from 'parser/getConfig';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PlayerProvider } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import { useFight } from 'interface/report/context/FightContext';
import DocumentTitle from 'interface/DocumentTitle';

import PlayerSelection from './PlayerSelection';
import { getPlayerIdFromParam } from 'interface/selectors/url/report/getPlayerId';
import { i18n } from '@lingui/core';
import useSWR from 'swr';
import { PlayerDetails } from 'parser/core/Player';
import makeApiUrl from 'common/makeApiUrl';
import { getPlayerNameFromParam } from 'interface/selectors/url/report/getPlayerName';

interface Props {
  children: ReactNode;
}

interface PlayerDetailsResponse {
  players: PlayerDetails[];
}

const PlayerLoader = ({ children }: Props) => {
  const { report: selectedReport } = useReport();
  const { fight: selectedFight } = useFight();
  const { player: playerParam } = useParams();
  const playerId = getPlayerIdFromParam(playerParam);
  const playerName = getPlayerNameFromParam(playerParam);
  const navigate = useNavigate();
  const { data, error, isLoading } = useSWR<PlayerDetailsResponse>(
    makeApiUrl(`v2/report/${selectedReport.code}/fight/${selectedFight.id}/players`),
    {
      fetcher: (url) => fetch(url).then((res) => res.json()),
      isPaused: () => isUnsupportedClassicVersion(selectedReport.gameVersion),
    },
  );

  // re-routing for accesses with player name but no id. if exact match, route to id.
  // if no exact match (missing or multiple matches) reroute to player selection.
  //
  // would like everything to have the id, but there are a lot of urls floating around with name only
  useEffect(() => {
    if (playerName && !playerId && data?.players) {
      const namedPlayers = data.players.filter((player) => player.name === playerName);

      if (namedPlayers.length === 1) {
        navigate(makeAnalyzerUrl(selectedReport, selectedFight.id, namedPlayers[0].id), {
          replace: true,
        });
      } else {
        navigate(makeAnalyzerUrl(selectedReport, selectedFight.id), {
          replace: true,
        });
      }
    }
  }, [playerId, playerName, data?.players, selectedReport, selectedFight, navigate]);

  const player = useMemo(
    () => data?.players.find((player) => player.id === playerId),
    [data?.players, playerId],
  );

  // react compiler infers `data` instead of `data?.players` for this.
  // similar-ish results i think? but easy enough to leave alone
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const composition = useMemo(() => {
    const result = {
      tank: 0,
      dps: 0,
      healer: 0,
      ilvl: 0,
    };

    if (!data?.players) {
      return result;
    }

    for (const player of data.players) {
      result.ilvl += player.ilvl ?? 0;
      result[player.role] += 1;
    }

    result.ilvl /= data.players.length;

    return result;
  }, [data?.players]);

  if (isUnsupportedClassicVersion(selectedReport.gameVersion)) {
    return (
      <div className="container offset">
        <Panel
          title={
            <Trans id="interface.report.oldLogWarning.title">Unsupported encounters detected</Trans>
          }
        >
          <div className="flex wrapable">
            <div className="flex-main" style={{ minWidth: 400 }}>
              <Trans id="interface.report.oldLogWarning.details">
                The current report contains encounters from an old World of Warcraft expansion. Old
                expansion logs are not supported.
              </Trans>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    // TODO: i18n
    return (
      <div className="container offset">
        <Panel title={'Something went wrong'}>
          <div className="flex wrapable">
            <div className="flex-main">An unexpected error occurred loading the player list.</div>
          </div>
        </Panel>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <ActivityIndicator
        text={t({
          id: 'interface.report.renderLoading.fetchingPlayerInfo',
          message: `Fetching player info...`,
        })}
      />
    );
  }

  const reportDuration = selectedReport.end - selectedReport.start;

  const config =
    player &&
    getConfig(wclGameVersionToBranch(selectedReport.gameVersion), player.specID ?? 0, player);

  if (playerId && (!player || !config)) {
    if (!player) {
      alert(
        i18n._(
          defineMessage({
            id: 'interface.report.render.dataNotAvailable',
            message: `Player data does not seem to be available for the selected player in this fight.`,
          }),
        ),
      );
    } else if (!config) {
      alert(
        i18n._(
          defineMessage({
            id: 'interface.report.render.notSupported',
            message: `This spec is not supported for this expansion.`,
          }),
        ),
      );
    }
  }

  if (!player) {
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
                tanks={composition.tank}
                healers={composition.healer}
                dps={composition.dps}
                ilvl={composition.ilvl}
              />
            </div>
          </div>
        </div>

        {selectedFight.end_time > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {data.players.length === 0 && <AdvancedLoggingWarning />}

        <PlayerSelection
          report={selectedReport}
          players={data.players}
          makeUrl={(playerId) =>
            makeAnalyzerUrl(selectedReport, selectedFight.id, playerId, undefined)
          }
        />
        <ReportRaidBuffList report={selectedReport} players={data.players} />
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

      <PlayerProvider player={player} allPlayers={data.players}>
        {children}
      </PlayerProvider>
    </>
  );
};

export default PlayerLoader;
