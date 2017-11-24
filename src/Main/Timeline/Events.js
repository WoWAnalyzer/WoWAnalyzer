import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

const RESTORE_CHARGE_TICK_WIDTH = 70;

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
        timestamp : beginCooldownEvent.start + beginCooldownEvent.expectedDuration,
        end: beginCooldownEvent.start + beginCooldownEvent.expectedDuration,
      });
    });

    return fixedEvents;
  }

  render() {
    const { events, start, totalWidth, secondWidth, className } = this.props;
    const fixedEvents = this.fabricateEndCooldown(events);

    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {fixedEvents.map((event, index) => {
          if (event.type === 'cast') {
            return (
              <div
                key={index}
                style={{
                  left: (event.timestamp - start) / 1000 * secondWidth,
                  top: -1, // without this, icon vertical positioning slightly off...
                  zIndex: 10,
                }}
              >
                <SpellIcon id={event.ability.guid} />
              </div>
            );
          }
          if (event.type === 'updatespellusable' && (event.trigger === 'endcooldown' || event.trigger === 'restorecharge')) {
            const left = (event.start - start) / 1000 * secondWidth;
            const maxWidth = totalWidth - left; // don't expand beyond the container width
            const width = Math.min(maxWidth, (event.timestamp - event.start) / 1000 * secondWidth);
            return (
              <div
                key={index}
                style={{
                  left,
                  width,
                  background: 'rgba(150, 150, 150, 0.4)',
                  zIndex: 1,
                }}
                data-tip={`Cooldown: ${((event.timestamp - event.start) / 1000).toFixed(1)}s`}
              />
            );
          }
          return null;
        })}
        {fixedEvents.map((event, index) => {
          if (event.type === 'updatespellusable' && (/*event.trigger === 'endcooldown' || */event.trigger === 'restorecharge')) {
            const left = (event.timestamp - (RESTORE_CHARGE_TICK_WIDTH / 2) - start) / 1000 * secondWidth;
            const maxWidth = totalWidth - left; // don't expand beyond the container width
            const width = Math.min(maxWidth, RESTORE_CHARGE_TICK_WIDTH / 1000 * secondWidth);
            return (
              <div
                key={index}
                style={{
                  left,
                  width,
                  background: 'rgba(250, 250, 250, 0.6)',
                  zIndex: 2,
                }}
                data-tip={`Charge Restored`}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }
}

export default Events;
