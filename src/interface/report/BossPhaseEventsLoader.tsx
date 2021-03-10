import React  from 'react';

import { fetchEvents } from 'common/fetchWclApi';
import { makeWclBossPhaseFilter } from 'common/makeWclBossPhaseFilter';
import { fabricateBossPhaseEvents } from 'common/fabricateBossPhaseEvents';
import { captureException } from 'common/errorLogger';

import BossPhasesState from 'interface/report/BOSS_PHASES_STATE';
import Report from 'parser/core/Report';
import { WCLFight } from 'parser/core/Fight';
import { PhaseEvent } from 'parser/core/Events';

interface Props {
  report: Report;
  fight: WCLFight;
  children: (loadingState: BossPhasesState, events: PhaseEvent[]|null) => React.ReactNode;
}

interface State {
  loadingState: BossPhasesState;
  events: PhaseEvent[]|null;
}

class BossPhaseEventsLoader extends React.PureComponent<Props, State> {
  state = {
    loadingState: BossPhasesState.LOADING,
    events: null,
  }

  constructor(props: Props) {
    super(props);
    this.load();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.report !== this.props.report || prevProps.fight !== this.props.fight) {
      this.setState({
        loadingState: BossPhasesState.LOADING,
        events: null,
      });
      this.load();
    }
  }

  async load() {
    let events = null;
    try {
      events = await this.loadEvents();
    } catch (err) {
      // The boss events are very nice, but we can still continue without it and just provide the entire fight for analysis.
      // We still want to log the error though, so we can potentially improve this.
      captureException(err);
    }

    this.setState({
      loadingState: events === null ? BossPhasesState.SKIPPED : BossPhasesState.DONE,
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
