import React from 'react';
import PropTypes from 'prop-types';

import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

const ICON_WIDTH = 22;

class Buffs extends React.PureComponent {
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

  isApplicableBuffEvent(event) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = event.ability.guid;
    const buff = this.props.buffs.getBuff(spellId);
    // console.log(buff, spellId, event.ability.name, this.props.buffs.activeBuffs)
    if (!buff || !buff.timelineHightlight) {
      return false;
    }

    return true;
  }

  renderEvent(event) {
    switch (event.type) {
      case 'applybuff':
        if (this.isApplicableBuffEvent(event)) {
          return this.renderApplyBuff(event);
        } else {
          return null;
        }
      case 'removebuff':
        if (this.isApplicableBuffEvent(event)) {
          return this.renderRemoveBuff(event);
        } else {
          return null;
        }
      default:
        return null;
    }
  }
  _applied = {};
  _levels = {};
  renderApplyBuff(event) {
    // Avoid overlapping icons
    const level = Object.keys(this._levels).length;

    this._applied[event.ability.guid] = event.timestamp;
    this._levels[event.ability.guid] = level;

    return this.renderIcon(event, {
      className: 'hoist',
      style: {
        '--level': level > 0 ? level : undefined,
      },
      children: <div className="time-indicator" />,
    });
  }
  renderRemoveBuff(event) {
    const applied = this._applied[event.ability.guid];
    const left = this.getOffsetLeft(applied);
    const duration = event.timestamp - applied;
    const fightDuration = (applied - this.props.start) / 1000;

    const level = this._levels[event.ability.guid];
    delete this._levels[event.ability.guid];

    return (
      <div
        key={`buff-${left}-${event.ability.guid}`}
        className="buff hoist"
        style={{
          left,
          width: (event.timestamp - applied) / 1000 * this.props.secondWidth,
          '--level': level > 0 ? level : undefined,
        }}
        data-tip={`${formatDuration(fightDuration, 3)}: gained ${event.ability.name} for ${(duration / 1000).toFixed(2)}s`}
        data-effect="float"
      />
    );
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
  render() {
    const { parser } = this.props;

    return (
      <div className="buffs">
        {parser.eventHistory.map(this.renderEvent)}
      </div>
    );
  }
}

export default Buffs;
