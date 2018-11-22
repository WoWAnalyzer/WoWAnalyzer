import React from 'react';
import PropTypes from 'prop-types';

import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

const ICON_WIDTH = 22;

class Casts extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    parser: PropTypes.shape({
      eventHistory: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
      })).isRequired,
    }).isRequired,
  };

  constructor() {
    super();
    this.renderEvent = this.renderEvent.bind(this);
  }

  getOffsetLeft(timestamp) {
    return (timestamp - this.props.start) / 1000 * this.props.secondWidth;
  }

  isApplicableEvent(event) {
    switch (event.type) {
      case 'begincast':
      case 'cast':
      case 'endchannel':
      case 'beginchannel': // TODO: OK THIS WOKRS BUT REALLY NEED TO CLEAN THIS UP SINCE IT'S MESSY AND LIKELY DUPLICATES FROM CAST AND STUFF
        return this.isApplicableCastEvent(event);
      case 'globalcooldown':
        return true;
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

  renderEvent(event) {
    switch (event.type) {
      case 'begincast':
      case 'cast':
      case 'beginchannel':
        return this.renderCast(event);
      case 'endchannel':
        return this.renderChannel(event);
      case 'globalcooldown':
        return this.renderGlobalCooldown(event);
      default:
        return null;
    }
  }
  _lastHoisted = null;
  _level = 0;
  renderCast(event) {
    if (event.channel) {
      return null;
    }

    const left = this.getOffsetLeft(event.timestamp);
    // Hoist abilities off the GCD above the main bar
    const hoist = event.type === 'cast' && !event.globalCooldown;
    let level = 0;
    if (hoist) {
      // Avoid overlapping icons
      const margin = left - this._lastHoisted;
      if (this._lastHoisted && margin < ICON_WIDTH) {
        this._level += 1;
        level = this._level;
      } else {
        this._level = 0;
      }
      this._lastHoisted = left;
    }

    return (
      <SpellLink
        key={`cast-${left}-${event.ability.guid}`}
        id={event.ability.guid}
        icon={false}
        className={`cast ${hoist ? 'hoist' : ''} ${event.isCancelled ? 'cancelled' : ''}`}
        style={{
          left,
          '--level': level > 0 ? level : undefined,
        }}
      >
        {hoist && (
          <div className="time-indicator" />
        )}
        <Icon
          icon={event.ability.abilityIcon.replace('.jpg', '')}
          alt={event.ability.name}
        />
      </SpellLink>
    );
  }
  renderChannel(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.start);
    const fightDuration = (event.timestamp - start) / 1000;

    return (
      <div
        key={`channel-${left}-${event.ability.guid}`}
        className="channel"
        style={{ left, width: event.duration / 1000 * this.props.secondWidth }}
        data-tip={`${formatDuration(fightDuration, 3)}: ${(event.duration / 1000).toFixed(2)}s channel by ${event.ability.name}`}
      />
    );
  }
  renderGlobalCooldown(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.timestamp);
    const fightDuration = (event.timestamp - start) / 1000;

    return (
      <div
        key={`gcd-${left}-${event.ability.guid}`}
        className="gcd"
        style={{ left, width: event.duration / 1000 * this.props.secondWidth }}
        data-tip={`${formatDuration(fightDuration, 3)}: ${(event.duration / 1000).toFixed(2)}s Global Cooldown by ${event.ability.name}`}
      />
    );
  }
  render() {
    const { parser } = this.props;

    return (
      <div className="casts">
        {parser.eventHistory.filter(event => this.isApplicableEvent(event)).map(this.renderEvent)}
      </div>
    );
  }
}

export default Casts;
