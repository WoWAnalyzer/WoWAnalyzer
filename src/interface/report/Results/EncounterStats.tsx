import { Trans } from '@lingui/react/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatPercentage, formatThousands } from 'common/format';
import ROLES from 'game/ROLES';
import { ItemLink } from 'interface';
import ActivityIndicator from 'interface/ActivityIndicator';
import Icon from 'interface/Icon';
import Combatant from 'parser/core/Combatant';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Config from 'parser/Config';
import { WCLRanking, WCLRankingGear, WCLRankingsResponse } from 'common/WCL_TYPES';
import getItemQualityFromLabel from 'common/getItemQualityFromLabel';
import DIFFICULTIES from 'game/DIFFICULTIES';

interface WCLRankingGearWithAmount extends WCLRankingGear {
  amount: number;
}

interface KillTime {
  rank: WCLRanking;
  variance: number;
}

interface Props {
  config: Config;
  currentBoss: number;
  difficulty: number;
  duration: number;
  combatant: Combatant;
}

/**
 * Show statistics (talents and trinkets) for the current boss, specID and difficulty
 */
const EncounterStats = ({ config, currentBoss, difficulty, duration, combatant }: Props) => {
  const [mostUsedTrinkets, setMostUsedTrinkets] = useState<WCLRankingGearWithAmount[]>([]);
  const [similiarKillTimes, setSimiliarKillTimes] = useState<KillTime[]>([]);
  const [closestKillTimes, setClosestKillTimes] = useState<KillTime[]>([]);
  const [rankingsCount, setRankingsCount] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<ReactNode>('Loading statistics...');

  useEffect(() => {
    const load = () => {
      switch (config.spec?.role) {
        case ROLES.HEALER:
          metric.current = 'hps';
          break;

        default:
          metric.current = 'dps';
          break;
      }

      const now = new Date();
      const onejan = new Date(now.getFullYear(), 0, 1);
      const currentWeek = Math.ceil(
        ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
      ); // current calendar-week

      return fetchWcl<WCLRankingsResponse>(`rankings/encounter/${currentBoss}`, {
        className: config.spec.wclClassName,
        specName: config.spec.wclSpecName,
        difficulty: difficulty,
        limit: LIMIT, //Currently does nothing but if Kihra reimplements it'd be nice to have
        metric: metric.current,
        cache: currentWeek, // cache for a week
        includeCombatantInfo: true,
      })
        .then((stats) => {
          // TODO: Figure out new talents
          // const talentCounter = [[], [], [], [], [], [], []];
          // const talents: WCLRankingTalent[] = [];
          let trinkets: WCLRankingGearWithAmount[] = [];
          const similiarKillTimes: KillTime[] = []; // These are the reports within the defined variance of the analyzed log
          const closestKillTimes: KillTime[] = []; // These are the reports closest to the analyzed log regardless of it being within variance or not
          const combatantName = combatant._combatantInfo.name;

          stats.rankings.forEach((rank) => {
            rank.gear.forEach((item, itemSlot) => {
              if (itemSlot === 12 || itemSlot === 13) {
                trinkets = addItem(trinkets, item);
              }
            });

            if (!rank.name.match(combatantName)) {
              if (
                duration > rank.duration * (1 - durationVariancePercentage.current) &&
                duration < rank.duration * (1 + durationVariancePercentage.current)
              ) {
                similiarKillTimes.push({
                  rank,
                  variance:
                    rank.duration - duration > 0
                      ? rank.duration - duration
                      : duration - rank.duration,
                });
              }
              closestKillTimes.push({
                rank,
                variance:
                  rank.duration - duration > 0
                    ? rank.duration - duration
                    : duration - rank.duration,
              });
            }
          });

          // TODO: Figure out new talents
          // talentCounter.forEach((row) => {
          //   const talentRow = row.reduce((prev, cur) => {
          //     prev[cur] = (prev[cur] || 0) + 1;
          //     return prev;
          //   }, {});
          //   talents.push(talentRow);
          // });

          trinkets.sort((a, b) => (a.amount < b.amount ? 1 : b.amount < a.amount ? -1 : 0));

          similiarKillTimes.sort((a, b) => a.variance - b.variance);

          closestKillTimes.sort((a, b) => a.variance - b.variance);

          setMostUsedTrinkets(trinkets.slice(0, SHOW_TOP_ENTRYS));
          setSimiliarKillTimes(similiarKillTimes.slice(0, SHOW_CLOSEST_KILL_TIME_LOGS));
          setClosestKillTimes(closestKillTimes.slice(0, SHOW_CLOSEST_KILL_TIME_LOGS));
          setLoaded(true);
          setRankingsCount(stats.rankings.length);
        })
        .catch(() => {
          setMessage(
            <Trans id="interface.report.results.encounterStats.eeek">Something went wrong.</Trans>,
          );
        });
    };

    load();
  }, []);

  const LIMIT = 100; //Currently does nothing but if Kihra reimplements it'd be nice to have
  const SHOW_TOP_ENTRYS = 6;
  const SHOW_CLOSEST_KILL_TIME_LOGS = 10;
  const metric = useRef<'dps' | 'hps'>('dps');
  const amountOfParses = useRef(0);
  const durationVariancePercentage = useRef(0.2); //Marked in % to allow for similiar filtering on long/short fights

  const addItem = (array: WCLRankingGearWithAmount[], item: WCLRankingGear) => {
    //add item to array or increase amount by one if it exists
    if (item.id === null || item.id === 0) {
      return array;
    }
    const index = array.findIndex((elem) => elem.id === item.id);
    if (index === -1) {
      array.push({
        id: item.id,
        name: item.name.replace(/\\'/g, "'"),
        quality: item.quality,
        icon: item.icon,
        amount: 1,
      });
    } else {
      array[index].amount += 1;
    }

    return array;
  };

  const singleItem = (item: WCLRankingGearWithAmount) => {
    return (
      <div
        key={item.id}
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
      >
        <div className="row">
          <div
            className="col-md-2"
            style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em', textAlign: 'right' }}
          >
            {formatPercentage(item.amount / amountOfParses.current, 0)}%
          </div>
          <div className="col-md-10">
            <ItemLink
              id={item.id}
              className={item.quality}
              details={{
                itemLevel: Number(item.itemLevel),
                quality: getItemQualityFromLabel(item.quality),
              }}
              icon={false}
            >
              <Icon
                icon={item.icon}
                className={item.quality}
                style={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
              />
              {item.name}
            </ItemLink>
          </div>
        </div>
      </div>
    );
  };

  const singleLog = (log: WCLRanking) => {
    return (
      <div
        key={`${log.reportID}-${log.name}`}
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
      >
        <div className="row" style={{ opacity: '.8', fontSize: '.9em', lineHeight: '2em' }}>
          <div className="flex-column col-md-6">
            <a
              href={`https://wowanalyzer.com/report/${log.reportID}/${log.fightID}/${log.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                {log.name} (
                {'itemLevel' in log
                  ? log.itemLevel
                  : difficulty !== DIFFICULTIES.MYTHIC_PLUS_DUNGEON
                    ? log.bracketData
                    : undefined}
                )
              </div>
            </a>
            <div>
              {formatDuration(log.duration)} (
              {log.duration > duration
                ? ((log.duration - duration) / 1000).toFixed(1) + 's slower'
                : ((duration - log.duration) / 1000).toFixed(1) + 's faster'}
              )
            </div>
          </div>
          <div className="col-md-6">
            {formatThousands('total' in log ? log.total : log.amount)} {metric.current}
          </div>
        </div>
      </div>
    );
  };

  const getSimiliarLogs = () => {
    return (
      <div
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
        key="similiar-wcl-logs"
      >
        {similiarKillTimes.length > 1 ? 'These are' : 'This is'} {similiarKillTimes.length} of the
        top {amountOfParses.current} {similiarKillTimes.length > 1 ? 'logs' : 'log'} that{' '}
        {similiarKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time within{' '}
        {formatPercentage(durationVariancePercentage.current, 0)}% variance.
        {similiarKillTimes.map((log) => singleLog(log.rank))}
      </div>
    );
  };

  const getClosestLogs = () => {
    return (
      <div
        className="col-md-12 flex-main"
        style={{ textAlign: 'left', margin: '5px auto' }}
        key="closest-wcl-logs"
      >
        {closestKillTimes.length > 1 ? 'These are' : 'This is'} {closestKillTimes.length} of the top{' '}
        {amountOfParses.current} {closestKillTimes.length > 1 ? 'logs' : 'log'} that{' '}
        {closestKillTimes.length > 1 ? 'are' : 'is'} closest to your kill-time. Large differences
        won't be good for comparing.
        {closestKillTimes.map((log) => singleLog(log.rank))}
      </div>
    );
  };

  // TODO: Figure out new talents
  // const rows = [15, 30, 45, 60, 75, 90, 100];
  if (!loaded) {
    return (
      <div
        className="panel-heading"
        style={{ marginTop: 40, padding: 20, boxShadow: 'none', borderBottom: 0 }}
      >
        <ActivityIndicator text={message} />
      </div>
    );
  }

  // If there are below 100 parses for a given spec, use this amount to divide with to get accurate percentages.
  // This also enables us to work around certain logs being anonymised - as this will then ignore those, and cause us to divide by 99, making our percentages accurate again.
  amountOfParses.current = rankingsCount;

  return (
    <>
      <h1>
        Statistics for this fight using the top {amountOfParses.current} logs, ranked by{' '}
        {metric.current.toLocaleUpperCase()}
      </h1>

      <div className="row">
        <div className="col-md-12" style={{ padding: '0 30px' }}>
          <div className="row">
            <div className="col-md-4">
              <div className="row" style={{ marginBottom: '1em' }}>
                <div className="col-md-12">
                  <h2>Most used Trinkets</h2>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '2em' }}>
                {mostUsedTrinkets.map((trinket) => singleItem(trinket))}
              </div>
            </div>
            <div className="col-md-4">
              <div className="row" style={{ marginBottom: '1em' }}>
                <div className="col-md-12">
                  <h2>{similiarKillTimes.length > 0 ? 'Similiar' : 'Closest'} kill times </h2>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '2em' }}>
                {similiarKillTimes.length > 0 ? getSimiliarLogs() : ''}
                {similiarKillTimes.length === 0 && closestKillTimes.length > 0
                  ? getClosestLogs()
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncounterStats;
