import React from 'react';
import PropTypes from 'prop-types';

import './UptimeBar.scss';

const UptimeBar = props => {
  const { uptimeHistory, start: fightStart, end: fightEnd, ...others } = props;
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
};

UptimeBar.propTypes = {
  uptimeHistory: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number, // may be null if lasts until fight end
  })).isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};

export default UptimeBar;
