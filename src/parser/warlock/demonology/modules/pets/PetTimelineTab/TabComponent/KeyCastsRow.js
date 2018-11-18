import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

class KeyCastsRow extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    events: PropTypes.array,
    start: PropTypes.number.isRequired,
    totalWidth: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
  };

  render() {
    const { className, events, start, totalWidth, secondWidth } = this.props;
    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {events.map((event, index) => {
          if (event.type === 'cast') {
            const left = (event.timestamp - start) / 1000 * secondWidth;
            const tooltipInfo = [];
            if (event.extraInfo) {
              tooltipInfo.push(event.extraInfo);
            }
            if (event.nearbyCasts) {
              tooltipInfo.push(`This cast overlaps with following casts: ${event.nearbyCasts.join(', ')}.`);
            }
            return (
              <div
                key={index}
                style={{
                  left,
                  top: -1,
                  zIndex: (event.important) ? 20 : 10,
                }}
              >
                <SpellIcon
                  id={event.abilityId}
                  className={event.important && 'enhanced'}
                  data-tip={tooltipInfo.join('\n')}
                />
              </div>
            );
          }
          else if (event.type === 'duration') {
            const left = (event.timestamp - start) / 1000 * secondWidth;
            const maxWidth = totalWidth - left; // don't expand beyond the container width
            const width = Math.min(maxWidth, (event.endTimestamp - event.timestamp) / 1000 * secondWidth);
            return (
                <div
                  key={index}
                  style={{
                    left,
                    width,
                    background: 'rgba(133, 59, 255, 0.7)',
                  }}
                  data-effect="float"
                />
            );
          }
          return null;
        })}
      </div>
    );
  }
}

export default KeyCastsRow;
