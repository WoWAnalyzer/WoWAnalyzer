import React from 'react';
import PropTypes from 'prop-types';

import Event from './Event';

class EventsTable extends React.Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    filter: PropTypes.func,
    findEntity: PropTypes.func,
    fightStart: PropTypes.number,
  };

  shouldComponentUpdate(nextProps) {
    // The events, findEntity and fightStart should *never* change, since we only render this after parser has finished.
    return nextProps.filter !== this.props.filter;
  }

  render() {
    const { events, filter, findEntity, fightStart } = this.props;

    return (
      <table className="events-tab">
        <tbody>
          {events
            .map((event, i) => ({ ...event, eventUniqueId: i })) // this greatly speeds up rendering
            // .filter(event => event.eventUniqueId < 200)
            .filter(filter)
            .map(event => {
              const source = event.sourceID ? findEntity(event.sourceID) : event.source;
              const target = event.targetID ? findEntity(event.targetID) : event.target;

              return (
                <Event
                  key={`${event.eventUniqueId}`}
                  event={event}
                  id={event.eventUniqueId}
                  fightStart={fightStart}
                  source={source}
                  target={target}
                />
              );
            })}
        </tbody>
      </table>
    );
  }
}

export default EventsTable;
