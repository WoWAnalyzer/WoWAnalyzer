import { Trans } from '@lingui/react/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { AbilityEvent, AnyEvent, EventType, HasAbility } from 'parser/core/Events';
import AurasModule from 'parser/core/modules/Auras';
import { JSX, PureComponent } from 'react';

import './Auras.scss';
import { TimelineSettingsContext } from './Settings';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  start: number;
  secondWidth?: number;
  parser: CombatLogParser;
  auras: AurasModule;
  style?: React.CSSProperties;
  visibleAuras?: Set<number>;
  events?: AnyEvent[];
}

class Auras extends PureComponent<Props> {
  declare context: React.ContextType<typeof TimelineSettingsContext>;

  getOffsetLeft(timestamp: number): number {
    return (
      ((timestamp - this.props.start) / 1000) * (this.props.secondWidth ?? this.context.secondWidth)
    );
  }

  // TODO: Fabricate removebuff events for buffs that expired after the fight

  isApplicableBuffEvent(event: AnyEvent) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = HasAbility(event) ? event.ability.guid : 0;
    const buff = this.props.auras.getAura(spellId);
    if (!buff || !buff.timelineHighlight) {
      return false;
    }

    // Check if the aura is visible in the configuration
    if (this.props.visibleAuras && !this.props.visibleAuras.has(spellId)) {
      return false;
    }

    return true;
  }

  isApplicableDebuffEvent(event: AnyEvent) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = HasAbility(event) ? event.ability.guid : 0;
    const buff = this.props.auras.getAura(spellId);
    if (!buff || !buff.timelineHighlight) {
      return false;
    }

    if (this.props.visibleAuras && !this.props.visibleAuras.has(spellId)) {
      return false;
    }

    return true;
  }

  renderEvent(event: AnyEvent) {
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
  _applied: Record<number, AbilityEvent<EventType>> = {};
  _levels: (number | undefined)[] = [];
  _maxLevel = 0;
  _getLevel() {
    // Look for the first available level, reusing levels that are no longer used
    let level = 0;
    while (this._levels[level] !== undefined) {
      level += 1;
    }
    return level;
  }

  renderApplyAura(event: AbilityEvent<EventType>) {
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
      } as React.CSSProperties,
      children: <div className="time-indicator" />,
    });
  }
  renderRemoveAura(event: AbilityEvent<EventType>) {
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
          style={
            {
              left,
              width:
                ((event.timestamp - applied.timestamp) / 1000) *
                (this.props.secondWidth ?? this.context.secondWidth),
              '--level': level,
            } as React.CSSProperties
          }
          data-effect="float"
        />
      </Tooltip>
    );
  }
  renderLeftOverAuras(event: AnyEvent) {
    // We don't have a removebuff event for buffs that end *after* the fight, so instead we go through all remaining active buffs and manually trigger the removebuff render.
    const elems: (JSX.Element | null)[] = [];
    Object.keys(this._applied).forEach((spellId) => {
      const applied = this._applied[Number(spellId)];
      elems.push(
        this.renderRemoveAura({
          ...applied,
          timestamp: event.timestamp,
        }),
      );
    });
    return elems;
  }

  renderIcon(
    event: AbilityEvent<EventType>,
    {
      className = '',
      style = {},
      children,
    }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode } = {},
  ) {
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
    const { parser, style, events: explicitEvents } = this.props;
    const events = explicitEvents ?? parser.eventHistory;

    const auras = events.map(this.renderEvent.bind(this));

    return (
      <div
        className="auras"
        style={
          {
            '--levels': this._maxLevel + 1,
            ...style,
          } as React.CSSProperties
        }
      >
        {auras}
      </div>
    );
  }
}

Auras.contextType = TimelineSettingsContext;

export default Auras;
