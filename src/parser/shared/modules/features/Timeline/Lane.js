import React from 'react';
import PropTypes from 'prop-types';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';

class Lane extends React.PureComponent {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.object).isRequired,
    timestampOffset: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    style: PropTypes.object,
  };

  getOffsetLeft(timestamp) {
    return (timestamp - this.props.timestampOffset) / 1000 * this.props.secondWidth;
  }

  renderEvent(event) {
    switch (event.type) {
      case 'cast':
        return this.renderCast(event);
      case 'updatespellusable':
        if (event.trigger === 'restorecharge') {
          return (
            <>
              {this.renderCooldown(event)}
              {this.renderRecharge(event)}
            </>
          );
        } else {
          return this.renderCooldown(event);
        }
      default:
        return null;
    }
  }
  renderCast(event) {
    const left = this.getOffsetLeft(event.timestamp);

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
  renderCooldown(event) {
    const left = this.getOffsetLeft(event.start);
    const width = (event.timestamp - event.start) / 1000 * this.props.secondWidth;
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
  renderRecharge(event) {
    const left = this.getOffsetLeft(event.timestamp);
    return (
      <div
        key={`recharge-${left}`}
        className="recharge"
        style={{
          left,
        }}
        data-tip="Charge Restored"
      />
    );
  }

  render() {
    const { children, style } = this.props;

    const ability = children[0].ability;

    return (
      <div
        className="lane"
        style={style}
      >
        <div className="legend">
          <Icon
            icon={ability.abilityIcon.replace('.jpg', '')}
            alt={ability.name}
          />
        </div>

        {children.map(event => this.renderEvent(event))}
      </div>
    );
  }
}

export default Lane;
