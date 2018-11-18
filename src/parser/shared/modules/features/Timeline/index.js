import React from 'react';
import PropTypes from 'prop-types';
import { formatDuration } from 'common/format';

import './Timeline.css';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import Abilities from 'parser/shared/modules/Abilities';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Lane from 'parser/shared/modules/features/Timeline/Lane';

class Timeline extends React.PureComponent {
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
    showCooldowns: true,
    showGlobalCooldownDuration: false,
  };

  constructor() {
    super();
    this.state = {
      zoom: 2,
    };
  }

  get duration() {
    return this.props.end - this.props.start;
  }
  get seconds() {
    return Math.ceil(this.duration / 1000);
  }
  get secondWidth() {
    return 80 / this.state.zoom;
  }
  get totalWidth() {
    return this.seconds * this.secondWidth;
  }
  laneHeight = 22;
  centerOffset = 25;

  isApplicableEvent(event) {
    switch (event.type) {
      case 'cast':
        return this.isApplicableCastEvent(event);
      case 'updatespellusable':
        return this.isApplicableUpdateSpellUsableEvent(event);
      default:
        return false;
    }
  }
  isApplicableCastEvent(event) {
    const parser = this.props.parser;

    if (!parser.byPlayer(event)) {
      // Ignore pet/boss casts
      return false;
    }
    const spellId = event.ability.guid;
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
      return false;
    }
    return true;
  }
  isApplicableUpdateSpellUsableEvent(event) {
    if (event.trigger !== 'endcooldown' && event.trigger !== 'restorecharge') {
      // begincooldown is unnecessary since endcooldown includes the start time
      return false;
    }
    return true;
  }
  /**
   * @param {object[]} events
   * @returns {Map<int, object[]>} Events grouped by spell id.
   */
  getEventsBySpellId(events) {
    const eventsBySpellId = new Map();
    events.forEach(event => {
      if (!this.isApplicableEvent(event)) {
        return;
      }

      const spellId = event.ability.guid;
      if (!eventsBySpellId.has(spellId)) {
        eventsBySpellId.set(spellId, []);
      }
      eventsBySpellId.get(spellId).push(event);
    });
    return eventsBySpellId;
  }
  /**
   * Separate cast windows from the rest of the spells.
   * @param {Map<int, object[]>} eventsBySpellId
   * @returns {{castWindows: Map<int, object[]>, others: Map<int, object[]>}}
   */
  separateCastWindows(eventsBySpellId) {
    const abilities = this.props.abilities;
    const castWindows = new Map();
    const others = new Map();

    eventsBySpellId.forEach((value, spellId) => {
      const ability = abilities.getAbility(spellId);
      if (ability && ability.timelineSortIndex < 0) {
        castWindows.set(spellId, value);
      } else {
        others.set(spellId, value);
      }
    });

    return { castWindows, others };
  }
  getOffsetTop(index) {
    return this.centerOffset + index * this.laneHeight;
  }
  getOffsetLeft(timestamp, start) {
    return (timestamp - start) / 1000 * this.secondWidth;
  }

  renderLane([spellId, events], index, growUp) {
    const firstEvent = events[0];
    const left = this.getOffsetLeft(firstEvent.timestamp, this.props.start);
    return (
      <Lane
        key={spellId}
        spellId={spellId}
        style={{
          top: this.getOffsetTop(index) * (growUp ? -1 : 1),
          left,
          width: this.totalWidth - left,
        }}
        timestampOffset={firstEvent.timestamp}
        secondWidth={this.secondWidth}
      >
        {events}
      </Lane>
    );
  }

  getSortIndex(spellId) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability || ability.timelineSortIndex === undefined) {
      return spellId;
    } else {
      return ability.timelineSortIndex;
    }
  }
  renderLanes(eventsBySpellId, growUp) {
    return Array.from(eventsBySpellId)
      .sort((a, b) => this.getSortIndex(growUp ? b[0] : a[0]) - this.getSortIndex(growUp ? a[0] : b[0]))
      .map((item, index) => this.renderLane(item, index, growUp));
  }

  render() {
    const { start, end, parser, historyBySpellId, globalCooldownHistory, channelHistory, deaths, resurrections, showCooldowns, showGlobalCooldownDuration, abilities, buffEvents } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);
    const { castWindows, others } = this.separateCastWindows(eventsBySpellId);

    return (
      <div className="spell-timeline" style={{ width: this.totalWidth, padding: '80px 0 400px 0' }}>
        <div className="casts cooldowns">
          {this.renderLanes(castWindows, true)}
        </div>
        <div className="time-line">
          {this.seconds > 0 && [...Array(this.seconds)].map((_, second) => {
            return (
              <div key={second} style={{ width: this.secondWidth * skipInterval }} data-duration={formatDuration(second)} />
            );
          })}
        </div>
        <div className="casts">
          {this.renderLanes(others, false)}
        </div>
      </div>
    );
  }
}

export default Timeline;
