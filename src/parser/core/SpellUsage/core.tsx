import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';
import { CastEvent } from 'parser/core/Events';
import styled from '@emotion/styled';
import { formatDuration } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

/**
 * Contains data about one aspect of the quality of a cast and the reasoning.
 */
export interface UsageInfo {
  performance: QualitativePerformance;
  summary: ReactNode;
  details: ReactNode;
}

/**
 * Extension of {@link UsageInfo} that also contains the cast timestamp and what is being checked.
 */
export interface ChecklistUsageInfo extends UsageInfo {
  check: string;
  timestamp: number;
}

/**
 * Contains data about a cast event, including the overall quality and the decisions that make
 * up said quality.
 */
export interface SpellUse {
  event: CastEvent;
  checklistItems: ChecklistUsageInfo[];
  performance: QualitativePerformance;
  extraDetails?: ReactNode;
  performanceExplanation?: ReactNode;
}

const SpellTooltipBody = 'div';
const SpellRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em 2em auto;
  gap: 1em;
  align-items: center;

  line-height: 1em;
  text-align: left;

  padding-bottom: 0.5em;
`;

/**
 * Wrapper for what gets displayed under the performance row.
 */
export const PerformanceUsageRow = styled.div`
  padding-bottom: 0.5em;

  & > :first-child {
    margin-right: 0.5em;
  }
`;

const SpellRow = ({
  fightStart,
  usageInfo,
}: {
  fightStart: number;
  usageInfo: ChecklistUsageInfo;
}) => (
  <SpellRowContainer>
    <div>{formatDuration(usageInfo.timestamp - fightStart)}</div>
    <div style={{ justifySelf: 'center' }}>
      <PerformanceMark perf={usageInfo.performance} />
    </div>
    <div>{usageInfo.summary}</div>
  </SpellRowContainer>
);

/**
 * Helper function to convert a {@link SpellUse} to a {@link BoxRowEntry}.
 */
export const spellUseToBoxRowEntry = (
  { performance, performanceExplanation, checklistItems }: SpellUse,
  fightStart: number,
): BoxRowEntry => ({
  value: performance,
  tooltip: (
    <>
      <PerformanceUsageRow>
        <PerformanceMark perf={performance} /> {performanceExplanation ?? 'Good Usage'}
      </PerformanceUsageRow>
      {checklistItems.length > 0 ? (
        <SpellTooltipBody>
          <SpellRowContainer>
            <strong>Time</strong>
            <strong>Perf.</strong>
            <strong>Summary</strong>
          </SpellRowContainer>
          {checklistItems.map((usageInfo) => (
            <SpellRow fightStart={fightStart} usageInfo={usageInfo} key={usageInfo.check} />
          ))}
        </SpellTooltipBody>
      ) : undefined}
    </>
  ),
});
