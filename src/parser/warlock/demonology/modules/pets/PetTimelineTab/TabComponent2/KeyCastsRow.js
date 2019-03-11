import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import Tooltip from 'common/Tooltip';

import './KeyCastsRow.scss';

export default class KeyCastsRow extends React.PureComponent {
  static propTypes = {
    events: PropTypes.array.isRequired,
  };

  renderCast(event) {
    const spell = SPELLS[event.abilityId] ||{
      name: 'Spell not recognized',
      icon: 'inv_misc_questionmark',
    };

    const icon = (
      <SpellLink
        key={`cast-${event.timestamp}-${event.abilityId}`}
        id={event.abilityId}
        className={`cast${event.important && ' enhanced'}`}
        icon={false}
        style={{
          left: event.left,
        }}
      >
        <Icon
          icon={spell.icon}
          alt={spell.name}
        />
      </SpellLink>
    );

    const tooltipInfo = [];
    if (event.extraInfo) {
      tooltipInfo.push(event.extraInfo);
    }
    if (event.nearbyCasts) {
      tooltipInfo.push(`This cast overlaps with following casts: ${event.nearbyCasts.join(', ')}.`);
    }
    const hasTooltip = tooltipInfo.length > 0;

    if (hasTooltip) {
      return (
        <Tooltip content={tooltipInfo.join('\n')}>
          {icon}
        </Tooltip>
      );
    }
    return icon;
  }

  renderDuration(event) {
    return (
      <div
        key={`duration-${event.timestamp}`}
        className="gcd"
        style={{
          left: event.left,
          width: event.duration,
        }}
      />
    );
  }

  render() {
    const { events } = this.props;
    console.log(events);
    return (
      <div className="key-casts" style={{ borderBottom: 'none', marginBottom: 0 }}>
        {events.map(event => {
          if (event.type === 'cast') {
            return this.renderCast(event);
          }
          else {
            return this.renderDuration(event);
          }
        })}
      </div>
    );
  }
}
