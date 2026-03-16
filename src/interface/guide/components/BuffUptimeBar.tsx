import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef, ReactNode, type JSX } from 'react';
import Spell from 'common/SPELLS/Spell';
import { Tooltip } from 'interface';
import { formatPercentage } from 'common/format';
import { TrackedBuffEvent } from 'parser/core/Entity';
import GuideDataWrapper, { StatsRow, StatCard } from './GuideDataWrapper';
import styles from './BuffUptimeBar.module.scss';

function UptimeGraph({
  buffHistory,
  stackUptimeHistory,
  startTime,
  endTime,
  maxStacks,
  barColor,
  backgroundBarColor,
}: {
  buffHistory?: TrackedBuffEvent[];
  stackUptimeHistory?: { start: number; end: number; stacks: number }[];
  startTime: number;
  endTime: number;
  maxStacks?: number;
  barColor: string;
  backgroundBarColor: string;
}) {
  const fightDuration = endTime - startTime;
  const height = 24;
  const width = 100;

  const timeToX = (time: number) => ((time - startTime) / fightDuration) * width;

  // Handle stacked buffs
  if (stackUptimeHistory && stackUptimeHistory.length > 0 && maxStacks) {
    const stacksToY = (stacks: number) => height - (stacks / maxStacks) * height;

    let linePath = `M 0 ${height}`;
    let fillPath = `M 0 ${height}`;
    let lastX = 0;
    let lastY = height;

    stackUptimeHistory.forEach((stack) => {
      const currentX = timeToX(stack.start);
      const currentY = stacksToY(stack.stacks);
      const endX = timeToX(stack.end);

      if (currentX > lastX) {
        linePath += ` L ${currentX} ${lastY}`;
        fillPath += ` L ${currentX} ${lastY}`;
      }

      if (currentY !== lastY) {
        linePath += ` L ${currentX} ${currentY}`;
        fillPath += ` L ${currentX} ${currentY}`;
      }

      linePath += ` L ${endX} ${currentY}`;
      fillPath += ` L ${endX} ${currentY}`;

      lastX = endX;
      lastY = currentY;
    });

    linePath += ` L ${width} ${lastY}`;
    fillPath += ` L ${width} ${lastY} L ${width} ${height} L 0 ${height} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={fillPath} fill={backgroundBarColor} fillOpacity="0.4" />
        <path
          d={linePath}
          fill="none"
          stroke={barColor}
          strokeWidth="0.15"
          strokeLinejoin="miter"
          shapeRendering="crispEdges"
        />
      </svg>
    );
  }

  // Handle simple buffs (on/off)
  if (buffHistory && buffHistory.length > 0) {
    let linePath = `M 0 ${height}`;
    let fillPath = '';

    buffHistory.forEach((buff) => {
      const buffStart = timeToX(buff.start);
      const buffEnd = timeToX(buff.end === null ? endTime : buff.end);

      linePath += ` L ${buffStart} ${height}`;
      linePath += ` L ${buffStart} 0`;
      linePath += ` L ${buffEnd} 0`;
      linePath += ` L ${buffEnd} ${height}`;

      fillPath += `M ${buffStart} 0 L ${buffEnd} 0 L ${buffEnd} ${height} L ${buffStart} ${height} Z `;
    });

    linePath += ` L ${width} ${height}`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={fillPath} fill={backgroundBarColor} fillOpacity="0.4" />
        <path
          d={linePath}
          fill="none"
          stroke={barColor}
          strokeWidth="0.15"
          strokeLinejoin="miter"
          shapeRendering="crispEdges"
        />
      </svg>
    );
  }

  // Empty state
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <line x1="0" y1={height} x2={width} y2={height} stroke="#555" strokeWidth="1" />
    </svg>
  );
}

interface BuffUptimeBarProps {
  /** The buff/debuff spell to track */
  spell: Spell;
  /** Array of buff application/removal events with timestamps and optional stack history */
  buffHistory: TrackedBuffEvent[];
  /** Fight or window start timestamp in milliseconds */
  startTime: number;
  /** Fight or window end timestamp in milliseconds */
  endTime: number;
  /** Color for buff active periods. Default: purple (#cd1bdf) */
  barColor?: string;
  /** Background color showing maximum stack potential. Default: dark purple (#7e5da8) */
  backgroundBarColor?: string;
  /** Maximum number of stacks for stackable buffs. Required for stack visualization */
  maxStacks?: number;
  /** Optional tooltip content explaining average stacks calculation */
  averageStacksTooltip?: ReactNode;
}

/**
 * Displays buff/debuff uptime as a timeline bar with uptime percentage and optional stack tracking.
 * Shows uptime stats and visualizes when the buff was active across the fight or specified time window.
 *
 * @param spell - The buff/debuff spell to track
 * @param buffHistory - Array of buff events with timestamps and optional stack history
 * @param startTime - Fight or window start timestamp in milliseconds
 * @param endTime - Fight or window end timestamp in milliseconds
 * @param barColor - Color for buff active periods (default: purple #cd1bdf)
 * @param backgroundBarColor - Background color for maximum stack potential (default: dark purple #7e5da8)
 * @param maxStacks - Maximum number of stacks for stackable buffs (required for stack visualization)
 * @param averageStacksTooltip - Optional tooltip explaining average stacks calculation
 */
export default function BuffUptimeBar({
  spell,
  buffHistory,
  startTime,
  endTime,
  barColor = '#cd1bdf',
  backgroundBarColor = '#7e5da8',
  maxStacks,
  averageStacksTooltip,
}: BuffUptimeBarProps): JSX.Element {
  // Calculate uptime percent - sum all buff windows
  const fightDuration = endTime - startTime;
  const uptimeMs = buffHistory.reduce((sum, entry) => {
    const buffEnd = entry.end === null ? endTime : entry.end;
    return sum + (buffEnd - entry.start);
  }, 0);
  const uptimePercent = fightDuration > 0 ? uptimeMs / fightDuration : 0;

  // Calculate average stacks if stacks are present using stackHistory
  const hasStacks = buffHistory.some(
    (entry) => entry.stackHistory && entry.stackHistory.length > 0,
  );
  let averageStacks: number | undefined = undefined;
  let stackUptimeHistory: { start: number; end: number; stacks: number }[] | undefined = undefined;

  if (hasStacks && maxStacks !== undefined) {
    let totalWeightedStacks = 0;
    stackUptimeHistory = [];

    // Process stackHistory to get time-weighted stacks
    buffHistory.forEach((buff) => {
      const buffEnd = buff.end === null ? endTime : buff.end;
      if (buff.stackHistory && buff.stackHistory.length > 0) {
        buff.stackHistory.forEach((stack, idx, arr) => {
          const stackStart = stack.timestamp;
          const stackEnd = idx === arr.length - 1 ? buffEnd : arr[idx + 1].timestamp;
          const duration = stackEnd - stackStart;
          totalWeightedStacks += stack.stacks * duration;
          stackUptimeHistory!.push({
            start: stackStart,
            end: stackEnd,
            stacks: stack.stacks,
          });
        });
      }
    });

    averageStacks = fightDuration > 0 ? totalWeightedStacks / fightDuration : 0;
  }

  const defaultTooltip = `This is the average number of stacks you had over the course of the fight, counting periods where you didn't have the buff as zero stacks.`;

  const statsContent = (
    <StatsRow>
      <StatCard color={backgroundBarColor}>
        <div className={styles.statValue}>{formatPercentage(uptimePercent, 0)}%</div>
        <div className={styles.statLabel}>Uptime</div>
      </StatCard>
      {hasStacks && averageStacks !== undefined && (
        <Tooltip content={averageStacksTooltip || defaultTooltip}>
          <StatCard color={barColor}>
            <div className={styles.statValue}>{averageStacks.toFixed(1)}</div>
            <div className={styles.statLabel}>Avg Stacks</div>
          </StatCard>
        </Tooltip>
      )}
      {hasStacks && maxStacks !== undefined && (
        <StatCard color="#888">
          <div className={styles.statValue}>{maxStacks}</div>
          <div className={styles.statLabel}>Max Stacks</div>
        </StatCard>
      )}
    </StatsRow>
  );

  return (
    <GuideDataWrapper title={`${spell.name} Buff Uptime`} subtitle="Timeline" stats={statsContent}>
      <div className={styles.timelineContainer}>
        <div className={styles.uptimeGraphContainer}>
          <UptimeGraph
            buffHistory={hasStacks ? undefined : buffHistory}
            stackUptimeHistory={hasStacks ? stackUptimeHistory : undefined}
            startTime={startTime}
            endTime={endTime}
            maxStacks={maxStacks}
            barColor={barColor}
            backgroundBarColor={backgroundBarColor}
          />
        </div>
      </div>
    </GuideDataWrapper>
  );
}

export function InsetContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>): JSX.Element {
  return <div className={clsx(styles.insetContainer, className)} {...props} />;
}
