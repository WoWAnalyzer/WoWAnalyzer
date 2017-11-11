import React from 'react';
import PropTypes from 'prop-types';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactTooltip from 'react-tooltip';
import 'gemini-scrollbar/gemini-scrollbar.css';

import { formatDuration } from 'common/format';

import Events from './Events';

import './SpellTimeline.css';

class SpellTimeline extends React.PureComponent {
  static propTypes = {
    historyBySpellId: PropTypes.object.isRequired,
    castEfficiency: PropTypes.object.isRequired,
    spellId: PropTypes.number,
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

  renderEvents(secondWidth) {
    const { start, end, historyBySpellId, spellId, castEfficiency } = this.props;
    if (spellId) {
      return (
        <Events events={historyBySpellId[spellId] || []} start={start} end={end} secondWidth={secondWidth} />
      );
    } else {
      return Object.keys(historyBySpellId)
        .sort((a, b) => {
          const aCooldown = castEfficiency.getExpectedCooldownDuration(Number(a));
          const bCooldown = castEfficiency.getExpectedCooldownDuration(Number(b));

          return aCooldown - bCooldown;
        })
        .map(spellId => (
          <Events key={spellId} events={historyBySpellId[spellId] || []} start={start} end={end} secondWidth={secondWidth} />
        ));
    }
  }
  gemini = null;
  render() {
    const { start, end, historyBySpellId, spellId } = this.props;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 20;
    const textDoesntFit = secondWidth < 40;

    return (
      <GeminiScrollbar
        className="spell-timeline"
        style={{ height: 12 + 28 + 28 * (spellId ? 1 : Object.keys(historyBySpellId).length) }}
        onWheel={this.handleMouseWheel}
        ref={comp => (this.gemini = comp)}
      >
        <div className="ruler">
          {[...Array(seconds)].map((_, second) => {
            if (textDoesntFit && second % 2 === 1) {
              // Skip every second second when the text width becomes larger than the container
              return null;
            }
            return (
              <div key={second} style={{ width: secondWidth * (textDoesntFit ? 2 : 1) }}>
                {formatDuration(second)}
              </div>
            );
          })}
        </div>
        {this.renderEvents(secondWidth)}
      </GeminiScrollbar>
    );
  }
}

export default SpellTimeline;
