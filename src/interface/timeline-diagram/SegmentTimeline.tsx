import Tooltip from '@wowanalyzer/react-tooltip-lite';
import Spell from 'common/SPELLS/Spell';
import { formatDuration } from 'common/format';
import { Info } from 'parser/core/metric';
import React, { useMemo } from 'react';
import SpellIcon from '../SpellIcon';
import { useTimelinePosition } from './TimelineDiagram';

export interface DisplaySegment {
  start: number;
  end: number;
  /**
   * If set, show an ability icon at the start of the segment.
   */
  abilityId?: number;
  /**
   * If set, override the segment default foreground color.
   */
  color?: string;
  /**
   * If set, show this as the tooltip on hovering the segment.
   */
  tooltip?: React.ReactNode;
}

interface SegmentTimelineProps {
  bgColor?: string;
  fgColor: string;
  fgStroke?: string;
  segments: DisplaySegment[];
  info: Info;
  segmentProps?: React.ComponentProps<'rect'>;
  containerProps?: React.ComponentProps<'svg'>;
  disableMerging?: boolean;
}

export default React.memo(function SegmentTimeline({
  bgColor,
  fgColor,
  segments,
  info,
  fgStroke,
  segmentProps,
  containerProps,
  disableMerging,
}: SegmentTimelineProps): JSX.Element {
  const { x, width } = useTimelinePosition();
  // merge segments that would have sub-pixel gaps between them to avoid render artifacts
  const mergedSegments = useMemo(() => {
    if (disableMerging) {
      return segments;
    }
    const result = [];
    let currentSegment = undefined;
    for (const segment of segments) {
      if (!currentSegment) {
        currentSegment = { ...segment };
        continue;
      }

      if (
        width(currentSegment.end, segment.start) < 1 ||
        segment.start - currentSegment.end < 100
      ) {
        currentSegment.end = segment.end;
      } else {
        result.push(currentSegment);
        currentSegment = { ...segment };
      }
    }

    if (currentSegment) {
      result.push(currentSegment);
    }
    return result;
  }, [segments, width, disableMerging]);

  return (
    <svg width="100%" height="100%" {...containerProps}>
      {bgColor && <rect x={0} y={0} height="100%" width="100%" fill={bgColor} />}
      <g>
        {mergedSegments.map((segment, i) => (
          <g key={i}>
            <rect
              x={x(segment.start)}
              width={width(segment.start, segment.end)}
              y={0}
              height="100%"
              fill={segment.color ?? fgColor}
              stroke={fgStroke}
              {...segmentProps}
            >
              <title>
                {formatDuration(segment.start - info.fightStart, 1)} -{' '}
                {formatDuration(segment.end - info.fightStart, 1)}
              </title>
            </rect>
            {segment.tooltip && (
              <foreignObject
                x={x(segment.start)}
                width={width(segment.start, segment.end)}
                y={0}
                height="100%"
              >
                <Tooltip content={segment.tooltip}>
                  <div style={{ width: '100%', height: '100%' }} />
                </Tooltip>
              </foreignObject>
            )}
            {segment.abilityId && (
              <TimelineAbility y={0} x={x(segment.start)} size={16} spell={segment.abilityId} />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
});

export function TimelineAbility({
  x,
  y,
  spell,
  size,
}: {
  x: number;
  y: number;
  size: number;
  spell: number | Spell;
}): JSX.Element | null {
  return (
    <foreignObject x={x} y={y} width={1} height={1} style={{ overflow: 'visible' }}>
      <div style={{ lineHeight: `${size}px`, userSelect: 'none' }}>
        <SpellIcon
          spell={spell}
          style={{ border: '1px solid #555', borderRadius: 'unset', width: size, height: size }}
        />
      </div>
    </foreignObject>
  );
}
