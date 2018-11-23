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
      case 'cast':
        if (this.isApplicableCastEvent(event)) {
          return this.renderCast(event);
        } else {
          return null;
        }
      case 'beginchannel':
        if (this.isApplicableCastEvent(event)) {
          return this.renderBeginChannel(event);
        } else {
          return null;
        }
      case 'endchannel':
        return this.renderChannel(event);
      case 'globalcooldown':
        return this.renderGlobalCooldown(event);
      default:
        return null;
    }
  }
  _lastLowered = null;
  _level = 0;
  renderCast(event) {
    if (event.channel) {
      return null;
    }

    const left = this.getOffsetLeft(event.timestamp);

    // Hoist abilities off the GCD above the main bar
    const lower = !event.globalCooldown;
    let level = 0;
    if (lower) {
      // Avoid overlapping icons
      const margin = left - this._lastLowered;
      if (this._lastLowered && margin < ICON_WIDTH) {
        this._level += 1;
        level = this._level;
      } else {
        this._level = 0;
      }
      this._lastLowered = left;
    }

    return this.renderIcon(event, {
      className: lower ? 'lower' : undefined,
      style: {
        '--level': level > 0 ? level : undefined,
      },
      children: lower ? (
        <div className="time-indicator" />
      ) : undefined,
    });
  }
  renderBeginChannel(event) {
    return this.renderIcon(event, {
      className: event.isCancelled ? 'cancelled' : undefined,
    });
  }
  renderIcon(event, { className = '', style = {}, children } = {}) {
    const left = this.getOffsetLeft(event.timestamp);
    return (
      <SpellLink
        key={`cast-${left}-${event.ability.guid}`}
        id={event.ability.guid}
        icon={false}
        className={`cast ${className}`}
        style={{
          left,
          ...style,
        }}
      >
        <Icon
          icon={event.ability.abilityIcon.replace('.jpg', '')}
          alt={event.ability.name}
        />
        {children}
      </SpellLink>
    );
  }
  renderChannel(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.start);
    const fightDuration = (event.start - start) / 1000;

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
        {parser.eventHistory.map(this.renderEvent)}
      </div>
    );
  }
}

export default Casts;
