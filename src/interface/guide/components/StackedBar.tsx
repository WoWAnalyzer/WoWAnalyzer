import cssComponent from "interface/utils/css-component";
import styles from "./StackedBar.module.scss";
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
  /** Height of the bar in pixels. Default: 35 */
  height?: number;
  /** Whether to hide the legend below the bar. Default: false */
  hideLegend?: boolean;
  /** Minimum percentage required to show a segment. Default: 0.5 */
  minSegmentPercent?: number;
  /** Custom tooltip formatter. Receives segment and percentage, returns tooltip content */
  tooltipFormat?: (segment: StackedBarSegment, percent: number) => React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * StackedBar component for visualizing proportional data distribution.
 *
 * @param segments - Array of segments to display in the bar
 * @param height - Height of the bar in pixels (default: 35)
 * @param hideLegend - Whether to hide the legend below the bar (default: false)
 * @param minSegmentPercent - Minimum percentage required to show a segment (default: 0.5)
 * @param tooltipFormat - Custom tooltip formatter function
 * @param className - Optional CSS class name
 */
export default function StackedBar({
  segments,
  height = 35,
  hideLegend = false,
  minSegmentPercent = 0,
  tooltipFormat,
  className,
}: StackedBarProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  if (total === 0) {
    return null;
  }
  const defaultTooltipFormatter = (segment: StackedBarSegment, percent: number) => (
    <div>
      <strong>{segment.label}</strong>
      <div>Value: {segment.value.toFixed(0)}</div>
      <div>Percentage: {percent.toFixed(1)}%</div>
    </div>
  );

  const getTooltipContent = tooltipFormat || defaultTooltipFormatter;

  const segmentsWithPositions = segments
    .map((segment, idx) => ({ segment, percent: (segment.value / total) * 100, index: idx }))
    .filter(({ percent }) => percent >= minSegmentPercent);

  return (
    <>
      <BarContainer height={height} className={className}>
        {segmentsWithPositions.map(({ segment, percent, index }) => (
          <Tooltip key={index} content={segment.tooltip || getTooltipContent(segment, percent)}>
            <Segment color={segment.color} widthPercent={percent} />
          </Tooltip>
        ))}
      </BarContainer>
      {!hideLegend && (
        <LegendRow>
          {segmentsWithPositions.map(({ segment, percent, index }) => (
            <LegendItem key={index}>
              <LegendSwatch color={segment.color} />
              <LegendItemLabel>
                {segment.label} ({Math.round(percent)}%)
              </LegendItemLabel>
            </LegendItem>
          ))}
        </LegendRow>
      )}
    </>
  );
}

const BarContainer = cssComponent("div", styles.BarContainer, ["height"] as const);

const Segment = cssComponent("div", styles.Segment, ["widthPercent", "color"] as const);

const LegendRow = cssComponent("div", styles.LegendRow, [] as const);

const LegendItem = cssComponent("div", styles.LegendItem, [] as const);

const LegendSwatch = cssComponent("div", styles.LegendSwatch, ["color"] as const);

const LegendItemLabel = cssComponent("span", styles.LegendItemLabel, [] as const);
