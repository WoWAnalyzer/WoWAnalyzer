import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import Tooltip from 'common/Tooltip';
import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import { EventType } from 'parser/core/Events';

import './Casts.scss';

const ICON_WIDTH = 22;

class Casts extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    parser: PropTypes.shape({
      eventHistory: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
      })).isRequired,
      toPlayer: PropTypes.func.isRequired,
      byPlayer: PropTypes.func.isRequired,
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
      case EventType.Cast:
        if (this.isApplicableCastEvent(event)) {
          return this.renderCast(event);
        } else {
          return null;
        }
      case EventType.BeginChannel:
        if (this.isApplicableCastEvent(event)) {
          return this.renderBeginChannel(event);
        } else {
          return null;
        }
      case EventType.EndChannel:
        return this.renderChannel(event);
      case EventType.GlobalCooldown:
        return this.renderGlobalCooldown(event);
      default:
        return null;
    }
  }
  _lastLowered = null;
  _level = 0;
  _maxLevel = 0;
  renderCast(event) {
    if (event.channel) {
      // If a spell has a channel event, it has a cast time/is channeled and we already rendered it in the `beginchannel` event
      return null;
    }

    let className = '';
    const left = this.getOffsetLeft(event.timestamp);

    // Hoist abilities off the GCD below the main timeline-bar
    const lower = !event.globalCooldown;
    let level = 0;
    if (lower) {
      className += ' lower';
      // Avoid overlapping icons
      const margin = left - this._lastLowered;
      if (this._lastLowered && margin < ICON_WIDTH) {
        this._level += 1;
        level = this._level;
        this._maxLevel = Math.max(this._maxLevel, level);
      } else {
        this._level = 0;
      }
      this._lastLowered = left;
    }

    let castReason;
    const meta = event.meta;
    if (meta) {
      if (meta.isInefficientCast) {
        className += ' inefficient';
        castReason = meta.inefficientCastReason;
      } else if (meta.isEnhancedCast) {
        className += ' enhanced';
        castReason = meta.enhancedCastReason;
      }
    }

    return this.renderIcon(event, {
      className,
      style: {
        '--level': level > 0 ? level : undefined,
      },
      children: lower ? (
        <div className="time-indicator" />
      ) : undefined,
      tooltip: castReason,
    });
  }
  renderBeginChannel(event) {
    let className = '';
    let castReason;
    if (event.isCancelled) {
      className += ' cancelled';
      castReason = <Trans>Cast never finished.</Trans>;
    }
    // If the beginchannel has a meta prop use that.
    // If it doesn't, look inside the trigger (which should be a begincast).
    // If the trigger doesn't have a meta prop, and it's a begincast event, use the cast event's instead. We need to do this since often we can only determine if something was a bad cast on cast finish, e.g. if a player should only cast something while a buff is up on finish.
    // Using the cast event's meta works here since the timeline is only ever called when parsing has finished, so it doesn't matter that it's not chronological.
    // This is kind of an ugly hack, but it's the only way to render an icon on the beginchannel event while allowing maintainers to mark the cast events bad. We could have forced everyone to modify meta on the beginchannel/begincast event instead, but that would be inconvenient and unexpected with no real gain.
    const meta = event.meta || (event.trigger && event.trigger.meta) || (event.trigger && event.trigger.type === EventType.BeginCast && event.trigger.castEvent && event.trigger.castEvent.meta);
    if (meta) {
      if (meta.isInefficientCast) {
        className += ' inefficient';
        castReason = meta.inefficientCastReason;
      } else if (meta.isEnhancedCast) {
        className += ' enhanced';
        castReason = meta.enhancedCastReason;
      }
    }

    return this.renderIcon(event, {
      className,
      tooltip: castReason,
    });
  }
  renderIcon(event, { className = '', style = {}, children, tooltip } = {}) {
    const left = this.getOffsetLeft(event.timestamp);
    const icon = (
      <SpellLink
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

    return (
      <React.Fragment
        // It's possible this complains about "encountered two children with the same key". This is probably caused by fabricating a channel event at a cast time. If you can fix it by removing one of the events that would be great, otherwise you may just have to ignore this as while it's showing a warning, deduplicting the icons is correct behavior.
        key={`cast-${left}-${event.ability.guid}`}
      >
        {tooltip ? (
          <Tooltip content={tooltip}>
            {icon}
          </Tooltip>
        ) : icon}
      </React.Fragment>
    );
  }
  renderChannel(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.start);
    const fightDuration = (event.start - start) / 1000;

    return (
      <Tooltip
        key={`channel-${left}-${event.ability.guid}`}
        content={(
          <Trans>
            {formatDuration(fightDuration, 3)}: {(event.duration / 1000).toFixed(2)}s channel by {event.ability.name}
          </Trans>
        )}
      >
        <div
          className="channel"
          style={{
            left,
            width: event.duration / 1000 * this.props.secondWidth,
          }}
        />
      </Tooltip>
    );
  }
  renderGlobalCooldown(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.timestamp);
    const fightDuration = (event.timestamp - start) / 1000;

    return (
      <Tooltip
        key={`gcd-${left}-${event.ability.guid}`}
        content={(
          <Trans>
            {formatDuration(fightDuration, 3)}: {(event.duration / 1000).toFixed(2)}s Global Cooldown by {event.ability.name}
          </Trans>
        )}
      >
        <div
          className="gcd"
          style={{
            left,
            width: event.duration / 1000 * this.props.secondWidth,
          }}
        />
      </Tooltip>
    );
  }
  render() {
    const { parser } = this.props;

    const content = parser.eventHistory.map(this.renderEvent);

    return (
      <div className="casts" style={{ '--levels': this._maxLevel + 1 }}>
        {content}
      </div>
    );
  }
}

export default Casts;
