import { Trans } from '@lingui/react/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import {
  AnyEvent,
  AutoAttackCooldownEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventMeta,
  EventType,
  FreeCastEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import { Fragment, CSSProperties, HTMLAttributes, ReactNode, use } from 'react';

import './Casts.scss';
import { addInefficientCastReason, Reason } from 'parser/core/EventMetaLib';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { TimelineSettingsContext } from './Settings';
import CastHealInfoModule from 'parser/shared/modules/CastHealInfo';
import { formatNumber, formatPercentage } from 'common/format';

const ICON_WIDTH = 22;
const ICON_HEIGHT = 22;
const OFFGCD_BASE_TOP = 54;
const OFFGCD_LEVEL_HEIGHT = 25;

const isApplicableCastEvent = (event: CastEvent | BeginChannelEvent | FreeCastEvent) => {
  const spellId = event.ability.guid;
  if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
    return false;
  }
  return true;
};

type ApplicableCastEvent =
  | CastEvent
  | FreeCastEvent
  | BeginChannelEvent
  | EndChannelEvent
  | GlobalCooldownEvent
  | AutoAttackCooldownEvent;
export const isApplicableEvent =
  (playerId: number) =>
  (event: AnyEvent): event is ApplicableCastEvent => {
    // we don't use `HasSource` because not every event has the full SourcedEvent field set
    if (!('sourceID' in event) || event.sourceID !== playerId) {
      // Ignore pet/boss casts
      return false;
    }

    switch (event.type) {
      case EventType.FreeCast:
      case EventType.Cast:
      case EventType.BeginChannel:
        return isApplicableCastEvent(event);
      case EventType.EndChannel:
      case EventType.GlobalCooldown:
      case EventType.AutoAttackCooldown:
        return true;
      default:
        return false;
    }
  };
/**
 * @param event the event you want to mark inefficient. Must be a Cast or BeginCast event.
 * @param tooltip the text you want displayed in the tooltip.
 */
export const highlightInefficientCast = (
  event: CastEvent | BeginChannelEvent | CastEvent[] | BeginChannelEvent[],
  tooltip: Reason,
) => {
  if (Array.isArray(event)) {
    event.forEach((e) => {
      addInefficientCastReason(e, tooltip);
    });
  } else {
    addInefficientCastReason(event, tooltip);
  }
};

interface MovementInstance {
  start: number;
  end: number;
  distance: number;
}
interface Props extends HTMLAttributes<HTMLDivElement> {
  start: number;
  windowStart?: number;
  secondWidth?: number;
  events: AnyEvent[];
  movement?: MovementInstance[];
  overlapOffGcds?: boolean;
  castHealInfo?: CastHealInfoModule;
}

