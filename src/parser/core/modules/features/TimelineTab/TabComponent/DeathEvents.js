import React from 'react';
import PropTypes from 'prop-types';

import { formatDuration } from 'common/format';

class DeathEvents extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    deaths: PropTypes.arrayOf(PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
    })).isRequired,
    resurrections: PropTypes.arrayOf(PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { start, secondWidth, deaths, resurrections } = this.props;

    return (
      <React.Fragment>
        {deaths.map(event => {
          const eventStart = event.start || event.timestamp;
          const fightDuration = (eventStart - start) / 1000;
          const left = (eventStart - start) / 1000 * secondWidth;
          return (
            <div
              key={`death-${event.timestamp}`}
              className="death"
              style={{
                left,
              }}
              data-tip={`${formatDuration(fightDuration, 3)}: You died`}
            />
          );
        })}
        {resurrections.map(event => {
          const eventStart = event.start || event.timestamp;
          const fightDuration = (eventStart - start) / 1000;
          const left = (eventStart - start) / 1000 * secondWidth;
          return (
            <div
              key={`resurrection-${event.timestamp}`}
              className="resurrection"
              style={{
                left,
              }}
              data-tip={`${formatDuration(fightDuration, 3)}: You were resurrected`}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default DeathEvents;
