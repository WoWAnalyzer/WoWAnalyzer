import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWclApi';
import CombatLogParser from 'parser/core/CombatLogParser';

class ThroughputPerformance extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    metric: PropTypes.string.isRequired,
    throughput: PropTypes.number.isRequired,
  };
  static contextTypes = {
    parser: PropTypes.instanceOf(CombatLogParser).isRequired,
  };

  constructor() {
    super();
    this.state = {
      performance: null,
    };
  }
  componentDidMount() {
    this.load();
  }

  load() {
    return this.loadRankings()
      // Get the best rank
      .then(({ rankings }) => rankings[0])
      // Get the throughput
      .then(rank => rank ? rank.total : null)
      .then(topThroughput => {
        this.setState({
          performance: topThroughput ? this.props.throughput / topThroughput : null,
        });
      });
  }
  loadRankings() {
    const parser = this.context.parser;

    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7); // current calendar-week

    return fetchWcl(`rankings/encounter/${parser.fight.boss}`, {
      class: parser.selectedCombatant.spec.ranking.class,
      spec: parser.selectedCombatant.spec.ranking.spec,
      difficulty: parser.fight.difficulty,
      metric: this.props.metric,
      cache: currentWeek, // cache for a week
    });
  }

  render() {
    const { children } = this.props;

    return children(this.state.performance);
  }
}

export default ThroughputPerformance;