const Casts = ({
  start,
  windowStart,
  secondWidth: explicitSecondWidth,
  events,
  movement,
  overlapOffGcds,
  castHealInfo,
  ...others
}: Props) => {
  const timelineSettings = use(TimelineSettingsContext);
  const expansionCtx = useExpansionContext();
  const secondWidth = explicitSecondWidth ?? timelineSettings.secondWidth;
  const getOffsetLeft = (timestamp: number) =>
    ((timestamp - (windowStart ?? start)) / 1000) * secondWidth;

  const renderIcon = (
    event: CastEvent | BeginChannelEvent | FreeCastEvent,
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
        spell={event.ability.guid}
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
    const spell = maybeGetTalentOrSpell(event.ability.guid, expansionCtx?.expansion);
    const iconName = spell?.icon ?? event.ability.abilityIcon;
    const spellName = spell?.name ?? event.ability.name;
    const icon = (
      <>
        <Icon icon={iconName.replace('.jpg', '')} alt={spellName} />
        {children}
      </>
    );

    return (
      <Fragment key={`${event.type}-${event.timestamp}-${event.ability.guid}-${className}`}>
        {tooltip ? (
          <Tooltip content={tooltip}>
            <div className={`cast ${className}`} style={{ left, ...style }}>
              {icon}
            </div>
          </Tooltip>
        ) : (
          linkIcon(icon)
        )}
      </Fragment>
    );
  };

  // Track heal target label positions to stack overlapping ones
  const HEAL_LABEL_WIDTH = 80; // approximate width of a label in px
  const HEAL_LABEL_HEIGHT = 50; // height per stacked level
  const HEAL_LABEL_TEXT_HEIGHT = 30; // approximate height of the text box
  const _healLabelPositions: { left: number; level: number }[] = [];
  let _maxHealLevel = 0;
  let _maxHealBottom = 0; // track the lowest point any heal label reaches

  let hasLowered = false;
  let _lastLowered: number | null = null;
  let _level = 0;
  let _maxLevel = 1;
  const renderCast = (event: CastEvent | FreeCastEvent) => {
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
      if (_lastLowered && left - _lastLowered < ICON_WIDTH && !overlapOffGcds) {
        _level += 1;
        level = _level;
        _maxLevel = Math.max(_maxLevel, level + 1);
      } else {
        _level = 0;
      }
      _lastLowered = left;
      hasLowered = true;
    }

    // Store for renderHealTarget
    _lastCastIsOffGcd = lower;
    _lastCastOffGcdLevel = level;

    const meta = event.meta;
    const castReason = generateTooltip(meta);

    if (meta) {
      if (meta.isInefficientCast) {
        className += ' inefficient';
      } else if (meta.isEnhancedCast) {
        className += ' enhanced';
      } else if (meta.isAdditionalCastInfo) {
        className += ' additional';
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
      ((event.trigger?.type === EventType.Cast || event.trigger?.type === EventType.BeginChannel) &&
        event.trigger?.meta) ||
      (event.trigger?.type === EventType.BeginCast && event.trigger.castEvent?.meta);
    castReason = meta ? generateTooltip(meta) : castReason;
    if (meta) {
      if (meta.isInefficientCast) {
        className += ' inefficient';
      } else if (meta.isEnhancedCast) {
        className += ' enhanced';
      } else if (meta.isAdditionalCastInfo) {
        className += ' additional';
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
        key={`channel-${event.start}-${event.ability.guid}`}
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
        key={`gcd-${event.timestamp}-${event.ability.guid}`}
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
  const renderSwingCooldown = (event: AutoAttackCooldownEvent) => {
    const left = getOffsetLeft(event.timestamp);
    const fightDuration = event.timestamp - start;

    return (
      <Tooltip
        key={`swing-${event.timestamp}-${event.ability.guid}`}
        content={
          <Trans id="interface.report.results.timeline.casts.tooltip.swingCooldown">
            {formatDuration(fightDuration, 3)}: {(event.duration / 1000).toFixed(2)}s Swing cooldown
            ({(event.attackSpeed / 1000).toFixed(1)} attack speed)
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

  // Track off-GCD info from the most recent renderCast call
  let _lastCastIsOffGcd = false;
  let _lastCastOffGcdLevel = 0;

  const renderHealTarget = (event: CastEvent | BeginChannelEvent | FreeCastEvent): ReactNode => {
    if (!castHealInfo) {
      return null;
    }
    const healData = castHealInfo.getHealDataForEvent(event);
    if (!healData || healData.heals.length === 0) {
      return null;
    }

    const left = getOffsetLeft(event.timestamp);
    const mainHeal = healData.heals[0];
    const targetName = castHealInfo.getTargetName(mainHeal.targetID);
    const effective = mainHeal.amount + mainHeal.absorbed;
    const echoCount = healData.heals.length - 1;

    // Find the lowest level where this label doesn't overlap
    let healLevel = 0;
    for (let tryLevel = 0; ; tryLevel++) {
      const overlaps = _healLabelPositions.some(
        (pos) => pos.level === tryLevel && Math.abs(left - pos.left) < HEAL_LABEL_WIDTH,
      );
      if (!overlaps) {
        healLevel = tryLevel;
        break;
      }
    }
    _healLabelPositions.push({ left, level: healLevel });
    _maxHealLevel = Math.max(_maxHealLevel, healLevel);

    const tooltipContent = (
      <>
        {healData.heals.map((heal, i) => {
          const healEffective = heal.amount + heal.absorbed;
          return (
            <div key={i}>
              {castHealInfo.getTargetName(heal.targetID)}
              {heal.isMainTarget && healData.heals.length > 1 && (
                <span style={{ opacity: 0.7 }}> (direct)</span>
              )}
              {' - '}
              {formatNumber(healEffective)} ({formatPercentage(heal.hpBeforePct, 0)}% HP)
              {heal.overheal > 0 && (
                <span style={{ opacity: 0.7 }}> ({formatNumber(heal.overheal)} OH)</span>
              )}
            </div>
          );
        })}
        {healData.heals.length > 1 && (
          <div
            style={{
              marginTop: 4,
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: 4,
            }}
          >
            <strong>Total:</strong> {formatNumber(healData.totalEffective)}
            {healData.totalOverheal > 0 && (
              <span style={{ opacity: 0.7 }}> ({formatNumber(healData.totalOverheal)} OH)</span>
            )}
          </div>
        )}
        <a
          href={castHealInfo.getWclUrl(event.timestamp, healData.healAbilityId)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: 'rgba(150, 200, 255, 0.9)',
            marginTop: 4,
            display: 'block',
          }}
        >
          View on WCL
        </a>
      </>
    );

    const isOffGcd = _lastCastIsOffGcd;
    const offGcdLevel = _lastCastOffGcdLevel;

    const offGcdLabelTop = OFFGCD_BASE_TOP + ICON_HEIGHT + offGcdLevel * OFFGCD_LEVEL_HEIGHT;
    if (isOffGcd) {
      _maxHealBottom = Math.max(_maxHealBottom, offGcdLabelTop + HEAL_LABEL_TEXT_HEIGHT);
    } else {
      _maxHealBottom = Math.max(
        _maxHealBottom,
        ICON_HEIGHT + 10 + healLevel * HEAL_LABEL_HEIGHT + HEAL_LABEL_TEXT_HEIGHT,
      );
    }

    return (
      <Fragment key={`healtarget-${event.timestamp}-${event.ability.guid}`}>
        <div
          className={`heal-target-label ${isOffGcd ? 'heal-target-offgcd' : ''}`}
          style={
            {
              left: isOffGcd ? left : left + ICON_WIDTH / 2,
              '--heal-level': healLevel,
              '--offgcd-level': offGcdLevel,
            } as CSSProperties
          }
        >
          {!isOffGcd && <div className="heal-target-arrow" />}
          <Tooltip content={tooltipContent} direction="down" distance={0} arrow={false} hoverable>
            <div className="heal-target-text">
              <div className="heal-target-name">
                {targetName}
                {echoCount > 0 && <span className="heal-target-echo"> +{echoCount}</span>}
              </div>
              <div className="heal-target-amount">{formatNumber(effective)}</div>
            </div>
          </Tooltip>
        </div>
      </Fragment>
    );
  };

  const renderEvent = (event: AnyEvent) => {
    let castElement: ReactNode = null;
    let healElement: ReactNode = null;

    switch (event.type) {
      case EventType.FreeCast:
      case EventType.Cast:
        castElement = renderCast(event);
        healElement = renderHealTarget(event);
        break;
      case EventType.BeginChannel:
        castElement = renderBeginChannel(event);
        healElement = renderHealTarget(event);
        break;
      case EventType.EndChannel:
        castElement = renderChannel(event);
        break;
      case EventType.GlobalCooldown:
        castElement = renderGlobalCooldown(event);
        break;
      case EventType.AutoAttackCooldown:
        castElement = renderSwingCooldown(event);
        break;
      default:
        return null;
    }

    return (
      <Fragment
        key={`event-${event.timestamp}-${event.type}-${'ability' in event ? event.ability.guid : ''}`}
      >
        {castElement}
        {healElement}
      </Fragment>
    );
  };

  const content = events.map(renderEvent);

  const renderMovement = ({ start: movementStart, end, distance }: MovementInstance) => {
    const left = getOffsetLeft(movementStart);
    const movementStartRelative = movementStart - start;
    const movementEndRelative = end - start;
    const duration = end - movementStart;

    // percentage
    const actualMovementDurationEstimate = Math.min(1, distance / 6 / (duration / 1000));

    return (
      <Tooltip
        key={`channel-${left}-movement`}
        content={
          <Trans id="interface.report.results.timeline.movement">
            {formatDuration(movementStartRelative, 3)} - {formatDuration(movementEndRelative, 3)}:
            there was {distance.toFixed(1)} yards movement within this period. The start and stop
            time of the movement may vary due to incomplete log data.
          </Trans>
        }
      >
        <div
          className="movement"
          style={{
            left,
            width: (duration / 1000) * secondWidth,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            '--rate-height': actualMovementDurationEstimate,
          }}
        />
      </Tooltip>
    );
  };

  return (
    <div
      className={`casts ${castHealInfo ? 'has-heal-targets' : ''}`}
      {...others}
      style={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        '--levels': hasLowered ? _maxLevel : 0,
        '--has-levels': hasLowered ? 1 : 0,
        '--heal-bottom': castHealInfo && _maxHealBottom > 0 ? `${_maxHealBottom}px` : undefined,
        ...others.style,
      }}
    >
      {content}

      {movement && movement.map(renderMovement)}
    </div>
  );
};

const generateTooltip = (meta?: EventMeta) => {
  let castReason: React.ReactNode;
  if (meta) {
    if (meta.inefficientCastReason) {
      castReason = (
        <>
          <h3>Inefficient Cast Reasons</h3>
          {meta.inefficientCastReason}
        </>
      );
    }
    if (meta.enhancedCastReason) {
      castReason = (
        <>
          {castReason ? (
            <>
              {castReason}
              {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
              <br />
            </>
          ) : null}
          <h3>Enhanced Cast Reasons</h3>
          {meta.enhancedCastReason}
        </>
      );
    }
    if (meta.isAdditionalCastInfo && meta.additionalCastInfo) {
      castReason = (
        <>
          {castReason ? (
            <>
              {castReason}
              {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
              <br />
            </>
          ) : null}
          <h3>Additional Cast Information</h3>
          {meta.additionalCastInfo}
        </>
      );
    }
  }
  return castReason;
};

export default Casts;
