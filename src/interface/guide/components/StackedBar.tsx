import styled from '@emotion/styled';
import { Tooltip } from 'interface';

/**
 * A stacked horizontal bar chart component for displaying proportional distribution of data.
 *
 * Stacked bars show how a total is divided into segments, making it easy to compare
 * the relative sizes of different categories at a glance.
 */

export interface StackedBarSegment {
  /** Label for this segment */
  label: string;
  /** Value for this segment (will be converted to percentage of total) */
  value: number;
  /** Color for this segment */
  color: string;
  /** Optional detailed tooltip content. If not provided, uses default formatting */
  tooltip?: React.ReactNode;
}

export interface StackedBarProps {
  /** Array of segments to display in the bar */
  segments: StackedBarSegment[];
  /** Height of the bar in pixels. Default: 60 */
  height?: number;
  /** Whether to show percentage labels on segments. Default: true */
  showLabels?: boolean;
  /** Minimum percentage required to show a segment. Default: 0.5 */
  minSegmentPercent?: number;
  /** Minimum percentage required to show labels on a segment. Default: 5 */
  minLabelPercent?: number;
  /** Custom label formatter. Receives segment and percentage, returns label content */
  labelFormat?: (segment: StackedBarSegment, percent: number) => React.ReactNode;
  /** Custom tooltip formatter. Receives segment and percentage, returns tooltip content */
  tooltipFormat?: (segment: StackedBarSegment, percent: number) => React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * StackedBar component for visualizing proportional data distribution.
 *
 * @param segments - Array of segments to display in the bar
 * @param height - Height of the bar in pixels (default: 60)
 * @param showLabels - Whether to show percentage labels on segments (default: true)
 * @param minSegmentPercent - Minimum percentage required to show a segment (default: 0.5)
 * @param minLabelPercent - Minimum percentage required to show labels (default: 5)
 * @param labelFormat - Custom label formatter function
 * @param tooltipFormat - Custom tooltip formatter function
 * @param className - Optional CSS class name
 */
export default function StackedBar({
  segments,
  height = 60,
  showLabels = true,
  minSegmentPercent = 0.5,
  minLabelPercent = 5,
  labelFormat,
  tooltipFormat,
  className,
}: StackedBarProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  if (total === 0) {
    return null;
  }

  const defaultLabelFormatter = (segment: StackedBarSegment, percent: number) => (
    <SegmentLabelContainer>
      <SegmentPercentage>{Math.round(percent)}%</SegmentPercentage>
      <SegmentLabel>{segment.label}</SegmentLabel>
    </SegmentLabelContainer>
  );

  const defaultTooltipFormatter = (segment: StackedBarSegment, percent: number) => (
    <>
      <strong>{segment.label}</strong>
      <br />
      Value: {segment.value.toFixed(0)}
      <br />
      Percentage: {percent.toFixed(1)}%
    </>
  );

  const getLabelContent = labelFormat || defaultLabelFormatter;
  const getTooltipContent = tooltipFormat || defaultTooltipFormatter;

  // Calculate segment positions with immutable approach
  const segmentsWithPositions = segments.reduce<
    Array<{
      segment: StackedBarSegment;
      percent: number;
      startPercent: number;
      index: number;
    }>
  >((acc, segment, idx) => {
    const percent = (segment.value / total) * 100;
    const startPercent =
      acc.length > 0 ? acc[acc.length - 1].startPercent + acc[acc.length - 1].percent : 0;

    // Skip segments that are too small
    if (percent < minSegmentPercent) {
      return acc;
    }

    return [...acc, { segment, percent, startPercent, index: idx }];
  }, []);

  return (
    <BarContainer height={height} className={className}>
      {segmentsWithPositions.map(({ segment, percent, startPercent, index }) => (
        <Tooltip key={index} content={segment.tooltip || getTooltipContent(segment, percent)}>
          <Segment color={segment.color} startPercent={startPercent} widthPercent={percent}>
            {showLabels && percent >= minLabelPercent && getLabelContent(segment, percent)}
          </Segment>
        </Tooltip>
      ))}
    </BarContainer>
  );
}

// Styled Components

const BarContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${(props) => props.height}px;
  min-height: 35px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  position: relative;

  @media (max-width: 768px) {
    min-height: 30px;
  }
`;

const Segment = styled.div<{
  color: string;
  startPercent: number;
  widthPercent: number;
}>`
  position: absolute;
  left: ${(props) => props.startPercent}%;
  width: ${(props) => props.widthPercent}%;
  height: 100%;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(1.2);
  }
`;

const SegmentLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
`;

const SegmentPercentage = styled.span`
  color: white;
  font-size: 1.6rem;
  font-weight: 1000;
  -webkit-text-stroke: 3px #000;
  paint-order: stroke fill;
`;

const SegmentLabel = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.4rem;
  font-weight: 1000;
  -webkit-text-stroke: 3px #000;
  paint-order: stroke fill;
`;
