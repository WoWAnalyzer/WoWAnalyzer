import React from 'react';
import PropTypes from 'prop-types';

import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';

const ICON_WIDTH = 22;

class Casts extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
    })).isRequired,
  };

  constructor() {
    super();
    this.renderEvent = this.renderEvent.bind(this);
  }

  getOffsetLeft(timestamp) {
    return (timestamp - this.props.start) / 1000 * this.props.secondWidth;
  }

  renderEvent(event) {
    switch (event.type) {
      case 'begincast':
        return this.renderCast(event);
      case 'cast':
        return this.renderCast(event);
      case 'globalcooldown':
        return this.renderGlobalCooldown(event);
      default:
        return null;
    }
  }
  _lastHoisted = null;
  _level = 0;
  renderCast(event) {
    const left = this.getOffsetLeft(event.timestamp);
    if (event.channel) {
      return null;
    }

    const hoist = !event.globalCooldown && event.type !== 'begincast';
    let level = 0;
    if (hoist) {
      const margin = left - this._lastHoisted;
      if (margin < ICON_WIDTH) {
        this._level += 1;
        level = this._level;
      } else {
        this._level = 0;
      }
      this._lastHoisted = left;
    }

    return (
      <SpellLink
        key={`cast-${event.ability.guid}-${left}`}
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
  renderGlobalCooldown(event) {
    const start = this.props.start;
    const left = this.getOffsetLeft(event.timestamp);
    const fightDuration = (event.timestamp - start) / 1000;

    return (
      <div
        key={`gcd-${left}`}
        id={event.ability.guid}
        className="gcd"
        style={{ left, width: event.duration / 1000 * this.props.secondWidth }}
        data-tip={`${formatDuration(fightDuration, 3)}: ${(event.duration / 1000).toFixed(2)}s Global Cooldown by ${event.ability.name}`}
      />
    );
  }
  render() {
    const { children } = this.props;

    return (
      <div className="casts">
        {children.map(this.renderEvent)}
      </div>
    );
  }
}

export default Casts;
