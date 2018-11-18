import React from 'react';

import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import PropTypes from 'prop-types';

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
  renderCast(event) {
    const left = this.getOffsetLeft(event.timestamp);
    if (event.channel) {
      return null;
    }

    const hoist = !event.globalCooldown && event.type !== 'begincast';

    return (
      <SpellLink
        key={`cast-${event.ability.guid}-${left}`}
        id={event.ability.guid}
        icon={false}
        className={`cast ${hoist ? 'off-gcd' : ''}`}
        style={{ left }}
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
