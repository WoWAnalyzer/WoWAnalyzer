import { Trans } from '@lingui/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CombatLogParser from 'parser/core/CombatLogParser';
import {
  AnyEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import React, { CSSProperties, ReactNode } from 'react';

import './Casts.scss';

const ICON_WIDTH = 22;

const isApplicableCastEvent = (event: CastEvent | BeginChannelEvent) => {
  const spellId = event.ability.guid;
  if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
    return false;
  }
  return true;
};
export const isApplicableEvent = (parser: CombatLogParser) => (event: AnyEvent) => {
  if (!parser.byPlayer(event)) {
    // Ignore pet/boss casts
    return false;
  }

  switch (event.type) {
    case EventType.Cast:
    case EventType.BeginChannel:
      return isApplicableCastEvent(event);
    case EventType.EndChannel:
    case EventType.GlobalCooldown:
      return true;
    default:
      return false;
  }
};

interface Props {
  start: number;
  secondWidth: number;
  events: AnyEvent[];
}

const Casts = ({ start, secondWidth, events }: Props) => {
  const getOffsetLeft = (timestamp: number) => ((timestamp - start) / 1000) * secondWidth;

  const renderIcon = (
    event: CastEvent | BeginChannelEvent,
    {
      className = '',
      style = {},
      children,
      tooltip,
    }: {
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
      tooltip?: ReactNode;
    } = {},
  ) => {
    const left = getOffsetLeft(event.timestamp);

    const linkIcon = (children: ReactNode) => (
      <SpellLink
        id={event.ability.guid}
        icon={false}
        className={`cast ${className}`}
        style={{
          left,
          ...style,
        }}
      >
        {children}
      </SpellLink>
    );
    const icon = (
      <>
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
        {children}
      </>
    );

    return (
      <React.Fragment
        // It's possible this complains about "encountered two children with the same key". This is probably caused by fabricating a channel event at a cast time. If you can fix it by removing one of the events that would be great, otherwise you may just have to ignore this as while it's showing a warning, deduplicting the icons is correct behavior.
        key={`cast-${left}-${event.ability.guid}`}
      >
        {tooltip ? (
          <Tooltip content={tooltip}>
            <div className={`cast ${className}`} style={{ left, ...style }}>
              {icon}
            </div>
          </Tooltip>
        ) : (
          linkIcon(icon)
        )}
      </React.Fragment>
    );
  };

  let _lastLowered: number | null = null;
  let _level = 0;
  let _maxLevel = 0;
  const renderCast = (event: CastEvent) => {
    if (event.channel) {
      // If a spell has a channel event, it has a cast time/is channeled and we already rendered it in the `beginchannel` event
      return null;
    }

    let className = '';
    const left = getOffsetLeft(event.timestamp);

    // Hoist abilities off the GCD below the main timeline-bar
    const lower = !event.globalCooldown;
    let level = 0;
    if (lower) {
      className += ' lower';
      // Avoid overlapping icons
      if (_lastLowered && left - _lastLowered < ICON_WIDTH) {
        _level += 1;
        level = _level;
        _maxLevel = Math.max(_maxLevel, level);
      } else {
        _level = 0;
      }
      _lastLowered = left;
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

    return renderIcon(event, {
      className,
      style: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        '--level': level > 0 ? level : undefined,
      },
      children: lower ? <div className="time-indicator" /> : undefined,
      tooltip: castReason,
    });
  };
  const renderBeginChannel = (event: BeginChannelEvent) => {
    let className = '';
    let castReason;
    if (event.isCancelled) {
      className += ' cancelled';
      castReason = (
        <Trans id="interface.report.results.timeline.casts.neverFinished">
          Cast never finished.
        </Trans>
      );
    }
    // If the beginchannel has a meta prop use that.
    // If it doesn't, look inside the trigger (which should be a begincast).
    // If the trigger doesn't have a meta prop, and it's a begincast event, use the cast event's instead. We need to do this since often we can only determine if something was a bad cast on cast finish, e.g. if a player should only cast something while a buff is up on finish.
    // Using the cast event's meta works here since the timeline is only ever called when parsing has finished, so it doesn't matter that it's not chronological.
    // This is kind of an ugly hack, but it's the only way to render an icon on the beginchannel event while allowing maintainers to mark the cast events bad. We could have forced everyone to modify meta on the beginchannel/begincast event instead, but that would be inconvenient and unexpected with no real gain.
    const meta =
      event.meta ||
      (event.trigger && event.trigger.meta) ||
      (event.trigger &&
        event.trigger.type === EventType.BeginCast &&
        event.trigger.castEvent &&
        event.trigger.castEvent.meta);
    if (meta) {
      if (meta.isInefficientCast) {
        className += ' inefficient';
        castReason = meta.inefficientCastReason;
      } else if (meta.isEnhancedCast) {
        className += ' enhanced';
        castReason = meta.enhancedCastReason;
      }
    }

    return renderIcon(event, {
      className,
      tooltip: castReason,
    });
  };
  const renderChannel = (event: EndChannelEvent) => {
    const left = getOffsetLeft(event.start);
    const fightDuration = event.start - start;

    return (
      <Tooltip
        key={`channel-${left}-${event.ability.guid}`}
        content={
          <Trans id="interface.report.results.timeline.casts.tooltip.xSecChannelByAbility">
            {formatDuration(fightDuration, 3)}: {(event.duration / 1000).toFixed(2)}s channel by{' '}
            {event.ability.name}
          </Trans>
        }
      >
        <div
          className="channel"
          style={{
            left,
            width: (event.duration / 1000) * secondWidth,
          }}
        />
      </Tooltip>
    );
  };
  const renderGlobalCooldown = (event: GlobalCooldownEvent) => {
    const left = getOffsetLeft(event.timestamp);
    const fightDuration = event.timestamp - start;

    return (
      <Tooltip
        key={`gcd-${left}-${event.ability.guid}`}
        content={
          <Trans id="interface.report.results.timeline.casts.tooltip.xSecGCDByAbility">
            {formatDuration(fightDuration, 3)}: {(event.duration / 1000).toFixed(2)}s Global
            Cooldown by {event.ability.name}
          </Trans>
        }
      >
        <div
          className="gcd"
          style={{
            left,
            width: (event.duration / 1000) * secondWidth,
          }}
        />
      </Tooltip>
    );
  };

  const renderEvent = (event: AnyEvent) => {
    switch (event.type) {
      case EventType.Cast:
        return renderCast(event);
      case EventType.BeginChannel:
        return renderBeginChannel(event);
      case EventType.EndChannel:
        return renderChannel(event);
      case EventType.GlobalCooldown:
        return renderGlobalCooldown(event);
      default:
        return null;
    }
  };

  const content = events.map(renderEvent);

  return (
    <div
      className="casts"
      style={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        '--levels': _maxLevel + 1,
      }}
    >
      {content}
    </div>
  );
};

export default Casts;
