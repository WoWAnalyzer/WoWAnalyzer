import styled from '@emotion/styled';
import { formatPercentage, formatNumber } from 'common/format';
import { useState } from 'react';

export interface DonutSegment {
  /** Unique identifier for the segment */
  id: string | number;
  /** Display label for the segment */
  label: string;
  /** Color for the segment */
  color: string;
  /** Numeric value for the segment */
  value: number;
}

interface Props {
  /** Array of segments to display */
  segments: DonutSegment[];
  /** Size of the donut chart in pixels */
  size?: number;
  /** Inner radius ratio (0-1, where 0.5 = half the radius) */
  innerRadiusRatio?: number;
  /** Whether to show the center text with total */
  showCenterText?: boolean;
  /** Custom center text override */
  centerText?: string;
}

/**
 * Base donut chart component that renders a simple donut visualization.
 * For more complex use cases with spell tracking and legends, use DamageContribution.
 *
 * @param segments - Array of segments to display in the chart
 * @param size - Size of the donut chart in pixels (default: 200)
 * @param innerRadiusRatio - Inner radius ratio 0-1, where 0.5 = half radius (default: 0.6)
 * @param showCenterText - Whether to show center text with total (default: true)
 * @param centerText - Custom center text override
 */
export default function DonutChart({
  segments,
  size = 200,
  innerRadiusRatio = 0.6,
  showCenterText = true,
  centerText,
}: Props) {
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment | null>(null);
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  // Generate donut chart SVG
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;
  const innerRadius = radius * innerRadiusRatio;

  let currentAngle = -90; // Start at top

  const renderedSegments = segments.map((segment) => {
    const percentage = segment.value / total;
    const angleDegrees = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDegrees;

    currentAngle = endAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Grow the segment when hovered (increase radius slightly)
    const isHovered = hoveredSegment?.id === segment.id;
    const outerRadius = isHovered ? radius + 6 : radius;

    // Calculate arc path with dynamic radius
    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArcFlag = angleDegrees > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`, // Move to start of outer arc
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
      `L ${x3} ${y3}`, // Line to inner arc
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (reverse)
      'Z', // Close path
    ].join(' ');

    return {
      ...segment,
      pathData,
      percentage,
    };
  });

  return (
    <DonutContainer>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {renderedSegments.map((segment) => (
          <g key={segment.id}>
            <SegmentPath
              d={segment.pathData}
              fill={segment.color}
              onMouseEnter={() => setHoveredSegment(segment)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <title>
                {segment.label}: {formatNumber(segment.value)} (
                {formatPercentage(segment.percentage, 1)}%)
              </title>
            </SegmentPath>
          </g>
        ))}
      </svg>
      {showCenterText && (
        <CenterText>
          {hoveredSegment ? (
            <>
              <CenterValue>{formatNumber(hoveredSegment.value)}</CenterValue>
              <CenterLabel>{hoveredSegment.label}</CenterLabel>
            </>
          ) : (
            <>
              <CenterValue>{centerText || formatNumber(total)}</CenterValue>
              <CenterLabel>{centerText ? '' : 'Total'}</CenterLabel>
            </>
          )}
        </CenterText>
      )}
    </DonutContainer>
  );
}

const DonutContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
  padding: 8px;
`;

const SegmentPath = styled.path`
  opacity: 0.8;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  transition: all 0.2s ease;
`;

const CenterValue = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
  line-height: 1.2;
  transition: font-size 0.2s ease;

  ${CenterText}:has(+ svg path:hover) & {
    font-size: 2.6rem;
  }
`;

const CenterLabel = styled.div`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: font-size 0.2s ease;

  ${CenterText}:has(+ svg path:hover) & {
    font-size: 1.3rem;
  }
`;
