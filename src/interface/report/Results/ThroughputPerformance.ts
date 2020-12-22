import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';
import fetchWcl from 'common/fetchWclApi';
import { WCLRanking, WCLRankingsResponse } from 'common/WCL_TYPES';

const DAYS_PER_WEEK = 7;
const SECONDS_PER_DAY = 86400;
const TOTAL_SPECS = Object.keys(SPECS).length;
export const UNAVAILABLE = -1;

interface Props {
  children: (state: State) => ReactNode;
  metric: string;
  throughput: number;
}

interface State {
  performance: number | null;
  topThroughput: number | null;
}

class ThroughputPerformance extends React.PureComponent<Props, State> {
  static contextTypes = {
    parser: PropTypes.object.isRequired, // unable to use instanceof CombatLogParser as that would cause a circular import
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      performance: null,
      topThroughput: null,
    };
  }
  componentDidMount() {
    this.load();
  }

  async load() {
    try {
      if (process.env.NODE_ENV === 'test') {
        // Skip during tests since we can't do WCL calls
        return;
      }
      const { rankings } = await this.loadRankings();
      // We want the 100th rank to give people a reasonable and easy to grasp goal to aim for.
      const topRank = this._getRank(rankings, 100);
      if (!topRank) {
        this.setState({
          performance: UNAVAILABLE,
          topThroughput: UNAVAILABLE,
        });
        return;
      }
      const topThroughput = topRank.total;
      this.setState({
        // If the player is in the top 100, this may be >=100%.
        performance: this.props.throughput && (this.props.throughput / topThroughput),
        topThroughput,
      });
    } catch (err) {
      console.error('Failed to load encounter rankings. Not logging since this will happen as expected when WCL partitions the data.', err);
      this.setState({
        performance: UNAVAILABLE,
        topThroughput: UNAVAILABLE,
      });
    }
  }
  async loadRankings() {
    const parser = this.context.parser;

    // TODO: Move this to a method that can be shared with the EncounterStats component
    return fetchWcl<WCLRankingsResponse>(`rankings/encounter/${parser.fight.boss}`, {
      class: parser.selectedCombatant.spec.ranking.class,
      spec: parser.selectedCombatant.spec.ranking.spec,
      difficulty: parser.fight.difficulty,
      metric: this.props.metric,
      // hehe jk this is actually the opposite of a cache key since without this it would be cached indefinitely. This is more like a "cache bust key" in that this changes weekly so that it auto-refreshes weekly. Super clever.
      cache: this._getCacheKey(parser.selectedCombatant.spec.index),
    });
  }
  _getCacheKey(specIndex: number) {
    // We want to cache data for 1 week. To avoid refreshing all specs at at the same time, we also want to stagger the requests.
    // We achieve this by adding a static amount of time to `now` based on the spec index (0-35).
    const specStaggerOffset = (DAYS_PER_WEEK * SECONDS_PER_DAY * specIndex / TOTAL_SPECS);
    // We mutate now so that if there's a year crossover it will properly go to week 1 instead of 53/54
    const specAdjustedNow = new Date((new Date()).getTime() + (specStaggerOffset * 1000));
    // We need this to calculate the amount of weeks difference
    const onejan = new Date(specAdjustedNow.getFullYear(), 0, 1);
    // Calculate the current week number
    const staggeredWeek = Math.ceil((((specAdjustedNow.valueOf() - onejan.valueOf()) / SECONDS_PER_DAY / 1000) + onejan.getDay() + 1) / DAYS_PER_WEEK);
    return `${staggeredWeek}-${process.env.REACT_APP_CURRENT_GAME_PATCH}`; // current calendar-week
  }
  _getRank(rankings: WCLRanking[], desiredRank: number) {
    return rankings[desiredRank - 1];
  }

  render() {
    const { children } = this.props;

    return children(this.state);
  }
}

export default ThroughputPerformance;
