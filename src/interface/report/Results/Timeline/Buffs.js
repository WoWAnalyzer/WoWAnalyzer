import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import { formatDuration } from 'common/format';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import BuffsModule from 'parser/core/modules/Buffs';
import { EventType } from 'parser/core/Events';
import Tooltip from 'common/Tooltip';

import './Buffs.scss';

class Buffs extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    parser: PropTypes.shape({
      eventHistory: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
      })).isRequired,
      toPlayer: PropTypes.func.isRequired,
    }).isRequired,
    buffs: PropTypes.instanceOf(BuffsModule).isRequired,
  };

  constructor() {
    super();
    this.renderEvent = this.renderEvent.bind(this);
  }

  getOffsetLeft(timestamp) {
    return (timestamp - this.props.start) / 1000 * this.props.secondWidth;
  }

  // TODO: Fabricate removebuff events for buffs that expired after the fight

  isApplicableBuffEvent(event) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = event.ability.guid;
    const buff = this.props.buffs.getBuff(spellId);
    if (!buff || !buff.timelineHightlight) {
      return false;
    }

    return true;
  }

  renderEvent(event) {
    switch (event.type) {
      case EventType.ApplyBuff:
        if (this.isApplicableBuffEvent(event)) {
          return this.renderApplyBuff(event);
        } else {
          return null;
        }
      case EventType.RemoveBuff:
        if (this.isApplicableBuffEvent(event)) {
          return this.renderRemoveBuff(event);
        } else {
          return null;
        }
      case EventType.FightEnd:
        return this.renderLeftOverBuffs(event);
      default:
        return null;
    }
  }
  _applied = {};
  _levels = [];
  _maxLevel = 0;
  _getLevel() {
    // Look for the first available level, reusing levels that are no longer used
    let level = 0;
    while (this._levels[level] !== undefined) {
      level += 1;
    }
    return level;
  }
  renderApplyBuff(event) {
    const spellId = event.ability.guid;

    // Avoid overlapping icons
    const level = this._getLevel();
    this._applied[spellId] = event;
    this._levels[level] = spellId;
    this._maxLevel = Math.max(this._maxLevel, level);

    return this.renderIcon(event, {
      className: 'hoist',
      style: {
        '--level': level,
      },
      children: <div className="time-indicator" />,
    });
  }
  renderRemoveBuff(event) {
    const applied = this._applied[event.ability.guid];
    if (!applied) {
      // This may occur for broken logs with missing events due to range/logger issues
      return null;
    }
    const left = this.getOffsetLeft(applied.timestamp);
    const duration = event.timestamp - applied.timestamp;
    const fightDuration = (applied.timestamp - this.props.start) / 1000;

    const level = this._levels.indexOf(event.ability.guid);
    this._levels[level] = undefined;
    delete this._applied[event.ability.guid];

    // TODO: tooltip renders at completely wrong places
    return (
      <Tooltip
        key={`buff-${left}-${event.ability.guid}`}
        content={(
          <Trans>
            {formatDuration(fightDuration, 3)}: gained {event.ability.name} for {(duration / 1000).toFixed(2)}s
          </Trans>
        )}
      >
        <div
          className="buff hoist"
          style={{
            left,
            width: (event.timestamp - applied.timestamp) / 1000 * this.props.secondWidth,
            '--level': level,
          }}
          data-effect="float"
        />
      </Tooltip>
    );
  }
  renderLeftOverBuffs(event) {
    // We don't have a removebuff event for buffs that end *after* the fight, so instead we go through all remaining active buffs and manually trigger the removebuff render.
    const elems = [];
    Object.keys(this._applied).forEach(spellId => {
      const applied = this._applied[spellId];
      elems.push(this.renderRemoveBuff({
        ...applied,
        timestamp: event.timestamp,
      }));
    });
    return elems;
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

    const buffs = parser.eventHistory.map(this.renderEvent);

    return (
      <div className="buffs" style={{ '--levels': this._maxLevel + 1 }}>
        {buffs}
      </div>
    );
  }
}

export default Buffs;
