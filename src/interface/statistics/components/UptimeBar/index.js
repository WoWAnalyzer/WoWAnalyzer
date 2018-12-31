import React from 'react';
import PropTypes from 'prop-types';

import './UptimeBar.scss';

class UptimeBar extends React.PureComponent {
  static propTypes = {
    uptimeHistory: PropTypes.arrayOf(PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    })).isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  render() {
    const { uptimeHistory, start: fightStart, end: fightEnd, ...others } = this.props;
    const fightDuration = fightEnd - fightStart;

    return (
      <div className="uptime-bar" {...others}>
        {uptimeHistory.map(buff => {
          const start = buff.start;
          const end = buff.end !== null ? buff.end : fightEnd;

          return (
            <div
              key={`${start}-${end}`}
              style={{
                left: `${(start - fightStart) / fightDuration * 100}%`,
                width: `${(end - start) / fightDuration * 100}%`,
              }}
            />
          );
        })}
      </div>
    );
  }
}

export default UptimeBar;
