import { ReactNode, type JSX } from 'react';
import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { Tooltip } from 'interface';
import { formatPercentage } from 'common/format';
import { TrackedBuffEvent } from 'parser/core/Entity';
import {
  SectionContainer,
  SectionHeader,
  TitleColumn,
  SectionTitle,
  Label,
  StatsRow,
  StatCard,
  StatValue,
  StatLabel,
} from './GuideDivs';

// Unified uptime graph - handles both simple buffs and stacked buffs
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
  spell: Spell;
  buffHistory: TrackedBuffEvent[];
  startTime: number;
  endTime: number;
  barColor?: string;
  backgroundBarColor?: string;
  maxStacks?: number;
  averageStacksTooltip?: ReactNode;
}

/**
 * Displays buff uptime percentage with stack visualization.
 * Shows header, stats cards, and a timeline bar visualization.
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

  return (
    <SectionContainer>
      <SectionHeader>
        <TitleColumn>
          <SectionTitle>{spell.name} Buff Uptime</SectionTitle>
          <Label>Timeline</Label>
        </TitleColumn>
        <StatsRow>
          <StatCard color={backgroundBarColor}>
            <StatValue>{formatPercentage(uptimePercent, 0)}%</StatValue>
            <StatLabel>Uptime</StatLabel>
          </StatCard>
          {hasStacks && averageStacks !== undefined && (
            <Tooltip content={averageStacksTooltip || defaultTooltip}>
              <StatCard color={barColor}>
                <StatValue>{averageStacks.toFixed(1)}</StatValue>
                <StatLabel>Avg Stacks</StatLabel>
              </StatCard>
            </Tooltip>
          )}
          {hasStacks && maxStacks !== undefined && (
            <StatCard color="#888">
              <StatValue>{maxStacks}</StatValue>
              <StatLabel>Max Stacks</StatLabel>
            </StatCard>
          )}
        </StatsRow>
      </SectionHeader>

      <TimelineContainer>
        <UptimeGraphContainer>
          <UptimeGraph
            buffHistory={hasStacks ? undefined : buffHistory}
            stackUptimeHistory={hasStacks ? stackUptimeHistory : undefined}
            startTime={startTime}
            endTime={endTime}
            maxStacks={maxStacks}
            barColor={barColor}
            backgroundBarColor={backgroundBarColor}
          />
        </UptimeGraphContainer>
      </TimelineContainer>
    </SectionContainer>
  );
}

export const InsetContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TimelineContainer = styled(InsetContainer)`
  height: 32px;
`;

const UptimeGraphContainer = styled.div`
  height: 24px;
  width: 100%;
  position: relative;
`;
