import React from 'react';
import PropTypes from 'prop-types';

import { fetchEvents } from 'common/fetchWclApi';

class EventsLoader extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      // use fight interface when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: PropTypes.number.isRequired,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      guid: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
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
    if (prevProps.report !== this.props.report || prevProps.fight !== this.props.fight || prevProps.player !== this.props.player) {
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
