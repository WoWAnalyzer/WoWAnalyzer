import styled from '@emotion/styled';
import { PerformanceMark, TimeRange, useInfo } from 'interface/guide';
import {
  CooldownExpandableDataItem,
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import EmbeddedTimeline, {
  EmbeddedTimelineProps,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import ThroughputTable, { ThroughputTableProps } from 'interface/Table/ThroughputTable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { JSX, useState } from 'react';
import * as design from 'interface/design-system';
import { formatDurationMillisMinSec } from 'common/format';
import Button from 'interface/controls/Button';
import React from 'react';

interface CooldownGridProps {
  label: React.ReactNode;
  timeline?: Omit<EmbeddedTimelineProps, 'range'>;
  table?: Omit<ThroughputTableProps, 'range'>;
  items: CooldownGridItem[];
  /**
   * The number of cooldowns to show in the grid before hiding them behind the "Show More" button.
   */
  showMoreCutoff?: number;
  /**
   * The desired number of columns. Up to 3 columns are supported. Setting this limits the maximum number of columns used,
   * it does not guarantee that the component will render that many columns.
   */
  maximumColumns?: 1 | 2 | 3;
}

export interface CooldownGridItem {
  range: TimeRange;
  perf?: QualitativePerformance;
  checklistItems?: CooldownExpandableItem[];
  /**
   * Timeline configuration. If unset, defaults to the `CooldownGridProps` timeline configuration (if set).
   */
  timeline?: Omit<EmbeddedTimelineProps, 'range'>;
  /**
   * Table configuration. If unset, defaults to the `CooldownGridProps` table configuration (if set).
   */
  table?: Omit<ThroughputTableProps, 'range'>;
}

const CooldownGridOuterContainer = styled.div`
  width: 100%;
  container: cooldown-grid / inline-size;

  display: flex;
  flex-direction: column;
  gap: ${design.gaps.large};
`;

const CooldownGridContainer = styled.div<{ maximumColumns: 1 | 2 | 3 }>`
  gap: ${design.gaps.large};

  display: grid;
  grid-auto-flow: row;

  grid-template-columns: 1fr;

  max-width: 100%;

  ${(props) =>
    props.maximumColumns >= 2
      ? `
      @container cooldown-grid (width >= 700px) {
        grid-template-columns: 1fr 1fr;
      }
    `
      : ''}
  ${(props) =>
    props.maximumColumns >= 3
      ? `
      @container cooldown-grid (width >= 1050px) {
        grid-template-columns: 1fr 1fr 1fr;
      }
    `
      : ''}
`;

const ShowMoreButton = styled(Button)`
  padding: ${design.gaps.small} ${design.gaps.large};
  align-self: center;
`;

const CooldownGridElement = React.memo(CooldownGridElementRaw);

/**
 * Show a list of cooldown (or buff/debuff) windows in a grid. A "window" is a (usually short) range of time where a cooldown/buff/debuff is active.
 *
 * By default, the grid will show the first 6 windows and hide the rest behind a "Show More" button. If you have more than ~1 per minute, you should probably use `CooldownExpandable` instead
 * to keep this list from taking over the entire page.
 *
 * The top-level `timeline` and `table` props provide defaults for all cooldown windows (`items`). Individual windows can override these, or you can provide custom timeline/table configs
 * for each window. There is no ability to provide fully custom cooldown displays *yet*, but if you want to do that, you can export the container elements and DIY it.
 */
export default function CooldownGrid({
  label,
  timeline,
  table,
  items,
  showMoreCutoff = 6,
  maximumColumns = 3,
}: CooldownGridProps): JSX.Element | null {
  const [showMore, setShowMore] = useState(false);

  const hasMore = items.length > showMoreCutoff;
  return (
    <CooldownGridOuterContainer>
      <CooldownGridContainer maximumColumns={maximumColumns}>
        {items.slice(0, showMore ? Infinity : showMoreCutoff).map((item) => (
          <CooldownGridElement
            key={`${item.range.start}-${item.range.end}`}
            {...item}
            timeline={item.timeline ?? timeline}
            table={item.table ?? table}
            label={label}
          />
        ))}
      </CooldownGridContainer>
      {hasMore && (
        <ShowMoreButton onClick={() => setShowMore((v) => !v)}>
          {showMore ? 'Show Less' : 'Show More'}
        </ShowMoreButton>
      )}
    </CooldownGridOuterContainer>
  );
}

const CooldownGridElementContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${design.level2.border};
  background: ${design.level2.background};
  box-shadow ${design.level2.shadow};
  padding: ${design.gaps.small};
  gap: ${design.gaps.small};
`;

type CooldownGridItemProps = CooldownGridItem & Pick<CooldownGridProps, 'label'>;

const CooldownGridElementHeader = styled.header`
  font-weight: bold;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 ${design.gaps.small};

  & small {
    font-weight: normal;
  }
`;

const CooldownGridTimelineContainer = styled.div`
  box-shadow: inset ${design.level1.shadow};
  background: ${design.level1.background};
`;

function CooldownGridElementRaw({
  range,
  perf,
  checklistItems,
  timeline,
  table,
  label,
}: CooldownGridItemProps) {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <CooldownGridElementContainer>
      <CooldownGridElementHeader>
        <div>
          {label} {perf && <PerformanceMark perf={perf} />}
        </div>
        <small>
          {formatDurationMillisMinSec(range.start - info.originalFightStart, 0)} &mdash;{' '}
          {formatDurationMillisMinSec(range.end - info.originalFightStart, 0)}
        </small>
      </CooldownGridElementHeader>
      <table>
        <tbody>
          {checklistItems?.map((item, ix) => (
            <CooldownExpandableDataItem key={ix} {...item} minWidth={0} />
          ))}
        </tbody>
      </table>
      {timeline && (
        <CooldownGridTimelineContainer>
          <EmbeddedTimeline
            cooldownOrder="fixed"
            cooldownLegend={false}
            overlapOffGcds
            {...timeline}
            range={range}
          />
        </CooldownGridTimelineContainer>
      )}
      {table && <ThroughputTable {...table} range={range} />}
    </CooldownGridElementContainer>
  );
}
