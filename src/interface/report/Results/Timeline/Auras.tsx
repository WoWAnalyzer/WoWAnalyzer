import { Trans } from '@lingui/react/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { AbilityEvent, AnyEvent, ApplyBuffEvent, EventType, HasAbility } from 'parser/core/Events';
import AurasModule from 'parser/core/modules/Auras';
import { JSX, PureComponent } from 'react';

import './Auras.scss';
import { TimelineSettingsContext } from './Settings';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  start: number;
  end: number;
  secondWidth?: number;
  parser: CombatLogParser;
  auras: AurasModule;
  style?: React.CSSProperties;
  visibleAuras?: Set<number>;
}

class Auras extends PureComponent<Props> {
  declare context: React.ContextType<typeof TimelineSettingsContext>;

  getOffsetLeft(timestamp: number): number {
    const effTimestamp = Math.min(this.props.end, Math.max(timestamp, this.props.start));
    return (
      ((effTimestamp - this.props.start) / 1000) *
      (this.props.secondWidth ?? this.context.secondWidth)
    );
  }

  isApplicableBuffEvent(event: AnyEvent) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = HasAbility(event) ? event.ability.guid : 0;
    const buff = this.props.auras.getAura(spellId);
    // allow visibleAuras to show buffs that aren't in Auras
    if (!buff?.timelineHighlight) {
      return this.props.visibleAuras?.has(spellId);
    }

    return buff?.timelineHighlight && this.props.visibleAuras?.has(spellId);
  }

  isApplicableDebuffEvent(event: AnyEvent) {
    const parser = this.props.parser;

    if (!parser.toPlayer(event)) {
      // Ignore pet/boss buffs
      return false;
    }
    const spellId = HasAbility(event) ? event.ability.guid : 0;
    const buff = this.props.auras.getAura(spellId);
    // allow visibleAuras to show buffs that aren't in Auras
    if (!buff?.timelineHighlight) {
      return this.props.visibleAuras?.has(spellId);
    }

    return buff?.timelineHighlight && this.props.visibleAuras?.has(spellId);
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
        return this.renderLeftOverAuras();
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

    return this.renderIcon(event, level, {
      className: 'hoist',
      children: <div className="time-indicator" />,
    });
  }
  renderRemoveAura(event: AbilityEvent<EventType>, endsAfterFight = false) {
    let applied = this._applied[event.ability.guid];
    if (!applied) {
      return null;
    }
    const left = this.getOffsetLeft(applied.timestamp);
    const right = this.getOffsetLeft(event.timestamp);
    const duration = event.timestamp - applied.timestamp;
    const fightDuration = applied.timestamp - this.props.parser.fight.start_time;

    const level = this._levels.indexOf(event.ability.guid);
    this._levels[level] = undefined;
    delete this._applied[event.ability.guid];

    return (
      <Tooltip
        key={`buff-${event.timestamp}-${event.ability.guid}-${level}`}
        content={
          <Trans id="interface.report.results.timeline.buffs.tooltip.gainedAbilityForXSec">
            {formatDuration(fightDuration, 3)}: gained {event.ability.name} for{' '}
            {(duration / 1000).toFixed(2)}s
          </Trans>
        }
      >
        <div
          className={`aura hoist ${endsAfterFight ? 'post-fight' : ''}`}
          style={
            {
              left,
              width: right - left,
              '--level': level,
            } as React.CSSProperties
          }
          data-effect="float"
        />
      </Tooltip>
    );
  }
  renderLeftOverAuras() {
    // We don't have a removebuff event for buffs that end *after* the fight, so instead we go through all remaining active buffs and manually trigger the removebuff render.
    const elems: (JSX.Element | null)[] = [];
    Object.keys(this._applied).forEach((spellId) => {
      const applied = this._applied[Number(spellId)];
      elems.push(
        this.renderRemoveAura(
          {
            ...applied,
            timestamp: this.props.end,
          },
          true,
        ),
      );
    });
    return elems;
  }

  renderIcon(
    event: AbilityEvent<EventType>,
    level: number,
    {
      className = '',
      style = {},
      children,
    }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode } = {},
  ) {
    const left = this.getOffsetLeft(event.timestamp);
    return (
      <SpellLink
        key={`cast-${event.timestamp}-${event.ability.guid}-${level}`}
        spell={event.ability.guid}
        icon={false}
        className={`cast ${className} ${event.timestamp < this.props.start ? 'pre-fight' : ''}`}
        style={
          {
            left,
            '--level': level,
            ...style,
          } as React.CSSProperties
        }
      >
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
        {children}
      </SpellLink>
    );
  }

  private aurasToRender(): Iterable<number> {
    if (this.props.visibleAuras) {
      return this.props.visibleAuras;
    }
    return this.props.auras.activeAuras
      .filter((aura) => aura.timelineHighlight)
      .flatMap((aura) => (Array.isArray(aura.spellId) ? aura.spellId : [aura.spellId]));
  }

  render() {
    const { style } = this.props;

    const events = [];

    for (const auraId of this.aurasToRender()) {
      const history = this.props.auras.history(auraId);
      const previous = history.getBefore(this.props.start, true);
      const slice = history.slice(this.props.start, this.props.end);

      if (
        previous &&
        previous.type !== EventType.RemoveBuff &&
        previous.type !== EventType.RemoveDebuff
      ) {
        // little white lie
        events.push({ ...previous, type: EventType.ApplyBuff } as ApplyBuffEvent);
      }

      events.push(...slice);
    }
    events.sort((a, b) => a.timestamp - b.timestamp);
    const auras = events.map(this.renderEvent.bind(this));
    auras.push(...this.renderLeftOverAuras());

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
