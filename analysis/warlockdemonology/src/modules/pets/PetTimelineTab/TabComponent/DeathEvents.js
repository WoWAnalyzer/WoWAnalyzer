import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';
import PropTypes from 'prop-types';
import React from 'react';

const DeathEvents = (props) => {
  const { start, secondWidth, deaths, resurrections } = props;

  return (
    <>
      {deaths.map((event) => {
        const eventStart = event.start || event.timestamp;
        const fightDuration = eventStart - start;
        const left = ((eventStart - start) / 1000) * secondWidth;
        return (
          <Tooltip
            key={`death-${event.timestamp}`}
            content={`${formatDuration(fightDuration, 3)}: You died`}
          >
            <div
              className="death"
              style={{
                left,
              }}
            />
          </Tooltip>
        );
      })}
      {resurrections.map((event) => {
        const eventStart = event.start || event.timestamp;
        const fightDuration = eventStart - start;
        const left = ((eventStart - start) / 1000) * secondWidth;
        return (
          <Tooltip
            key={`resurrection-${event.timestamp}`}
            content={`${formatDuration(fightDuration, 3)}: You were resurrected`}
          >
            <div
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
};

DeathEvents.propTypes = {
  start: PropTypes.number.isRequired,
  secondWidth: PropTypes.number.isRequired,
  deaths: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
    }),
  ).isRequired,
  resurrections: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default DeathEvents;
