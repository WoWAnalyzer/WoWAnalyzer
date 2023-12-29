import fetchWcl from 'common/fetchWclApi';
import { WCLRanking, WCLRankingsResponse } from 'common/WCL_TYPES';
import { specsCount as TOTAL_SPECS } from 'game/SPECS';
import VERSIONS from 'game/VERSIONS';
import Config from 'parser/Config';
import calculateMedian from 'parser/shared/modules/features/Checklist/helpers/calculateMedian';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

const DAYS_PER_WEEK = 7;
const SECONDS_PER_DAY = 86400;
export const UNAVAILABLE = -1;

interface Props {
  children: (state: State) => ReactNode;
  metric: string;
  throughput: number;
}

interface State {
  performance: number | null;
  topThroughput: number | null;
  medianDuration: number | null;
}

const getCacheKey = (specIndex: number, config: Config) => {
  // We want to cache data for 1 week. To avoid refreshing all specs at at the same time, we also want to stagger the requests.
  // We achieve this by adding a static amount of time to `now` based on the spec index (0-35).
  const specStaggerOffset = (DAYS_PER_WEEK * SECONDS_PER_DAY * specIndex) / TOTAL_SPECS;
  // We mutate now so that if there's a year crossover it will properly go to week 1 instead of 53/54
  const specAdjustedNow = new Date(new Date().getTime() + specStaggerOffset * 1000);
  // We need this to calculate the amount of weeks difference
  const onejan = new Date(specAdjustedNow.getFullYear(), 0, 1);
  // Calculate the current week number
  const staggeredWeek = Math.ceil(
    ((specAdjustedNow.valueOf() - onejan.valueOf()) / SECONDS_PER_DAY / 1000 +
      onejan.getDay() +
      1) /
      DAYS_PER_WEEK,
  );
  return `${staggeredWeek}-${VERSIONS[config.expansion] || ''}`; // current calendar-week
};
const getRank = (rankings: WCLRanking[], desiredRank: number) => {
  return rankings[desiredRank - 1];
};

const ThroughputPerformance = ({ children, metric, throughput }: Props) => {
  const [state, setState] = useState<State>({
    performance: null,
    topThroughput: null,
    medianDuration: null,
  });
  const { combatLogParser: parser } = useCombatLogParser();

  const loadRankings = useCallback(
    () =>
      fetchWcl<WCLRankingsResponse>(`rankings/encounter/${parser.fight.boss}`, {
        class: parser.config.spec.ranking.class,
        spec: parser.config.spec.ranking.spec,
        difficulty: parser.fight.difficulty,
        metric: metric,
        // hehe jk this is actually the opposite of a cache key since without this it would be cached indefinitely. This is more like a "cache bust key" in that this changes weekly so that it auto-refreshes weekly. Super clever.
        cache: getCacheKey(parser.config.spec.index, parser.config),
      }),
    [metric, parser.config, parser.fight.boss, parser.fight.difficulty],
  );

  const load = useCallback(async () => {
    try {
      if (import.meta.env.MODE === 'test') {
        // Skip during tests since we can't do WCL calls
        return;
      }
      const { rankings } = await loadRankings();
      // We want the 100th rank to give people a reasonable goal to aim for. #1 might be a stretch.
      const topRank = getRank(rankings, 100);
      if (!topRank) {
        setState({
          performance: UNAVAILABLE,
          topThroughput: UNAVAILABLE,
          medianDuration: null,
        });
        return;
      }
      const topThroughput = topRank.total;
      const durations = rankings.map((rank) => rank.duration);
      const medianDuration = calculateMedian(durations);

      setState({
        // If the player is in the top 100, this may be >=100%.
        performance: throughput && throughput / topThroughput,
        topThroughput,
        medianDuration,
      });
    } catch (err) {
      console.error(
        'Failed to load encounter rankings. Not logging since this will happen as expected when WCL partitions the data.',
        err,
      );
      setState({
        performance: UNAVAILABLE,
        topThroughput: UNAVAILABLE,
        medianDuration: null,
      });
    }
  }, [loadRankings, throughput]);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    load();
  }, [load]);

  return <>{children(state)}</>;
};

export default ThroughputPerformance;
