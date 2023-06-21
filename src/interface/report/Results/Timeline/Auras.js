import { Trans } from '@lingui/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { EventType } from 'parser/core/Events';
import AurasModule from 'parser/core/modules/Auras';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import './Auras.scss';

class Auras extends PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    parser: PropTypes.shape({
      eventHistory: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
        }),
      ).isRequired,
      toPlayer: PropTypes.func.isRequired,
    }).isRequired,
    auras: PropTypes.instanceOf(AurasModule).isRequired,
    style: PropTypes.object,
  };

  constructor() {
    super();
    this.renderEvent = this.renderEvent.bind(this);
  }

  getOffsetLeft(timestamp) {
    return ((timestamp - this.props.start) / 1000) * this.props.secondWidth;
  }

  // TODO: Fabricate removebuff events for buffs that expired after the fight

  isApplicableBuffEvent(event) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = event.ability.guid;
    const buff = this.props.auras.getAura(spellId);
    if (!buff || !buff.timelineHighlight) {
      return false;
    }

    return true;
  }

  isApplicableDebuffEvent(event) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = event.ability.guid;
    const buff = this.props.auras.getAura(spellId);
    if (!buff || !buff.timelineHighlight) {
      return false;
    }

    return true;
  }

  renderEvent(event) {
    switch (event.type) {
      case EventType.ApplyBuff:
        if (this.isApplicableBuffEvent(event)) {
          return this.renderApplyAura(event);
        } else {
          return null;
        }
      case EventType.RemoveBuff:
        if (this.isApplicableBuffEvent(event)) {
          return this.renderRemoveAura(event);
        } else {
          return null;
        }
      case EventType.ApplyDebuff:
        if (this.isApplicableDebuffEvent(event)) {
          return this.renderApplyAura(event);
        } else {
          return null;
        }
      case EventType.RemoveDebuff:
        if (this.isApplicableDebuffEvent(event)) {
          return this.renderRemoveAura(event);
        } else {
          return null;
        }
      case EventType.FightEnd:
        return this.renderLeftOverAuras(event);
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
  renderApplyAura(event) {
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
  renderRemoveAura(event) {
    const applied = this._applied[event.ability.guid];
    if (!applied) {
      // This may occur for broken logs with missing events due to range/logger issues
      return null;
    }
    const left = this.getOffsetLeft(applied.timestamp);
    const duration = event.timestamp - applied.timestamp;
    const fightDuration = applied.timestamp - this.props.start;

    const level = this._levels.indexOf(event.ability.guid);
    this._levels[level] = undefined;
    delete this._applied[event.ability.guid];

    // TODO: tooltip renders at completely wrong places
    return (
      <Tooltip
        key={`buff-${left}-${event.ability.guid}`}
        content={
          <Trans id="interface.report.results.timeline.buffs.tooltip.gainedAbilityForXSec">
            {formatDuration(fightDuration, 3)}: gained {event.ability.name} for{' '}
            {(duration / 1000).toFixed(2)}s
          </Trans>
        }
      >
        <div
          className="aura hoist"
          style={{
            left,
            width: ((event.timestamp - applied.timestamp) / 1000) * this.props.secondWidth,
            '--level': level,
          }}
          data-effect="float"
        />
      </Tooltip>
    );
  }
  renderLeftOverAuras(event) {
    // We don't have a removebuff event for buffs that end *after* the fight, so instead we go through all remaining active buffs and manually trigger the removebuff render.
    const elems = [];
    Object.keys(this._applied).forEach((spellId) => {
      const applied = this._applied[spellId];
      elems.push(
        this.renderRemoveAura({
          ...applied,
          timestamp: event.timestamp,
        }),
      );
    });
    return elems;
  }
  renderIcon(event, { className = '', style = {}, children } = {}) {
    const left = this.getOffsetLeft(event.timestamp);
    return (
      <SpellLink
        key={`cast-${left}-${event.ability.guid}`}
        spell={event.ability.guid}
        icon={false}
        className={`cast ${className}`}
        style={{
          left,
          ...style,
        }}
      >
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
        {children}
      </SpellLink>
    );
  }
  render() {
    const { parser, style } = this.props;

    const auras = parser.eventHistory.map(this.renderEvent);

    return (
      <div
        className="auras"
        style={{
          '--levels': this._maxLevel + 1,
          ...style,
        }}
      >
        {auras}
      </div>
    );
  }
}

export default Auras;
