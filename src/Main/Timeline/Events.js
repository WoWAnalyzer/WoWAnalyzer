import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

class Events extends React.PureComponent {
  static propTypes = {
    events: PropTypes.array,
    start: PropTypes.number.isRequired,
    totalWidth: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    className: PropTypes.string,
  };

  /**
   * Make cooldowns that haven't ended yet appear like they run until the end of the fight (without this these abilities would appear to have no cooldown).
   * @param {Array} events
   * @returns {Array}
   */
  fabricateEndCooldown(events) {
    // Find all the spells without enough `endcooldown` events
    const missingEndCooldowns = [];
    events.forEach(event => {
      if (event.type !== 'updatespellusable') {
        return;
      }
      if (event.trigger === 'begincooldown') {
        missingEndCooldowns.push(event);
      }
      if (event.trigger === 'endcooldown') {
        const index = missingEndCooldowns.findIndex(beginCooldownEvent => beginCooldownEvent.spellId === event.spellId);
        if (index !== -1) {
          missingEndCooldowns.splice(index, 1);
        }
      }
    });

    const fixedEvents = [...events];
    // Fabricate events for the missing `endcooldown` events
    missingEndCooldowns.forEach(beginCooldownEvent => {
      fixedEvents.push({
        ...beginCooldownEvent,
        trigger: 'endcooldown',
        end: beginCooldownEvent.start + beginCooldownEvent.expectedDuration,
      });
    });

    return fixedEvents;
  }

  render() {
    const { events, start, totalWidth, secondWidth, className } = this.props;
    const fixedEvents = this.fabricateEndCooldown(events);

    let beginTimestamp;

    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {fixedEvents.map((event, index) => {
          if (event.type === 'cast') {
            return (
              <div
                key={index}
                style={{
                  left: (event.timestamp - start) / 1000 * secondWidth,
                  zIndex: 10,
                }}
              >
                <SpellIcon id={event.ability.guid} />
              </div>
            );
          }
          if (event.type === 'updatespellusable' && event.trigger === 'endcooldown') {
            const left = (beginTimestamp - start) / 1000 * secondWidth;
            const maxWidth = totalWidth - left; // don't expand beyond the container width
            const width = Math.min(maxWidth, (event.end - beginTimestamp) / 1000 * secondWidth);
            return (
              <div
                key={index}
                style={{
                  left,
                  width,
                  background: 'rgba(150, 150, 150, 0.4)',
                  zIndex: 1,
                }}
                data-tip={`Cooldown: ${((event.end - beginTimestamp) / 1000).toFixed(1)}s`}
              />
            );
          }
          if (event.type === 'updatespellusable' && event.trigger === 'begincooldown') {
            beginTimestamp = event.timestamp;
          }

          return null;
        })}
      </div>
    );
  }
}

export default Events;
