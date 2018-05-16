import React from 'react';
import PropTypes from 'prop-types';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactTooltip from 'react-tooltip';
import 'gemini-scrollbar/gemini-scrollbar.css';

import { formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';

import SpellRow from './SpellRow';
import DeathEvents from './DeathEvents';

import './SpellTimeline.css';

class SpellTimeline extends React.PureComponent {
  static propTypes = {
    historyBySpellId: PropTypes.object.isRequired,
    globalCooldownHistory: PropTypes.array.isRequired,
    channelHistory: PropTypes.array.isRequired,
    abilities: PropTypes.object.isRequired,
    abilityTracker: PropTypes.object.isRequired,
    spellId: PropTypes.number,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    deaths: PropTypes.array.isRequired,
    resurrections: PropTypes.array.isRequired,
    showCooldowns: PropTypes.bool,
    showGlobalCooldownDuration: PropTypes.bool,
    buffEvents: PropTypes.object,
  };
  static defaultProps = {
    showCooldowns: false,
    showGlobalCooldownDuration: false,
  };

  constructor() {
    super();
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.state = {
      zoom: 2,
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
    const { spellId, historyBySpellId, abilities, abilityTracker } = this.props;
    const spellIds = spellId ? [spellId] : Object.keys(historyBySpellId).map(Number);

    return spellIds
      .map(spellId => Number(spellId))
      .filter(key => key > 0) //filter out fake spells (spell id <= 0)
      .sort((a, b) => {
        const aSortIndex = abilities.getTimelineSortIndex(a);
        const bSortIndex = abilities.getTimelineSortIndex(b);
        const aIndex = aSortIndex !== undefined ? aSortIndex : Number.MAX_VALUE;
        const bIndex = bSortIndex !== undefined ? bSortIndex : Number.MAX_VALUE;
        const aCasts = abilityTracker.getAbility(a).casts;
        const bCasts = abilityTracker.getAbility(b).casts;
        return aIndex - bIndex || bCasts - aCasts;
      });

  }

  gemini = null;
  render() {
    const { start, end, historyBySpellId, globalCooldownHistory, channelHistory, deaths, resurrections, showCooldowns, showGlobalCooldownDuration, abilities, buffEvents, ...others } = this.props;
    delete others.abilityTracker;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 80 / this.state.zoom;
    const skipInterval = Math.ceil(40 / secondWidth);

    // 9 for the scrollbar height
    // 4 for margin
    // 36 for the ruler
    // 28 for each timeline row
    const rows = this.spells.length + (showGlobalCooldownDuration && globalCooldownHistory ? 1 : 0) + (channelHistory ? 1 : 0);
    const totalHeight = 9 + 4 + 36 + 28 * rows;

    const totalWidth = seconds * secondWidth;

    return (
      <div className="spell-timeline flex" {...others}>
        <div className="flex-sub legend">
          <div className="lane ruler-lane">
            <div className="btn-group">
              {[1, 2, 3, 5, 10].map(zoom => (
                <button key={zoom} className={`btn btn-default btn-xs ${zoom === this.state.zoom ? 'active' : ''}`} onClick={() => this.setState({ zoom })}>{zoom}x</button>
              ))}
            </div>
          </div>
          {showGlobalCooldownDuration && globalCooldownHistory && (
            <div className="lane">
              GCD
            </div>
          )}
          {channelHistory && (
            <div className="lane">
              Channeling
            </div>
          )}
          {this.spells.map(spellId => (
            <div className="lane" key={spellId}>
              <SpellLink id={spellId}>
                {abilities.getAbility(spellId).name}
              </SpellLink>
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
            {seconds > 0 && [...Array(seconds)].map((_, second) => {
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
          {showGlobalCooldownDuration && globalCooldownHistory && (
            <div className="events lane" style={{ width: totalWidth }}>
              {globalCooldownHistory.map(event => {
                const eventStart = event.start || event.timestamp;
                const fightDuration = (eventStart - start) / 1000;
                const left = fightDuration * secondWidth;
                const maxWidth = totalWidth - left; // don't expand beyond the container width
                return (
                  <div
                    key={`${event.trigger.type}-${eventStart}-${event.duration}`}
                    className="casting-time"
                    style={{
                      left,
                      width: Math.min(maxWidth, event.duration / 1000 * secondWidth),
                    }}
                    data-tip={`${formatDuration(fightDuration, 3)}: ${(event.duration / 1000).toFixed(1)}s Global Cooldown by ${event.ability.name}`}
                  />
                );
              })}
            </div>
          )}
          {channelHistory && (
            <div className="events lane" style={{ width: totalWidth }}>
              {channelHistory.map(event => {
                const eventStart = event.start || event.timestamp;
                const left = (eventStart - start) / 1000 * secondWidth;
                const maxWidth = totalWidth - left; // don't expand beyond the container width
                return (
                  <div
                    key={`${eventStart}-${event.duration}`}
                    className="casting-time"
                    style={{
                      left,
                      width: Math.min(maxWidth, event.duration / 1000 * secondWidth),
                    }}
                    data-tip={`Casting time: ${(event.duration / 1000).toFixed(1)}s (${event.ability.name})`}
                  />
                );
              })}
            </div>
          )}
          {this.spells.map(spellId => (
            <SpellRow
              key={spellId}
              className="lane"
              events={historyBySpellId[spellId] || []}
              buffEvents={buffEvents[abilities.getBuffSpellId(spellId)]}
              start={start}
              totalWidth={totalWidth}
              secondWidth={secondWidth}
              showCooldowns={showCooldowns}
            />
          ))}
          <DeathEvents
            start={start}
            secondWidth={secondWidth}
            deaths={deaths}
            resurrections={resurrections}
            invalidated={deaths.length + resurrections.length}
          />
        </GeminiScrollbar>
      </div>
    );
  }
}

export default SpellTimeline;
