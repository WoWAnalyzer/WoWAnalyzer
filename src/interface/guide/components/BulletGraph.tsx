import styled from '@emotion/styled';

/**
 * A bullet graph visualization component for displaying performance metrics.
 *
 * Bullet graphs are a variation of bar charts that show a single measure (actual value)
 * compared to a target, with optional qualitative ranges (poor/ok/good) in the background.
 *
 * @see https://en.wikipedia.org/wiki/Bullet_graph
 */

export interface PerformanceRange {
  /** The width of this performance zone as a percentage (0-100) */
  width: number;
  /** Background color for this zone */
  color: string;
  /** Optional label for this zone (e.g., "Poor", "OK", "Good") */
  label?: string;
}

export interface BulletGraphProps {
  /** The actual value to display */
  actual: number;
  /** The maximum/target value (used to calculate percentages) */
  maximum: number;
  /** Label to display on the main bar (e.g., "15 casts") */
  actualLabel: string;
  /** Label to display at the target marker (e.g., "Max 20") */
  maximumLabel: string;
  /** Color for the main progress bar */
  barColor: string;
  /** Performance ranges to display in the background */
  performanceRanges?: PerformanceRange[];
  /** Optional secondary metric (e.g., wasted time) */
  secondaryMetric?: {
    /** Value as percentage of fight duration (0-100) */
    value: number;
    /** Label to display (e.g., "5s capped") */
    label: string;
    /** Color for the secondary bar */
    color: string;
  };
  /** Optional CSS class name */
  className?: string;
}

/**
 * BulletGraph component for visualizing performance metrics.
 */
export default function BulletGraph({
  actual,
  maximum,
  actualLabel,
  maximumLabel,
  barColor,
  performanceRanges,
  secondaryMetric,
  className,
}: BulletGraphProps) {
  const percentage = Math.min((actual / maximum) * 100, 100);

  return (
    <Container className={className}>
      <GraphBackground>
        {performanceRanges?.map((range, index) => (
          <PerformanceZone key={index} width={range.width} color={range.color} />
        ))}
      </GraphBackground>

      <MainBar width={percentage} color={barColor}>
        <BarLabel>{actualLabel}</BarLabel>
      </MainBar>

      <TargetMarker>
        <TargetLine />
        <TargetLabel>{maximumLabel}</TargetLabel>
      </TargetMarker>

      {secondaryMetric && (
        <SecondaryBar>
          <SecondaryFill width={secondaryMetric.value} color={secondaryMetric.color} />
          <SecondaryLabel position={secondaryMetric.value}>{secondaryMetric.label}</SecondaryLabel>
        </SecondaryBar>
      )}
    </Container>
  );
}

// Styled Components

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GraphBackground = styled.div`
  width: 100%;
  height: 32px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const PerformanceZone = styled.div<{ width: number; color: string }>`
  width: ${(props) => props.width}%;
  height: 100%;
  background: ${(props) => props.color};
  position: relative;
`;

const MainBar = styled.div<{ width: number; color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  width: ${(props) => props.width}%;
  height: 32px;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  padding-left: 8px;
  transition: width 0.3s ease;
  border-radius: 4px 0 0 4px;
`;

const BarLabel = styled.span`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  -webkit-text-stroke: 2px rgba(0, 0, 0, 0.8);
  paint-order: stroke fill;
`;

const TargetMarker = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  height: 32px;
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  z-index: 10;
`;

const TargetLine = styled.div`
  width: 3px;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
`;

const TargetLabel = styled.span`
  position: absolute;
  bottom: -25px;
  right: -10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.6rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: right;
`;

const SecondaryBar = styled.div`
  width: 100%;
  height: 20px;
  position: relative;
  overflow: hidden;
`;

const SecondaryFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${(props) => props.width}%;
  background: ${(props) => props.color};
  transition: width 0.3s ease;
  opacity: 0.7;
`;

const SecondaryLabel = styled.span<{ position: number }>`
  position: absolute;
  left: ${(props) => props.position}%;
  top: 50%;
  transform: translateY(-50%);
  padding-left: 6px;
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
`;
