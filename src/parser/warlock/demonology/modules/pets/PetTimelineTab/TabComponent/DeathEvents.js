import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'common/Tooltip';
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
      <>
        {deaths.map(event => {
          const eventStart = event.start || event.timestamp;
          const fightDuration = (eventStart - start) / 1000;
          const left = (eventStart - start) / 1000 * secondWidth;
          return (
            <Tooltip content={`${formatDuration(fightDuration, 3)}: You died`}>
              <div
                key={`death-${event.timestamp}`}
                className="death"
                style={{
                  left,
                }}
              />
            </Tooltip>
          );
        })}
        {resurrections.map(event => {
          const eventStart = event.start || event.timestamp;
          const fightDuration = (eventStart - start) / 1000;
          const left = (eventStart - start) / 1000 * secondWidth;
          return (
            <Tooltip content={`${formatDuration(fightDuration, 3)}: You were resurrected`}>
              <div
                key={`resurrection-${event.timestamp}`}
                className="resurrection"
                style={{
                  left,
                }}
              />
            </Tooltip>
          );
        })}
      </>
    );
  }
}

export default DeathEvents;
