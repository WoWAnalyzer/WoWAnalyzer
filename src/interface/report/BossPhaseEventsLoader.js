import React from 'react';
import PropTypes from 'prop-types';

import { fetchEvents } from 'common/fetchWclApi';
import { makeWclBossPhaseFilter } from 'common/makeWclBossPhaseFilter';
import { fabricateBossPhaseEvents } from 'common/fabricateBossPhaseEvents';

class BossPhaseEventsLoader extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      events: null,
    };
    this.load();
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps.report !== this.props.report || prevProps.fight !== this.props.fight) {
      this.setState({
        isLoading: true,
        events: null,
      });
      this.load();
    }
  }

  async load() {
    const events = await this.loadEvents();
    this.setState({
      isLoading: false,
      events,
    });
  }
  async loadEvents() {
    const { report, fight } = this.props;

    const filter = makeWclBossPhaseFilter(fight);

    if (filter) {
      const events = await fetchEvents(report.code, fight.start_time, fight.end_time, undefined, makeWclBossPhaseFilter(fight));
      return fabricateBossPhaseEvents(events, report, fight);
    } else {
      return [];
    }
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.events);
  }
}

export default BossPhaseEventsLoader;
