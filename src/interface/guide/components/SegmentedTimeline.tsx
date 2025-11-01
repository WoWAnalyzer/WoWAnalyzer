import { useFight } from 'interface/report/context/FightContext';

export interface TimeWindow {
  /** Start time of the window in milliseconds */
  startTime: number;
  /** End time of the window in milliseconds */
  endTime: number;
}

export interface TimelineSegment {
  /** Start time of the segment in milliseconds */
  start: number;
  /** End time of the segment in milliseconds */
  end: number;
  /** Color of the segment */
  color: string;
  /** Opacity of the segment (0-1) */
  opacity?: number;
  /** Tooltip label for the segment */
  label: string;
}

export interface TimelineMarker {
  /** Timestamp of the marker in milliseconds */
  timestamp: number;
  /** Tooltip label for the marker */
  label: string;
  /** Color of the marker (default: white) */
  color?: string;
}

export interface SegmentedTimelineProps {
  /** Optional windows to show on the timeline (defaults to full fight if not specified) */
  windows?: TimeWindow[];
  /** Segments to render on the timeline */
  segments: TimelineSegment[];
  /** Optional markers to show on the timeline */
  markers?: TimelineMarker[];
}

const EMPTY_MARKERS: TimelineMarker[] = [];

/**
 * Renders a timeline visualization with colored segments and optional markers.
 *
 * This is a generalized timeline component that can visualize any time-based data
 * across a fight or specific time windows. Common uses include:
 * - Cooldown availability
 * - Buff/debuff uptime
 * - Resource availability
 * - Phase indicators
 *
 * @param windows - Optional time windows to display (defaults to full fight)
 * @param segments - Colored segments to render on the timeline
 * @param markers - Optional markers (pins) to show on the timeline
 */
export default function SegmentedTimeline({
  windows,
  segments,
  markers = EMPTY_MARKERS,
}: SegmentedTimelineProps) {
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

        // Filter segments that overlap with this window
        const windowSegments = segments.filter(
          (segment) => segment.start < windowEnd && segment.end > windowStart,
        );

        // Render all segments for this window
        const segmentRects = windowSegments.map((segment, idx) => {
          const segStart = Math.max(segment.start, windowStart);
          const segEnd = Math.min(segment.end, windowEnd);

          return createRect(
            segStart,
            segEnd,
            `${winIdx}-segment-${idx}`,
            segment.color,
            segment.opacity ?? 1,
            segment.label,
          );
        });

        // Filter markers that fall within this window
        const windowMarkers = markers.filter(
          (marker) => marker.timestamp >= windowStart && marker.timestamp <= windowEnd,
        );

        // Render markers (teardrop pins)
        const markerWidth = 0.5;
        const markerHeight = 9;
        const markerOffsetY = 3;

        const markerElements = windowMarkers.map((marker, idx) => {
          const markerX =
            windowX + ((marker.timestamp - windowStart) / windowDuration) * windowWidth;
          const markerColor = marker.color || '#FFF';

          // Teardrop/pin shape pointing down
          const teardropPath = `
            M ${markerX} ${markerHeight + markerOffsetY}
            Q ${markerX - markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX - markerWidth} ${markerHeight * 0.3 + markerOffsetY}
            A ${markerWidth} ${markerHeight * 0.3} 0 1 1 ${markerX + markerWidth} ${markerHeight * 0.3 + markerOffsetY}
            Q ${markerX + markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX} ${markerHeight + markerOffsetY}
            Z
          `;

          return (
            <g key={`${winIdx}-marker-${idx}`}>
              <title>{marker.label}</title>
              <path
                d={teardropPath}
                fill={markerColor}
                stroke={markerColor}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={markerX}
                y1={markerHeight}
                x2={markerX}
                y2={totalHeight}
                stroke={markerColor}
                strokeWidth={3}
                vectorEffect="non-scaling-stroke"
                opacity={0.9}
              />
            </g>
          );
        });

        return (
          <g key={winIdx}>
            {segmentRects}
            {markerElements}
          </g>
        );
      })}
    </svg>
  );
}
