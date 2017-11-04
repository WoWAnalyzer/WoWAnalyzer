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

  gemini = null;
  render() {
    const { start, end, events } = this.props;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 50;

    return (
      <GeminiScrollbar
        className="spell-timeline"
        onWheel={this.handleMouseWheel}
        ref={comp => (this.gemini = comp)}
      >
        <div className="ruler">
          {[...Array(seconds)].map((_, second) => (
            <div key={second}>
              {formatDuration(second)}
            </div>
          ))}
        </div>
        <div className="events">
          {events.map(event => {
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
              return (
                <div
                  style={{
                    left: (event.start - start) / 1000 * secondWidth,
                    width: (event.end - event.start) / 1000 * secondWidth,
                    background: 'rgba(255, 255, 255, 0.2)',
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
