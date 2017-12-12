import React from 'react';
import PropTypes from 'prop-types';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactTooltip from 'react-tooltip';
import 'gemini-scrollbar/gemini-scrollbar.css';

import { formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Events from './Events';

import './SpellTimeline.css';

class SpellTimeline extends React.PureComponent {
  static propTypes = {
    historyBySpellId: PropTypes.object.isRequired,
    abilities: PropTypes.object.isRequired,
    spellId: PropTypes.number,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.state = {
      zoom: 1,
    };
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

  get spells() {
    const { spellId, historyBySpellId, abilities } = this.props;
    const spellIds = spellId ? [spellId] : Object.keys(historyBySpellId).map(Number);

    return spellIds.sort((a, b) => {
      const aCooldown = abilities.getExpectedCooldownDuration(Number(a));
      const bCooldown = abilities.getExpectedCooldownDuration(Number(b));
      return aCooldown - bCooldown;
    });
  }

  gemini = null;
  render() {
    const { start, end, historyBySpellId } = this.props;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 40 / this.state.zoom;
    const skipInterval = Math.ceil(40 / secondWidth);

    // 9 for the scrollbar height
    // 4 for margin
    // 36 for the ruler
    // 28 for each spell
    const totalHeight = 9 + 4 + 36 + 28 * this.spells.length;

    const totalWidth = seconds * secondWidth;

    return (
      <div className="spell-timeline flex">
        <div className="flex-sub legend">
          <div className="lane ruler-lane">
            <div className="btn-group">
              {[1, 2, 3, 5].map(zoom => (
                <button key={zoom} className={`btn btn-default btn-xs ${zoom === this.state.zoom ? 'active' : ''}`} onClick={() => this.setState({ zoom })}>{zoom}x</button>
              ))}
            </div>
          </div>
          {this.spells.map(spellId => (
            <div className="lane" key={spellId}>
              <SpellIcon id={spellId} noLink /> <SpellLink id={spellId} />
            </div>
          ))}
        </div>
        <GeminiScrollbar
          className="timeline flex-main"
          style={{ height: totalHeight }}
          onWheel={this.handleMouseWheel}
          ref={comp => (this.gemini = comp)}
        >
          <div className={`ruler interval-${skipInterval}`} style={{ width: totalWidth }}>
            {seconds && [...Array(seconds)].map((_, second) => {
              if (second % skipInterval !== 0) {
                // Skip every second second when the text width becomes larger than the container
                return null;
              }
              return (
                <div key={second} className="lane" style={{ width: secondWidth * skipInterval }}>
                  {formatDuration(second)}
                </div>
              );
            })}
          </div>
          {this.spells.map(spellId => (
            <Events key={spellId} className="lane" events={historyBySpellId[spellId] || []} start={start} totalWidth={totalWidth} secondWidth={secondWidth} />
          ))}
        </GeminiScrollbar>
      </div>
    );
  }
}

export default SpellTimeline;
