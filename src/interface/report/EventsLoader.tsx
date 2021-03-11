import { fetchEvents } from 'common/fetchWclApi';
import { AnyEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import React from 'react';

interface Props {
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
  children: (isLoading: boolean, events: AnyEvent[] | null) => React.ReactNode;
}

interface State {
  isLoading: boolean;
  events: AnyEvent[] | null;
}

class EventsLoader extends React.PureComponent<Props, State> {
  state = {
    isLoading: true,
    events: null,
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevProps.report !== this.props.report ||
      prevProps.fight !== this.props.fight ||
      prevProps.player !== this.props.player
    ) {
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
  loadEvents() {
    const { report, fight, player } = this.props;

    return fetchEvents(report.code, fight.start_time, fight.end_time, player.id);
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.events);
  }
}

export default EventsLoader;
