import React from 'react';
import PropTypes from 'prop-types';
import { formatDuration } from 'common/format';

import './Timeline.css';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import Abilities from 'parser/shared/modules/Abilities';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

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
   * @returns {Map<int, array>} Events grouped by spell. The order of the map is determined by when a spell was first cast. The first spell will be the first spell ever cast.
   */
  getEventsBySpellId(events) {
    // Maintaining insertion order is important because it tells us which spell was cast first
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
   * Separate cooldowns from the rest of the spells.
   * @param {Map<int, array>} eventsBySpellId
   * @returns {{cooldowns: Map<int, array>, others: Map<int, array>}}
   */
  separateCooldowns(eventsBySpellId) {
    const abilities = this.props.abilities;
    const cooldowns = new Map();
    const others = new Map();

    eventsBySpellId.forEach((value, spellId) => {
      const ability = abilities.getAbility(spellId);
      if (ability && ability.category === Abilities.SPELL_CATEGORIES.COOLDOWNS) {
        cooldowns.set(spellId, value);
      } else {
        others.set(spellId, value);
      }
    });

    return { cooldowns, others };
  }
  renderEvent(event, timestampOffset) {
    switch (event.type) {
      case 'cast':
        return this.renderCastEvent(event, timestampOffset);
      case 'updatespellusable':
        return this.renderUpdateSpellUsableEvent(event, timestampOffset);
      default:
        return null;
    }
  }
  renderCastEvent(event, timestampOffset) {
    const left = this.getOffsetLeft(event.timestamp, timestampOffset);

    return (
      <SpellLink
        key={`cast-${left}`}
        id={event.ability.guid}
        icon={false}
        className="cast"
        style={{ left }}
      >
        {/*<div style={{ height: level * 30 + 55, top: negative ? 0 : undefined, bottom: negative ? undefined : 0 }} />*/}
        <Icon
          icon={event.ability.abilityIcon.replace('.jpg', '')}
          alt={event.ability.name}
        />
      </SpellLink>
    );
  }
  renderUpdateSpellUsableEvent(event, timestampOffset) {
    const left = this.getOffsetLeft(event.start, timestampOffset);
    const maxWidth = this.totalWidth - left; // don't expand beyond the container width
    const width = Math.min(maxWidth, (event.timestamp - event.start) / 1000 * this.secondWidth);
    return (
      <div
        key={`cooldown-${left}`}
        className="cooldown"
        style={{
          left,
          width,
        }}
        data-tip={`Cooldown: ${((event.timestamp - event.start) / 1000).toFixed(1)}s`}
        data-effect="float"
      />
    );
  }
  getOffsetTop(index) {
    return this.centerOffset + index * this.laneHeight;
  }
  getOffsetLeft(timestamp, start) {
    return (timestamp - start) / 1000 * this.secondWidth;
  }
  renderLane([spellId, events], index, growUp) {
    const top = this.getOffsetTop(index) * (growUp ? -1 : 1);
    const firstEvent = events[0];
    const left = this.getOffsetLeft(firstEvent.timestamp, this.props.start);

    return (
      <div
        key={spellId}
        className="lane"
        style={{
          top,
          left,
          width: this.totalWidth - left,
        }}
      >
        {events.map(event => this.renderEvent(event, firstEvent.timestamp))}
      </div>
    );
  }

  render() {
    const { start, end, parser, historyBySpellId, globalCooldownHistory, channelHistory, deaths, resurrections, showCooldowns, showGlobalCooldownDuration, abilities, buffEvents } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);
    const { cooldowns, others } = this.separateCooldowns(eventsBySpellId);

    return (
      <div className="spell-timeline" style={{ width: this.totalWidth, padding: '80px 0 400px 0' }}>
        <div className="casts cooldowns">
          {Array.from(cooldowns, (item, index) => this.renderLane(item, index, true))}
        </div>
        <div className="time-line">
          {this.seconds > 0 && [...Array(this.seconds)].map((_, second) => {
            return (
              <div key={second} style={{ width: this.secondWidth * skipInterval }} data-duration={formatDuration(second)} />
            );
          })}
        </div>
        <div className="casts">
          {Array.from(others, (item, index) => this.renderLane(item, index, false))}
        </div>
      </div>
    );
  }
}

export default Timeline;
