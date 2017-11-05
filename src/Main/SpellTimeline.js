import React from 'react';
import PropTypes from 'prop-types';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactTooltip from 'react-tooltip';
import 'gemini-scrollbar/gemini-scrollbar.css';

import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatMilliseconds } from 'common/format';

import './SpellTimeline.css';

class SpellTimeline extends React.PureComponent {
  static propTypes = {
    events: PropTypes.array.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
  }

  handleMouseWheel(e) {
    // This translate vertical scrolling into horizontal scrolling
    if (!this.gemini || !this.gemini.scrollbar) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (e.detail > 0) {
      // noinspection JSSuspiciousNameCombination
      this.gemini.scrollbar._viewElement.scrollLeft -= e.deltaY;
    } else {
      // noinspection JSSuspiciousNameCombination
      this.gemini.scrollbar._viewElement.scrollLeft += e.deltaY;
    }
  }

  componentDidMount() {
    this.componentDidUpdate();
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

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

  gemini = null;
  render() {
    const { start, end, events } = this.props;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 40;

    const fixedEvents = this.fabricateEndCooldown(events);

    return (
      <GeminiScrollbar
        className="spell-timeline"
        onWheel={this.handleMouseWheel}
        ref={comp => (this.gemini = comp)}
      >
        <div className="ruler">
          {[...Array(seconds)].map((_, second) => (
            <div key={second} style={{ width: secondWidth }}>
              {formatDuration(second)}
            </div>
          ))}
        </div>
        <div className="events">
          {fixedEvents.map(event => {
            if (event.type === 'cast') {
              return (
                <SpellIcon
                  id={event.ability.guid}
                  style={{
                    left: (event.timestamp - start) / 1000 * secondWidth,
                    zIndex: 10,
                  }}
                />
              );
            }
            if (event.type === 'updatespellusable' && event.trigger === 'endcooldown') {
              const left = (event.start - start) / 1000 * secondWidth;
              const maxWidth = seconds * secondWidth - left; // don't expand beyond the container width
              const width = Math.min(maxWidth, (event.end - event.start) / 1000 * secondWidth);
              return (
                <div
                  style={{
                    left,
                    width,
                    background: 'rgba(100, 100, 100, 0.4)',
                    zIndex: 1,
                  }}
                  data-tip={`Cooldown: ${formatMilliseconds(event.end - event.start, false)}s`}
                />
              );
            }

            return null;
          })}
        </div>
      </GeminiScrollbar>
    );
  }
}

export default SpellTimeline;
