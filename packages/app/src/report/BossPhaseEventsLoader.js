import React from 'react';
import PropTypes from 'prop-types';

import { fetchEvents } from 'common/fetchWclApi';
import { makeWclBossPhaseFilter } from 'common/makeWclBossPhaseFilter';
import { fabricateBossPhaseEvents } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';

import BOSS_PHASES_STATE from './BOSS_PHASES_STATE';

class BossPhaseEventsLoader extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      // replace with actual fight object when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: PropTypes.number.isRequired,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      loadingState: BOSS_PHASES_STATE.LOADING,
      events: null,
    };
    this.load();
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps.report !== this.props.report || prevProps.fight !== this.props.fight) {
      this.setState({
        loadingState: BOSS_PHASES_STATE.LOADING,
        events: null,
      });
      this.load();
    }
  }

  async load() {
    let events;
    try {
      events = await this.loadEvents();
    } catch (err) {
      // The boss events are very nice, but we can still continue without it and just provide the entire fight for analysis.
      // We still want to log the error though, so we can potentially improve this.
      captureException(err);
    }

    this.setState({
      loadingState: events === null ? BOSS_PHASES_STATE.SKIPPED : BOSS_PHASES_STATE.DONE,
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
      return null;
    }
  }

  render() {
    return this.props.children(this.state.loadingState, this.state.events);
  }
}

export default BossPhaseEventsLoader;
