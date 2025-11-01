import { formatDuration } from 'common/format';
import {
  AnyEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { CooldownWindow } from 'parser/ui/CooldownBar';
import { useFight } from 'interface/report/context/FightContext';

export interface CooldownTimelineProps {
  /** The spell ID to show cooldown timeline for */
  spellId: number;
  /** All combat log events */
  events: AnyEvent[];
  /** Optional windows where the spell is usable (defaults to full fight if not specified) */
  windows?: CooldownWindow[];
  /** Color for the cooldown bars */
  cooldownColor: string;
}

/**
 * Renders a timeline visualization showing when a spell was on cooldown vs available.
 *
 * Visual indicators:
 * - Colored bars: Spell is on cooldown
 * - Red highlighted areas: Spell was available but not cast
 * - White teardrop pins: Spell was cast
 *
 * This is a reusable component that can be used anywhere you need to visualize
 * spell cooldown usage across a fight or specific time windows.
 *
 * @param spellId - The spell ID to show cooldown timeline for
 * @param events - All combat log events
 * @param windows - Optional windows when spell is usable (defaults to full fight)
 * @param cooldownColor - Color for the cooldown bars
 */
export default function CooldownTimeline({
  spellId,
  events,
  windows,
  cooldownColor,
}: CooldownTimelineProps) {
  const fight = useFight();
  const fightStart = fight.fight.start_time;
  const fightEnd = fight.fight.end_time;
  const fightDuration = fightEnd - fightStart;
  const actualWindows = windows ?? [{ startTime: fightStart, endTime: fightEnd }];

  const ribbonHeight = 32;
  const markerOffset = 8;
  const totalHeight = ribbonHeight + markerOffset;
  const width = 100;

  return (
    <svg
      width="100%"
      height={totalHeight}
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${totalHeight}`}
    >
      {actualWindows.map((window, winIdx) => {
        const windowStart = window.startTime;
        const windowEnd = window.endTime;
        const windowDuration = windowEnd - windowStart;

        // Get cooldown events for this window
        const endCooldowns: UpdateSpellUsableEvent[] = events
          .filter(
            (event): event is UpdateSpellUsableEvent =>
              event.type === EventType.UpdateSpellUsable &&
              event.ability.guid === spellId &&
              event.updateType === UpdateSpellUsableType.EndCooldown &&
              event.overallStartTimestamp < windowEnd &&
              event.timestamp > windowStart,
          )
          .sort((a, b) => a.overallStartTimestamp - b.overallStartTimestamp);

        const beginCooldowns: UpdateSpellUsableEvent[] = events.filter(
          (event): event is UpdateSpellUsableEvent =>
            event.type === EventType.UpdateSpellUsable &&
            event.ability.guid === spellId &&
            event.updateType === UpdateSpellUsableType.BeginCooldown &&
            event.timestamp >= windowStart &&
            event.timestamp <= windowEnd,
        );

        // Get cast events for this window
        const casts = events.filter(
          (event) =>
            event.type === EventType.Cast &&
            event.ability.guid === spellId &&
            event.timestamp >= windowStart &&
            event.timestamp <= windowEnd,
        );

        const windowX = ((windowStart - fightStart) / fightDuration) * width;
        const windowWidth = (windowDuration / fightDuration) * width;

        const createRect = (
          start: number,
          end: number,
          key: string,
          fill: string,
          opacity: number,
          title: string,
        ): JSX.Element => {
          const x = windowX + ((start - windowStart) / windowDuration) * windowWidth;
          const rectWidth = ((end - start) / windowDuration) * windowWidth;

          return (
            <rect
              key={key}
              x={x}
              y={markerOffset}
              width={Math.max(0.1, rectWidth)}
              height={ribbonHeight}
              fill={fill}
              opacity={opacity}
              rx={0}
            >
              <title>{title}</title>
            </rect>
          );
        };

        const cooldownRects: JSX.Element[] = [];
        const highlightRects: JSX.Element[] = [];

        // Draw cooldown bars
        endCooldowns.forEach((cd, ix) => {
          const cdStart = Math.max(cd.overallStartTimestamp, windowStart);
          const cdEnd = Math.min(cd.timestamp, windowEnd);

          cooldownRects.push(
            createRect(
              cdStart,
              cdEnd,
              `${winIdx}-cooldown-${ix}`,
              cooldownColor,
              1,
              `On Cooldown: ${formatDuration(cdStart - windowStart)} - ${formatDuration(cdEnd - windowStart)}`,
            ),
          );
        });

        // Handle final cooldown that started but didn't end
        if (beginCooldowns.length > endCooldowns.length) {
          const lastBegin = beginCooldowns[beginCooldowns.length - 1];
          if (lastBegin.overallStartTimestamp < windowEnd) {
            cooldownRects.push(
              createRect(
                lastBegin.overallStartTimestamp,
                windowEnd,
                `${winIdx}-cooldown-final`,
                cooldownColor,
                1,
                `On Cooldown: ${formatDuration(lastBegin.overallStartTimestamp - windowStart)} - ${formatDuration(windowDuration)}`,
              ),
            );
          }
        }

        // Build missed opportunity highlights
        let lastCdEnd = windowStart;

        endCooldowns.forEach((cd, ix) => {
          if (cd.overallStartTimestamp > lastCdEnd) {
            highlightRects.push(
              createRect(
                lastCdEnd,
                cd.overallStartTimestamp,
                `${winIdx}-highlight-${ix}`,
                'rgba(220, 38, 38, 0.3)',
                1,
                `Available: ${formatDuration(lastCdEnd - windowStart)} - ${formatDuration(cd.overallStartTimestamp - windowStart)}`,
              ),
            );
          }

          lastCdEnd = Math.min(cd.timestamp, windowEnd);
        });

        // Check final gap to window end
        const finalCdEnd = beginCooldowns.length > endCooldowns.length ? windowEnd : lastCdEnd;
        if (finalCdEnd < windowEnd) {
          highlightRects.push(
            createRect(
              finalCdEnd,
              windowEnd,
              `${winIdx}-highlight-end`,
              'rgba(220, 38, 38, 0.3)',
              1,
              `Available: ${formatDuration(finalCdEnd - windowStart)} - ${formatDuration(windowDuration)}`,
            ),
          );
        }

        // Render cast markers (teardrop pins)
        const markerWidth = 0.5;
        const markerHeight = 9;
        const markerOffsetY = 3;

        const castMarkers = casts.map((cast, ix) => {
          const markerX = windowX + ((cast.timestamp - windowStart) / windowDuration) * windowWidth;
          const castTime = formatDuration(cast.timestamp - windowStart);
          const title = `Cast at ${castTime}`;

          // Teardrop/pin shape pointing down
          const teardropPath = `
            M ${markerX} ${markerHeight + markerOffsetY}
            Q ${markerX - markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX - markerWidth} ${markerHeight * 0.3 + markerOffsetY}
            A ${markerWidth} ${markerHeight * 0.3} 0 1 1 ${markerX + markerWidth} ${markerHeight * 0.3 + markerOffsetY}
            Q ${markerX + markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX} ${markerHeight + markerOffsetY}
            Z
          `;

          return (
            <g key={`${winIdx}-cast-${ix}`}>
              <title>{title}</title>
              <path
                d={teardropPath}
                fill="#FFF"
                stroke="#FFF"
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={markerX}
                y1={markerHeight}
                x2={markerX}
                y2={totalHeight}
                stroke="#FFF"
                strokeWidth={3}
                vectorEffect="non-scaling-stroke"
                opacity={0.9}
              />
            </g>
          );
        });

        return (
          <g key={winIdx}>
            {highlightRects}
            {cooldownRects}
            {castMarkers}
          </g>
        );
      })}
    </svg>
  );
}
